// src/pages/Payment.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiCreditCard,
  FiDollarSign,
  FiCheckCircle
} from 'react-icons/fi';
import { paymentService } from '../services';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('online');
  const [processing, setProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    if (!location.state) {
      toast.error('Invalid checkout session');
      navigate('/checkout');
      return;
    }
    setCheckoutData(location.state);
  }, [location, navigate]);

  const handlePayment = async () => {
    if (!checkoutData) return;

    setProcessing(true);

    try {
      const response = await paymentService.createOrder(
        checkoutData.addressId,
        paymentMethod,
        checkoutData.couponCode
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to create order');
      }

      if (!response.order || !response.order._id) {
        throw new Error('Order created but ID is missing');
      }

      if (paymentMethod === 'cod') {
        try {
          await clearCart();
        } catch (cartError) {
          console.error('Failed to clear cart (non-critical):', cartError);
        }

        toast.success('Order placed successfully');
        navigate(`/orders/${response.order._id}`, {
          state: { orderPlaced: true }
        });
      } else {
        await handleOnlinePayment(response);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(
        error.response?.data?.message || error.message || 'Payment failed'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleOnlinePayment = async (orderResponse) => {
    try {
      const orderId = orderResponse.order._id;
      if (!orderId) {
        throw new Error('Invalid order response - missing order ID');
      }

      const scriptLoaded = await paymentService.loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.razorpayOrder.amount,
        currency: orderResponse.razorpayOrder.currency,
        name: 'ShopAura',
        description: `Order #${orderResponse.order.orderNumber}`,
        order_id: orderResponse.razorpayOrder.id,
        handler: async (response) => {
          try {
            const verifyResponse = await paymentService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              orderId
            );

            if (verifyResponse.success) {
              try {
                await clearCart();
              } catch (cartError) {
                console.error(
                  'Failed to clear cart (non-critical):',
                  cartError
                );
              }

              toast.success('Payment successful');
              navigate(`/orders/${orderId}`, {
                state: { orderPlaced: true, paymentSuccess: true }
              });
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');

            try {
              await paymentService.handlePaymentFailure(
                orderResponse.razorpayOrder.id,
                error.message
              );
            } catch (failureError) {
              console.error(
                'Failed to record payment failure:',
                failureError
              );
            }
          }
        },
        prefill: {
          name: orderResponse.order.user?.name || '',
          email: orderResponse.order.user?.email || '',
          contact: orderResponse.order.shippingAddress?.phone || ''
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: async () => {
            toast.error('Payment cancelled');

            try {
              await paymentService.handlePaymentFailure(
                orderResponse.razorpayOrder.id,
                'Payment cancelled by user'
              );
            } catch (error) {
              console.error(
                'Failed to record payment cancellation:',
                error
              );
            }

            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      toast.error('Failed to initialize payment');
      setProcessing(false);
    }
  };

  if (!checkoutData) {
    return <LoadingSpinner fullScreen message="Loading payment..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 md:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-1">
            Payment
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Choose your payment method
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] gap-5 md:gap-6">
          {/* Methods */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
              <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3">
                Select payment method
              </h2>

              <div className="space-y-3">
                {/* Online */}
                <label
                  className={`block rounded-xl border-2 p-3.5 cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <FiCreditCard
                          className="text-purple-600"
                          size={18}
                        />
                        <span className="text-sm font-semibold text-slate-900">
                          Online payment
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Pay via card, UPI, net banking or wallets.
                      </p>
                    </div>
                    {paymentMethod === 'online' && (
                      <FiCheckCircle
                        className="text-purple-600 flex-shrink-0"
                        size={18}
                      />
                    )}
                  </div>
                </label>

                {/* COD */}
                <label
                  className={`block rounded-xl border-2 p-3.5 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <FiDollarSign
                          className="text-emerald-600"
                          size={18}
                        />
                        <span className="text-sm font-semibold text-slate-900">
                          Cash on delivery
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Pay in cash when your order is delivered.
                      </p>
                    </div>
                    {paymentMethod === 'cod' && (
                      <FiCheckCircle
                        className="text-purple-600 flex-shrink-0"
                        size={18}
                      />
                    )}
                  </div>
                </label>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">Secure payment:</span> Your
                  payment details are encrypted and never stored.
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 sticky top-20">
              <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3">
                Order summary
              </h2>

              <div className="space-y-2.5 border-b border-slate-200 pb-3 mb-3 text-sm">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    ₹{checkoutData.cartTotal.toLocaleString()}
                  </span>
                </div>

                {checkoutData.discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-semibold">
                      -₹{checkoutData.discount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-700">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {checkoutData.shipping === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      `₹${checkoutData.shipping}`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm md:text-base font-semibold text-slate-900 mb-4">
                <span>Total</span>
                <span>₹{checkoutData.total.toLocaleString()}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-2.5 md:py-3 rounded-full text-sm md:text-base font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing…
                  </>
                ) : paymentMethod === 'online' ? (
                  'Pay now'
                ) : (
                  'Place order'
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center mt-3">
                By placing this order, you agree to ShopAura&apos;s Terms &
                Conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

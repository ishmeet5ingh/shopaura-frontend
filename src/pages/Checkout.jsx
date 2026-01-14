// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiTruck, FiTag, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { addressService, checkoutService } from '../services';
import toast from 'react-hot-toast';
import AddressCard from '../components/AddressCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal } = useCart();

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);

  const SHIPPING_CHARGE = 50;
  const FREE_SHIPPING_THRESHOLD = 500;

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!loading && cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/products');
    }
  }, [cart, loading, navigate]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getAllAddresses();

      if (response.success) {
        setAddresses(response.addresses || []);

        const defaultAddress = (response.addresses || []).find(
          (addr) => addr.isDefault
        );
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setApplying(true);
    try {
      const response = await checkoutService.validateCoupon(
        couponCode.trim(),
        cartTotal
      );

      if (response.success) {
        setAppliedCoupon(response.coupon);
        setDiscount(response.discount || 0);
        toast.success(`Coupon applied! You saved ₹${response.discount}`);
      }
    } catch (error) {
      console.error('Apply coupon error:', error);
      toast.error(
        error.response?.data?.message || 'Invalid coupon code'
      );
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await checkoutService.removeCoupon();
      setAppliedCoupon(null);
      setDiscount(0);
      setCouponCode('');
      toast.success('Coupon removed');
    } catch (error) {
      console.error('Remove coupon error:', error);
    }
  };

  const calculateShipping = () =>
    cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;

  const calculateTotal = () => {
    const shipping = calculateShipping();
    return cartTotal + shipping - discount;
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    navigate('/payment', {
      state: {
        addressId: selectedAddress,
        cartTotal,
        discount,
        shipping: calculateShipping(),
        total: calculateTotal(),
        couponCode: appliedCoupon?.code
      }
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading checkout..." />;
  }

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-1">
            Checkout
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Complete your order
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-5 md:gap-6">
          {/* Left Column */}
          <div className="space-y-5 md:space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FiMapPin className="text-purple-600" size={18} />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-slate-900">
                    Delivery address
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500">
                    Select where you want your order delivered.
                  </p>
                </div>
              </div>

              {addresses.length === 0 ? (
                <EmptyState
                  icon="package"
                  title="No addresses found"
                  description="Add a delivery address to continue."
                  actionLabel="Add address"
                  onAction={() => navigate('/addresses')}
                />
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <AddressCard
                      key={address._id}
                      address={address}
                      selectable
                      selected={selectedAddress === address._id}
                      onSelect={setSelectedAddress}
                    />
                  ))}

                  <button
                    onClick={() => navigate('/addresses')}
                    className="w-full py-2.5 border border-dashed border-slate-300 text-xs md:text-sm text-slate-600 rounded-xl font-medium hover:border-purple-400 hover:text-purple-600 transition-colors"
                  >
                    + Add new address
                  </button>
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <FiTag className="text-emerald-600" size={18} />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-slate-900">
                    Apply coupon
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500">
                    Enter your coupon code if you have one.
                  </p>
                </div>
              </div>

              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-xs text-emerald-700">
                        You saved ₹{discount.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applying || !couponCode.trim()}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? 'Applying…' : 'Apply'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column – Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 sticky top-20">
              <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3">
                Order summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item._id || item.product?._id}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={
                        item.product?.images?.[0]?.url ||
                        item.product?.thumbnail?.url ||
                        'https://placehold.co/64x64?text=Item'
                      }
                      alt={item.product?.name || 'Product'}
                      className="w-12 h-12 object-cover rounded-lg bg-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">
                      ₹
                      {(
                        (item.price || 0) * item.quantity
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2.5 text-sm">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    ₹{cartTotal.toLocaleString()}
                  </span>
                </div>

                {/* Discount */}
                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-semibold">
                      -₹{discount.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-1">
                    <FiTruck size={14} />
                    <span>Shipping</span>
                  </div>
                  <span className="font-semibold">
                    {calculateShipping() === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      `₹${calculateShipping()}`
                    )}
                  </span>
                </div>

                {/* Free shipping progress */}
                {cartTotal < FREE_SHIPPING_THRESHOLD && (
                  <div className="mt-1 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                    <p className="text-[11px] text-blue-800 mb-1.5">
                      Add ₹
                      {(
                        FREE_SHIPPING_THRESHOLD - cartTotal
                      ).toLocaleString()}{' '}
                      more for free shipping.
                    </p>
                    <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (cartTotal / FREE_SHIPPING_THRESHOLD) * 100,
                            100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between text-sm md:text-base font-semibold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Proceed */}
              <button
                onClick={handleProceedToPayment}
                disabled={!selectedAddress}
                className="w-full mt-4 py-2.5 md:py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 text-sm md:text-base"
              >
                Proceed to payment
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

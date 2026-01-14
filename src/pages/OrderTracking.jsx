// src/pages/OrderTracking.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin
} from 'react-icons/fi';
import { orderService } from '../services';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';

const OrderTracking = () => {
  const { orderId } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchTracking();
    }
  }, [orderId]);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const response = await orderService.trackOrder(orderId);

      if (response.success) {
        setTracking(response.tracking);
      }
    } catch (error) {
      console.error('Failed to fetch tracking:', error);
      toast.error('Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="text-amber-500" size={20} />;
      case 'confirmed':
      case 'processing':
        return <FiPackage className="text-sky-500" size={20} />;
      case 'shipped':
      case 'out_for_delivery':
        return <FiTruck className="text-indigo-500" size={20} />;
      case 'delivered':
        return <FiCheckCircle className="text-emerald-500" size={20} />;
      default:
        return <FiClock className="text-slate-400" size={20} />;
    }
  };

  const trackingSteps = [
    { status: 'pending', label: 'Order placed' },
    { status: 'confirmed', label: 'Order confirmed' },
    { status: 'processing', label: 'Processing' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'out_for_delivery', label: 'Out for delivery' },
    { status: 'delivered', label: 'Delivered' }
  ];

  const getCurrentStepIndex = () => {
    if (!tracking) return 0;

    const currentStatus = tracking.order?.status || tracking.currentStatus;
    if (!currentStatus) return 0;

    const idx = trackingSteps.findIndex(
      (step) => step.status === currentStatus
    );
    return idx === -1 ? 0 : idx;
  };

  if (loading) {
    return (
      <LoadingSpinner fullScreen message="Loading tracking information..." />
    );
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-slate-100 py-6 md:py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm md:text-base text-slate-600">
            Failed to load tracking information.
          </p>
          <Link
            to="/orders"
            className="inline-flex items-center justify-center mt-4 px-5 py-2.5 rounded-full text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();
  const orderNumber =
    tracking.order?.orderNumber || tracking.orderNumber || '';
  const orderStatus =
    tracking.order?.status || tracking.currentStatus || 'pending';
  const estimatedDelivery =
    tracking.estimatedDelivery || tracking.order?.estimatedDeliveryDate;
  const shippingAddress = tracking.order?.shippingAddress;
  const timeline = tracking.timeline || {};
  const history = tracking.history || [];
  const currentLocation = tracking.currentLocation;

  return (
    <div className="min-h-screen bg-slate-100 py-6 md:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Track your order
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Order #{orderNumber}
          </p>
        </div>

        {/* Current status card */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl shadow-md p-4 md:p-5 mb-5 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/15 rounded-xl p-3 flex items-center justify-center">
              {getStatusIcon(orderStatus)}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide opacity-80">
                Current status
              </p>
              <p className="text-lg md:text-xl font-semibold capitalize">
                {orderStatus.replace(/_/g, ' ')}
              </p>
              {estimatedDelivery && (
                <p className="text-xs md:text-sm opacity-90 mt-1">
                  Estimated delivery:{' '}
                  {format(new Date(estimatedDelivery), 'PPP')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progress timeline */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 mb-5">
          <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-4">
            Order timeline
          </h2>

          <div className="relative">
            {/* Base line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
            {/* Progress line */}
            <div
              className="absolute left-5 top-0 w-0.5 bg-purple-500 transition-all duration-500"
              style={{
                height: `${(currentStep / (trackingSteps.length - 1)) * 100}%`
              }}
            />

            <div className="space-y-5 md:space-y-6">
              {trackingSteps.map((step, index) => {
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;

                let stepTimestamp = null;
                if (timeline[step.status]) {
                  stepTimestamp = timeline[step.status];
                } else if (history.length > 0) {
                  const entry = history.find(
                    (h) => h.status === step.status
                  );
                  stepTimestamp =
                    entry?.changedAt || entry?.timestamp || null;
                }

                return (
                  <div
                    key={step.status}
                    className="relative flex items-start gap-3"
                  >
                    {/* Dot / icon circle */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs transition-all ${
                        isCompleted
                          ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <FiCheckCircle size={16} />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 pt-0.5">
                      <p
                        className={`text-sm font-medium ${
                          isCompleted
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </p>

                      {stepTimestamp && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {format(new Date(stepTimestamp), 'PPp')}
                        </p>
                      )}

                      {isCurrent && currentLocation && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-purple-600">
                          <FiMapPin size={12} />
                          <span>{currentLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delivery address */}
        {shippingAddress && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 mb-5">
            <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-3">
              Delivery address
            </h2>
            <div className="space-y-1 text-xs md:text-sm text-slate-700">
              <p className="font-semibold">
                {shippingAddress.fullName}
              </p>
              <p>{shippingAddress.addressLine1}</p>
              {shippingAddress.addressLine2 && (
                <p>{shippingAddress.addressLine2}</p>
              )}
              <p>
                {shippingAddress.city}, {shippingAddress.state} -{' '}
                {shippingAddress.pincode}
              </p>
              <p>{shippingAddress.country}</p>
              <div className="flex items-center gap-2 pt-2">
                <FiMapPin size={14} className="text-slate-500" />
                <span>{shippingAddress.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-2">
          <Link
            to={`/orders/${orderId}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full text-xs md:text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors text-center"
          >
            View order details
          </Link>
          <Link
            to="/orders"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full text-xs md:text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors text-center"
          >
            All orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

// src/pages/Orders.jsx
import { useState, useEffect } from 'react';
import { orderService } from '../services';
import toast from 'react-hot-toast';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();

      if (response.success) {
        setOrders(response.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter((order) => order.orderStatus === filter);
  };

  const filteredOrders = filterOrders();

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading orders..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              My orders
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Track and manage your orders
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 md:p-4 mb-5">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all ${
                  filter === f.value
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <EmptyState
              icon="package"
              title="No orders found"
              description={
                filter === 'all'
                  ? "You haven't placed any orders yet. Start shopping!"
                  : `No ${filter} orders found.`
              }
              actionLabel="Start shopping"
              onAction={() => navigate('/products')}
            />
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

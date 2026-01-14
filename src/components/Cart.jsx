// src/components/Cart.jsx
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import {
  FiX,
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiArrowRight,
  FiLoader
} from 'react-icons/fi';

const Cart = () => {
  const {
    cartItems,
    isCartOpen,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getCartTotal,
    setIsCartOpen,
    loading
  } = useCart();

  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <FiShoppingCart size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Shopping cart
              </h2>
              <p className="text-xs text-slate-500">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <FiLoader className="animate-spin text-purple-600" size={28} />
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="h-20 w-20 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <FiShoppingCart size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Your cart is empty
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Add products to get started!
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/products');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm"
              >
                Browse products
                <FiArrowRight size={16} />
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const product = item.product;
              const productId = product._id || product;
              const productName = product.name || 'Product';
              const productImage =
                product.thumbnail?.url || product.images?.[0]?.url;
              const productPrice = item.finalPrice || item.price || 0;

              return (
                <div
                  key={productId}
                  className="flex gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all"
                >
                  {/* Product Image */}
                  <img
                    src={productImage || 'https://via.placeholder.com/100'}
                    alt={productName}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100';
                    }}
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-1">
                      {productName}
                    </h3>
                    <p className="text-purple-600 font-semibold text-base mb-2">
                      ₹{productPrice}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decrementQuantity(productId)}
                        disabled={loading}
                        className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="font-semibold text-slate-900 w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementQuantity(productId)}
                        disabled={loading}
                        className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiPlus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(productId)}
                        disabled={loading}
                        className="ml-auto p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-200 p-4 space-y-4 bg-slate-50">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700 text-sm">
                Subtotal:
              </span>
              <span className="font-semibold text-xl text-slate-900">
                ₹{getCartTotal().toFixed(2)}
              </span>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white rounded-full text-sm font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to checkout
                <FiArrowRight size={16} />
              </button>
              <button
                onClick={clearCart}
                disabled={loading}
                className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear cart
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Cart;

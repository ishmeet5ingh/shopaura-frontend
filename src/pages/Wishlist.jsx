// src/pages/Wishlist.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
  FiStar,
  FiArrowRight,
  FiShoppingBag,
  FiPackage,
  FiLoader
} from 'react-icons/fi';

const Wishlist = () => {
  const {
    wishlistItems: wishlist,
    toggleWishlist,
    loading,
    syncWishlistFromAPI
  } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      syncWishlistFromAPI();
    }
  }, [isAuthenticated, syncWishlistFromAPI]);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleWishlistAction = async (product) => {
    try {
      await toggleWishlist(product);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleClearAll = async () => {
    if (
      wishlist.length > 0 &&
      window.confirm(`Remove all ${wishlist.length} items from wishlist?`)
    ) {
      for (const product of wishlist) {
        try {
          await toggleWishlist(product);
        } catch (error) {
          console.error('Failed to remove item:', error);
        }
      }
    }
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={
          i < Math.round(rating)
            ? 'text-amber-400 fill-amber-400'
            : 'text-slate-300'
        }
        size={12}
      />
    ));

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4">
            <FiLoader size={20} className="text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            Loading your wishlist…
          </h2>
          <p className="text-sm text-slate-500">
            Syncing items with your account.
          </p>
        </div>
      </div>
    );
  }

  // NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 px-6 py-10 md:px-10 md:py-12 text-center">
            <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FiHeart size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
              Login to view your wishlist
            </h2>
            <p className="text-sm md:text-base text-slate-500 mb-6 max-w-md mx-auto">
              Sign in to access your saved items across devices.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg transition-all"
            >
              Go to login
              <FiArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY WISHLIST
  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 px-6 py-10 md:px-10 md:py-12 text-center">
            <div className="relative mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-purple-200/40 blur-2xl" />
              <div className="relative h-20 w-20 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <FiHeart size={32} />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-sm md:text-base text-slate-500 mb-6 max-w-md mx-auto">
              Save your favourite items to quickly find them when you are ready
              to buy.
            </p>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg transition-all"
            >
              <FiShoppingBag size={16} />
              Start shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN WISHLIST
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <FiHeart size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                My wishlist
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                {wishlist.length}{' '}
                {wishlist.length === 1 ? 'item saved' : 'items saved'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleClearAll();
            }}
            disabled={loading || wishlist.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiTrash2 size={16} />
            Clear all ({wishlist.length})
          </button>
        </div>

        {/* Wishlist grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="group relative bg-white rounded-xl border border-slate-200 hover:border-purple-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Image */}
              <div
                className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer"
                onClick={() =>
                  navigate(`/product/${product.slug || product._id}`)
                }
              >
                <img
                  src={
                    product.thumbnail?.url ||
                    product.images?.[0]?.url ||
                    'https://via.placeholder.com/400'
                  }
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.target.src =
                      'https://via.placeholder.com/400?text=Product';
                  }}
                />

                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm">
                    {product.discount}% OFF
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleWishlistAction(product);
                  }}
                  disabled={loading}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-slate-700 hover:bg-red-500 hover:text-white border border-slate-200 hover:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove from wishlist"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiTrash2 size={14} />
                  )}
                </button>

                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="bg-white px-4 py-1.5 rounded-full text-xs font-semibold text-slate-900 shadow-sm">
                      Out of stock
                    </div>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-3 space-y-2">
                <h3
                  className="text-sm font-semibold text-slate-900 line-clamp-2 cursor-pointer hover:text-purple-600"
                  onClick={() =>
                    navigate(`/product/${product.slug || product._id}`)
                  }
                >
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    {renderStars(product.averageRating || 0)}
                  </div>
                  <span className="text-[11px] font-medium text-slate-900">
                    {product.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ({product.reviewCount || 0})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 pt-1 border-t border-slate-100">
                  <span className="text-base font-semibold text-purple-600">
                    ₹{product.finalPrice || product.price}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{product.price}
                    </span>
                  )}
                </div>

                {/* Stock badge */}
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium">
                    Only {product.stock} left
                  </span>
                )}

                {/* Add to cart */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  disabled={product.stock === 0}
                  className={`w-full mt-1.5 py-2 rounded-full text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                    isInCart(product._id)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FiShoppingCart size={14} />
                  {isInCart(product._id) ? 'In cart' : 'Add to cart'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm md:text-base font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
          >
            <FiPackage size={18} />
            Continue shopping
            <FiArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

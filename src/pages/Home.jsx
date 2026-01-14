// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import API from '../services/api';
import {
  FiShoppingBag,
  FiTrendingUp,
  FiStar,
  FiShield,
  FiHeart,
  FiPackage,
  FiTruck,
  FiHeadphones,
  FiAward,
  FiUsers,
  FiArrowRight,
  FiShoppingCart,
  FiTag,
  FiGift,
  FiPercent
} from 'react-icons/fi';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const categoriesRes = await API.get('/categories');
      let allCategories = [];
      if (categoriesRes.data.data) {
        allCategories = categoriesRes.data.data;
      } else if (Array.isArray(categoriesRes.data)) {
        allCategories = categoriesRes.data;
      } else if (categoriesRes.data.categories) {
        allCategories = categoriesRes.data.categories;
      }

      const parentCategories = allCategories.filter(
        (cat) => !cat.parent && cat.isActive !== false
      );
      const featured = parentCategories.filter((cat) => cat.isFeatured);

      let categoriesToShow = [];
      if (featured.length >= 8) {
        categoriesToShow = featured.slice(0, 8);
      } else if (featured.length > 0) {
        categoriesToShow = [
          ...featured,
          ...parentCategories
            .filter((cat) => !cat.isFeatured)
            .slice(0, 8 - featured.length)
        ];
      } else {
        categoriesToShow = parentCategories.slice(0, 8);
      }

      setCategories(parentCategories);
      setFeaturedCategories(categoriesToShow);

      const productsRes = await API.get('/products?limit=8&sort=-createdAt');
      let fetchedProducts = [];
      if (productsRes.data.data?.products) {
        fetchedProducts = productsRes.data.data.products;
      } else if (
        productsRes.data.data &&
        Array.isArray(productsRes.data.data)
      ) {
        fetchedProducts = productsRes.data.data;
      } else if (Array.isArray(productsRes.data.products)) {
        fetchedProducts = productsRes.data.products;
      } else if (Array.isArray(productsRes.data)) {
        fetchedProducts = productsRes.data;
      }

      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(
        error.response?.data?.message ||
          'Failed to load data. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category.slug}`);
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.slug || product._id}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlistToggle = (e, product) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={
          i < Math.round(rating)
            ? 'text-amber-400 fill-amber-400'
            : 'text-slate-300'
        }
        size={14}
      />
    ));
  };

  const stats = [
    { icon: FiUsers, value: '50K+', label: 'Happy customers' },
    { icon: FiPackage, value: '100K+', label: 'Products' },
    { icon: FiAward, value: '4.8/5', label: 'Average rating' },
    { icon: FiTruck, value: '24/7', label: 'Fast delivery' }
  ];

  const features = [
    {
      icon: FiShield,
      title: 'Secure shopping',
      description: 'Protected payments and verified sellers.'
    },
    {
      icon: FiTruck,
      title: 'Fast delivery',
      description: 'Quick shipping on thousands of products.'
    },
    {
      icon: FiHeadphones,
      title: '24/7 support',
      description: 'Always-on customer care when you need it.'
    },
    {
      icon: FiGift,
      title: 'Easy returns',
      description: 'Hassle-free 30-day return policy.'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading amazing products…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-purple-600">
        {/* pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
    
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-[320px] lg:min-h-[340px] flex items-center py-4 md:py-6 lg:py-6">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center w-full">
              {/* Left content */}
              <div className="text-white">
                {isAuthenticated && user && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-medium mb-3">
                    <span>👋</span>
                    Welcome back, {user.name}
                  </div>
                )}

                <h1 className="text-3xl md:text-3xl lg:text-[35px] font-semibold tracking-tight mb-3 leading-tight">
                  Discover products from{' '}
                  <span className="text-purple-100">trusted sellers</span>
                </h1>

                <p className="text-sm md:text-[15px] text-purple-100 mb-5 max-w-xl leading-relaxed">
                  ShopAura brings you curated collections, secure checkout and
                  fast delivery across {categories.length || 0}+ categories.
                </p>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <button
                    onClick={() => navigate('/products')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-purple-700 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all"
                  >
                    <FiShoppingBag size={18} />
                    Start shopping
                  </button>
                  {!isAuthenticated && (
                    <button
                      onClick={() => navigate('/register')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all"
                    >
                      Create account
                      <FiArrowRight size={16} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-purple-100">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Secure payments
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    Verified sellers
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-300" />
                    Easy returns
                  </div>
                </div>
              </div>

              {/* Right: Today's picks card */}
              <div className="relative max-w-md mx-auto lg:mx-0 w-full lg:mt-2">
                <div className="rounded-3xl bg-white shadow-2xl p-4 md:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <FiTrendingUp size={15} />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Today&apos;s picks
                      </h3>
                    </div>
                    <span className="text-xs text-purple-600 font-medium">
                      Fresh arrivals
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 mb-8">
                    {products.slice(0, 6).map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleProductClick(product)}
                        className="text-left rounded-2xl border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all overflow-hidden bg-slate-50"
                      >
                        <div className="aspect-square bg-white overflow-hidden">
                          <img
                            src={
                              product.thumbnail?.url ||
                              product.images?.[0]?.url ||
                              'https://placehold.co/200x200?text=Product'
                            }
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.src =
                                'https://placehold.co/200x200?text=Product';
                            }}
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium text-slate-800 line-clamp-1 mb-0.5">
                            {product.name}
                          </p>
                          <p className="text-xs font-semibold text-purple-600">
                            ₹{product.finalPrice || product.price}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/products')}
                    className="w-full px-4 py-2 rounded-full text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Browse all products
                    <FiArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="py-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <stat.icon size={20} />
                </div>
                <div className="text-xl md:text-2xl font-semibold mb-0.5">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center shadow-sm">
              <p className="text-red-600 font-semibold mb-3 text-sm">{error}</p>
              <button
                onClick={fetchHomeData}
                className="px-5 py-2 rounded-full text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors shadow"
              >
                Try again
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      <section className="py-8 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-purple-100 text-purple-600 shadow-sm">
                <FiTag />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold">
                  Featured categories
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Explore top collections curated for you.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/categories')}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-700 bg-white shadow-sm transition-colors"
            >
              View all
              <FiArrowRight size={14} />
            </button>
          </div>

          {featuredCategories.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-white shadow-sm border border-slate-100">
              <div className="text-5xl mb-3">📦</div>
              <p className="text-slate-600 font-medium text-sm">
                No categories available yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredCategories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryClick(category)}
                  className="text-left group"
                >
                  <div className="relative bg-white rounded-3xl border border-slate-100 hover:border-purple-200 hover:shadow-lg transition-all overflow-hidden">
                    <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                      <img
                        src={
                          category.image?.url ||
                          'https://via.placeholder.com/400'
                        }
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.src =
                            'https://via.placeholder.com/400?text=' +
                            encodeURIComponent(category.name);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium text-white">
                          Shop now
                        </span>
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-purple-600 shadow-sm">
                          <FiArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-slate-900 mb-1 truncate">
                        {category.name}
                      </h3>
                      {category.productCount > 0 && (
                        <p className="text-xs text-purple-600 font-medium">
                          {category.productCount} items
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-purple-100 text-purple-600 shadow-sm">
                <FiTrendingUp />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold">
                  Trending products
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Popular picks chosen by our shoppers.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-700 bg-white shadow-sm transition-colors"
            >
              View all
              <FiArrowRight size={14} />
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-white border border-slate-100 shadow-sm">
              <div className="text-5xl mb-3">🛍️</div>
              <p className="text-slate-600 font-medium text-sm">
                No products available yet.
              </p>
              <p className="text-xs text-slate-500">
                Products will appear here once added by sellers.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product)}
                    onMouseEnter={() => setHoveredProduct(product._id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    className="group cursor-pointer"
                  >
                    <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden">
                      <div className="relative aspect-square bg-slate-50 overflow-hidden">
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

                        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                          {product.discount > 0 && (
                            <span className="inline-flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-[10px] font-semibold shadow-sm">
                              <FiPercent size={10} />
                              {product.discount}% OFF
                            </span>
                          )}

                          <button
                            onClick={(e) => handleWishlistToggle(e, product)}
                            className={`ml-auto p-1.5 rounded-full border text-slate-700 bg-white/90 hover:text-red-500 hover:border-red-200 transition-colors ${
                              hoveredProduct === product._id
                                ? 'opacity-100'
                                : 'opacity-0'
                            }`}
                          >
                            <FiHeart
                              size={14}
                              className={
                                isInWishlist(product._id) ? 'fill-red-500' : ''
                              }
                            />
                          </button>
                        </div>

                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="bg-white px-4 py-2 rounded-full text-xs font-semibold text-slate-900 shadow-sm">
                              Out of stock
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-sm md:text-base text-slate-900 line-clamp-2">
                          {product.name}
                        </h3>

                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-0.5">
                            {renderStars(product.averageRating || 0)}
                          </div>
                          <span className="text-xs font-semibold text-slate-900">
                            {product.averageRating?.toFixed(1) || '0.0'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ({product.reviewCount || 0})
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-purple-600">
                              ₹{product.finalPrice || product.price}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-xs text-slate-400 line-through">
                                ₹{product.price}
                              </span>
                            )}
                          </div>
                          {product.stock > 0 && (
                            <span className="text-[11px] font-medium text-green-600">
                              {product.stock > 0 && product.stock <= 10
                                ? 'Low stock'
                                : 'In stock'}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.stock === 0}
                          className={`w-full mt-2 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                            isInCart(product._id)
                              ? 'bg-green-500 text-white'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <FiShoppingCart />
                          {isInCart(product._id) ? 'In cart' : 'Add to cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate('/products')}
                  className="inline-flex items-center gap-2 px-10 py-3 rounded-full text-sm md:text-base font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <span>Explore all products</span>
                  <FiArrowRight />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-8 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-1">
              Why shop with ShopAura?
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Simple, safe and convenient shopping experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl border border-slate-100 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <feature.icon size={18} />
                </div>
                <h3 className="font-semibold text-sm md:text-base mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-8 bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">
            Ready to start your shopping journey?
          </h2>
          <p className="text-sm md:text-base text-purple-100 mb-6 max-w-xl mx-auto">
            Join thousands of customers enjoying a seamless shopping experience
            on ShopAura.
          </p>

          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm md:text-base font-semibold bg-white text-purple-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <FiShoppingCart />
                Create free account
              </button>
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm md:text-base font-semibold border border-purple-200 text-white hover:bg-purple-500 transition-colors"
              >
                Browse products
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm md:text-base font-semibold bg-white text-purple-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FiShoppingBag />
              Start shopping now
            </button>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs md:text-sm text-purple-100">
            <div className="flex items-center gap-2">
              <FiShield />
              <span>100% secure payments</span>
            </div>
            <div className="flex items-center gap-2">
              <FiTruck />
              <span>Free shipping over ₹500</span>
            </div>
            <div className="flex items-center gap-2">
              <FiAward />
              <span>Top rated platform</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

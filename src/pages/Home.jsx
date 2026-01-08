import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  FiShoppingBag, 
  FiTrendingUp, 
  FiStar, 
  FiShield, 
  FiZap, 
  FiHeart,
  FiPackage,
  FiCreditCard,
  FiTruck,
  FiHeadphones,
  FiAward,
  FiUsers,
  FiArrowRight,
  FiShoppingCart
} from 'react-icons/fi';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <FiShoppingBag className="w-8 h-8" />,
      title: 'Wide Selection',
      description: 'Thousands of products across multiple categories',
      linear: 'from-purple-500 to-pink-500'
    },
    {
      icon: <FiTruck className="w-8 h-8" />,
      title: 'Fast Delivery',
      description: 'Free shipping on orders above $50',
      linear: 'from-pink-500 to-orange-500'
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: 'Secure Payment',
      description: 'Your transactions are 100% secure',
      linear: 'from-orange-500 to-amber-500'
    },
    {
      icon: <FiHeadphones className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'Always here to help you shop better',
      linear: 'from-purple-600 to-indigo-500'
    }
  ];

  const stats = [
    { icon: <FiUsers className="w-8 h-8" />, value: '50K+', label: 'Happy Customers' },
    { icon: <FiPackage className="w-8 h-8" />, value: '100K+', label: 'Products Sold' },
    { icon: <FiStar className="w-8 h-8" />, value: '4.9/5', label: 'Average Rating' },
    { icon: <FiAward className="w-8 h-8" />, value: '15+', label: 'Awards Won' }
  ];

  const categories = [
    { name: 'Electronics', emoji: '📱', color: 'from-blue-400 to-blue-600' },
    { name: 'Fashion', emoji: '👗', color: 'from-pink-400 to-pink-600' },
    { name: 'Home & Living', emoji: '🏠', color: 'from-green-400 to-green-600' },
    { name: 'Beauty', emoji: '💄', color: 'from-purple-400 to-purple-600' },
    { name: 'Sports', emoji: '⚽', color: 'from-orange-400 to-orange-600' },
    { name: 'Books', emoji: '📚', color: 'from-indigo-400 to-indigo-600' }
  ];

  const benefits = [
    { icon: <FiCreditCard />, text: 'Secure Payment' },
    { icon: <FiTruck />, text: 'Free Shipping' },
    { icon: <FiShield />, text: 'Money Back' },
    { icon: <FiZap />, text: 'Fast Delivery' }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-orange-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Logo */}
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                <span className="text-5xl">🛒</span>
                <h1 className="text-5xl font-extrabold">
                  <span className="bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    shop
                  </span>
                  <span className="bg-linear-to-r from-pink-500 to-amber-500 bg-clip-text text-transparent">
                    aura
                  </span>
                </h1>
              </div>

              <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Discover Your
                <span className="block bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Perfect Style
                </span>
              </h2>

              <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Shop the latest trends with exclusive deals. Your one-stop destination for everything you love.
              </p>

              {/* User Greeting Card - Only show if authenticated */}
              {isAuthenticated && user && (
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-t-4 border-purple-500">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-linear-to-r from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user.name}! 👋
                      </h3>
                      <p className="text-gray-600">{user.email}</p>
                      {user.role && (
                        <span className="inline-block mt-2 px-3 py-1 bg-linear-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-semibold capitalize">
                          {user.role} Account
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => navigate('/products')}
                  className="group px-8 py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  Start Shopping
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {!isAuthenticated && (
                  <button 
                    onClick={() => navigate('/login')}
                    className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg border-2 border-purple-200"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-4 mt-12">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-purple-100 to-pink-100 flex items-center justify-center text-purple-600">
                      {benefit.icon}
                    </div>
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Hero Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-125">
                {/* Decorative linear circles */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-linear-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-linear-to-r from-pink-400 to-orange-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>

                {/* Center illustration */}
                <div className="relative z-10 flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-64 h-64 mx-auto bg-linear-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                      <FiShoppingBag className="w-32 h-32 text-white" />
                    </div>
                    <div className="mt-8">
                      <div className="bg-white rounded-2xl shadow-xl p-4 inline-block animate-float">
                        <div className="flex items-center gap-3">
                          <FiStar className="w-6 h-6 text-yellow-500" />
                          <span className="font-bold text-gray-900">4.9/5 Rating</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-r from-purple-100 to-pink-100 text-purple-600 mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">ShopAura</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience shopping like never before with our premium features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-r ${feature.linear} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600">
              Explore our wide range of products
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => navigate('/products')}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-linear-to-r ${category.color} flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {category.emoji}
                </div>
                <h3 className="font-bold text-gray-900 text-center">
                  {category.name}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-linear-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 items-center p-12">
              <div className="text-white">
                <h2 className="text-4xl font-bold mb-4">
                  Ready to Start Shopping?
                </h2>
                <p className="text-xl text-purple-100 mb-8">
                  Join thousands of happy customers and discover amazing products today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => navigate('/products')}
                    className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                  >
                    <FiShoppingBag className="w-5 h-5" />
                    Browse Products
                  </button>
                  {!isAuthenticated && (
                    <button 
                      onClick={() => navigate('/register')}
                      className="px-8 py-4 bg-purple-800 text-white rounded-xl font-semibold hover:bg-purple-900 transition-all duration-300 shadow-lg border-2 border-white"
                    >
                      Create Account
                    </button>
                  )}
                </div>
              </div>

              <div className="hidden lg:flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <FiHeart className="w-32 h-32 text-white animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">🛒</span>
            <h3 className="text-3xl font-extrabold">
              <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                shop
              </span>
              <span className="bg-linear-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent">
                aura
              </span>
            </h3>
          </div>
          <p className="text-gray-400 mb-6">
            Your trusted shopping destination
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
          <p className="text-gray-500 text-sm mt-6">
            © 2026 ShopAura. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
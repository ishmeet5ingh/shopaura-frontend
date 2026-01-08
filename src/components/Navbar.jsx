import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">🛒</span>
            <span className="text-2xl font-extrabold">
              <span className="bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                shop
              </span>
              <span className="bg-linear-to-r from-pink-500 to-amber-500 bg-clip-text text-transparent">
                aura
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/products" 
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-semibold text-lg relative group"
                >
                  Products
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
                </Link>

                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-semibold text-lg relative group"
                >
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
                </Link>

                {/* User Profile Dropdown */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 px-4 py-2 bg-linear-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500">Welcome back</p>
                      <p className="font-bold text-gray-900">{user?.name}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="px-6 py-2.5 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-semibold text-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fadeIn">
            {isAuthenticated ? (
              <div className="space-y-4">
                {/* User Info Card */}
                <div className="flex items-center gap-3 p-4 bg-linear-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-linear-to-r from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Welcome back</p>
                    <p className="font-bold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                </div>

                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg font-semibold transition-colors"
                >
                  📦 Products
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg font-semibold transition-colors"
                >
                  📊 Dashboard
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg font-semibold text-center transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-center hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
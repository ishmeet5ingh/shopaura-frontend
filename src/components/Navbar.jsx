import NotificationBell from './NotificationBell';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useState, useEffect, useRef } from 'react';
import {
  FiShoppingBag,
  FiHome,
  FiGrid,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiSettings,
  FiPackage,
  FiChevronDown
} from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount, toggleCart } = useCart();
  const { getWishlistCount, navigateToWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: FiHome },
    { name: 'Products', path: '/products', icon: FiShoppingBag },
    { name: 'Categories', path: '/categories', icon: FiGrid }
  ];

  const userMenuItems = [
    { name: 'My Profile', path: '/profile', icon: FiUser },
    { name: 'My Orders', path: '/orders', icon: FiPackage },
    { name: 'Settings', path: '/settings', icon: FiSettings }
  ];

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  const avatarUrl =
    user?.profilePicture?.url ||
    user?.avatar ||
    user?.profileImage ||
    user?.photoUrl ||
    user?.profilePic;

  // version changes whenever backend sends a new user object
  const avatarVersion =
    user?.profilePicture?.updatedAt ||
    user?.updatedAt ||
    user?._id ||
    '';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200'
            : 'bg-white border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow">
                <FiShoppingBag size={20} className="md:w-5 md:h-5" />
              </div>
              <span className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent mr-3">
                ShopAura
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active =
                  link.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <link.icon size={18} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                  />
                  <FiSearch
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                </div>
              </form>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <NotificationBell />

                  {/* Wishlist */}
                  <button
                    onClick={navigateToWishlist}
                    className="relative p-2 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    title="Wishlist"
                  >
                    <FiHeart size={20} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[5px] rounded-full bg-red-500 text-white text-[10px] leading-[18px] font-semibold flex items-center justify-center shadow-sm">
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                  </button>

                  {/* Cart */}
                  <button
                    onClick={toggleCart}
                    className="relative p-2 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    title="Shopping cart"
                  >
                    <FiShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[5px] rounded-full bg-red-500 text-white text-[10px] leading-[18px] font-semibold flex items-center justify-center shadow-sm">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </button>

                  {/* User menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu((prev) => !prev)}
                      className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-purple-500 text-white flex items-center justify-center text-sm font-semibold ring-2 ring-white">
                        {avatarUrl ? (
                          <img
                            key={avatarVersion}
                            src={`${avatarUrl}?v=${avatarVersion}`}
                            alt={user?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{user?.name?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                        {user?.name}
                      </span>
                      <FiChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform ${
                          showUserMenu ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 py-2">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <div className="py-1">
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                            >
                              <item.icon size={16} />
                              <span>{item.name}</span>
                            </Link>
                          ))}
                        </div>

                        <div className="border-t border-slate-100 py-1">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleLogout();
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <FiLogOut size={16} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors rounded-xl hover:bg-slate-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow transition-all"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              >
                {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pl-10 text-sm border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                />
                <FiSearch
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-1">
              {navLinks.map((link) => {
                const active =
                  link.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <link.icon size={18} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {/* mobile auth section unchanged */}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;

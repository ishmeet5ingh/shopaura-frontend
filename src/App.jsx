// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import { SearchProvider } from './context/SearchContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Addresses from './pages/Addresses';
import Settings from './pages/Settings';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import OrderTracking from './pages/OrderTracking';
import Notifications from './pages/Notifications';

function App() {
  return (
    <Router>
      <ScrollToTop /> {/* ensure every route change scrolls to top */}
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <WishlistProvider>
              <SearchProvider>
                <Toaster position="top-right" />

                <Routes>
                  <Route path="/" element={<Layout />}>
                    {/* Public Routes */}
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="products" element={<Products />} />
                    <Route path="products/:id" element={<ProductDetail />} />

                    {/* Categories */}
                    <Route path="categories" element={<Categories />} />
                    <Route path="category/:slug" element={<CategoryProducts />} />

                    {/* Search */}
                    <Route path="search" element={<Search />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="wishlist" element={<Wishlist />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="addresses" element={<Addresses />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="payment" element={<Payment />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="orders/:orderId" element={<OrderDetail />} />
                      <Route path="orders/:orderId/track" element={<OrderTracking />} />
                      <Route path="notifications" element={<Notifications />} />
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </SearchProvider>
            </WishlistProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

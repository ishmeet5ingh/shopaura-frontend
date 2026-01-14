import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount only
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await API.get('/auth/check');

      if (response.data.success && response.data.authenticated) {
        const userData = response.data.user;

        // Block sellers and admins from buyer frontend
        if (userData.role !== 'buyer') {
          toast.error('Sellers and admins cannot access the buyer portal. Redirecting...');
          await logout();
          setTimeout(() => {
            window.location.href =
              import.meta.env.VITE_ADMIN_PANEL_URL || 'http://localhost:5174';
          }, 2000);
          return;
        }

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

// Login user
const login = async (email, password) => {
  try {
    const { data } = await API.post('/auth/login', {
      email,
      password,
      isBuyerFrontend: true, // Add this flag
    });

    if (data.success) {
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    }

    return { success: false, message: 'Login failed' };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Invalid email or password';

    return { success: false, message };
  }
};


  const register = async (name, email, password) => {
    try {
      const response = await API.post('/auth/register', {
        name,
        email,
        password,
        role: 'buyer'
      });

      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success('Account created successfully!');
        return { success: true, user: userData };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    }
  };

  // IMPORTANT: just update state and keep user authenticated.
  // Do NOT touch `loading` or call `checkAuthStatus` here.
  const updateUser = (userData) => {
    if (!userData) return;
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuthStatus,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;

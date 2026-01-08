import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    role: 'buyer' // default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(
      formData.name, 
      formData.email, 
      formData.password,
      formData.role
    );

    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-brrom-purple-50 via-pink-50 to-amber-50 p-4 overflow-hidden">
      {/* Main Container */}
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 sm:px-10 py-6">
          <div className="max-w-md w-full">
            {/* Logo/Brand - Kept at top */}
            <div className="mb-5">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-4xl">🛒</span>
                <h1 className="text-4xl font-extrabold">
                  <span className="bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    shop
                  </span>
                  <span className="bg-linear-to-r from-pink-500 to-amber-500 bg-clip-text text-transparent">
                    aura
                  </span>
                </h1>
              </div>
            </div>

            {/* Header - Reduced margin */}
            <div className="mb-4 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Create Account!</h2>
              <p className="text-gray-500 text-sm">Please enter your details</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 font-medium text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Form - Reduced spacing */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-gray-50 shadow-sm hover:shadow-md"
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="youremail@mail.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-gray-50 shadow-sm hover:shadow-md"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-gray-50 shadow-sm hover:shadow-md"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Join as
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-center p-3.5 border border-gray-300 rounded-xl cursor-pointer hover:bg-purple-50 transition-all has-checked:border-purple-600 has-checked:bg-purple-50">
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      checked={formData.role === 'buyer'}
                      onChange={handleChange}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-medium">Buyer</span>
                  </label>

                  <label className="flex items-center justify-center p-3.5 border border-gray-300 rounded-xl cursor-pointer hover:bg-pink-50 transition-all has-checked:border-pink-600 has-checked:bg-pink-50">
                    <input
                      type="radio"
                      name="role"
                      value="seller"
                      checked={formData.role === 'seller'}
                      onChange={handleChange}
                      className="mr-3 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="font-medium">Seller</span>
                  </label>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center -mt-1">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            {/* Footer - Reduced margin */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-purple-600 font-semibold hover:text-purple-700 hover:underline transition duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Terms and Privacy - Smaller text */}
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to shopaura{' '}
                <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Clean Image */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          <img
            src="/shopaura-shopping.png"
            alt="Shopping"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
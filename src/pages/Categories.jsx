// src/pages/Categories.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiGrid, FiChevronRight, FiPackage } from 'react-icons/fi';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await API.get('/categories');

      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading categories..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-purple-600">
              Home
            </Link>
            <FiChevronRight size={14} />
            <span className="text-slate-800 font-medium">Categories</span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-900 mb-2">
            Shop by category
          </h1>
          <p className="text-sm md:text-base text-slate-500">
            Browse our wide range of product categories and find what you're looking for.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
              >
                {/* Category Image */}
                <div className="relative aspect-square bg-slate-50 overflow-hidden">
                  {category.image?.url || category.image ? (
                    <img
                      src={category.image?.url || category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x400?text=Category';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiGrid className="text-slate-300" size={48} />
                    </div>
                  )}

                  {/* Product Count Badge */}
                  {category.productCount > 0 && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100">
                      <span className="text-[11px] md:text-xs font-semibold text-slate-700">
                        {category.productCount}
                      </span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/10 transition-colors" />
                </div>

                {/* Category Info */}
                <div className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-base font-semibold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-xs md:text-sm text-slate-500 mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <FiChevronRight
                      className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5"
                      size={18}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FiPackage className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">
                No categories available
              </h3>
              <p className="text-sm md:text-base text-slate-500 mb-6">
                Categories will appear here once they are added.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
              >
                Browse all products
                <FiChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;

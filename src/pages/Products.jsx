// src/pages/Products.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import API from '../services/api';
import {
  FiGrid,
  FiList,
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiStar,
  FiHeart,
  FiSearch,
  FiShoppingCart,
  FiPercent,
  FiTag
} from 'react-icons/fi';

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Cart & Wishlist hooks
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [minRating, setMinRating] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page')) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // sync page in URL
    const params = new URLSearchParams(searchParams);
    params.set('page', String(currentPage));
    setSearchParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, currentPage, searchQuery, minRating]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await API.get('/categories');
      let allCategories = [];
      if (res.data.data) {
        allCategories = res.data.data;
      } else if (Array.isArray(res.data)) {
        allCategories = res.data;
      } else if (res.data.categories) {
        allCategories = res.data.categories;
      }

      const activeCategories = allCategories.filter(
        (cat) => cat.isActive !== false
      );
      const categoryTree = buildCategoryTree(activeCategories);
      setCategories(categoryTree);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const buildCategoryTree = (categories) => {
    const parents = categories.filter((cat) => !cat.parent);
    const children = categories.filter((cat) => cat.parent);

    return parents
      .map((parent) => {
        const parentChildren = children.filter(
          (child) =>
            child.parent === parent._id ||
            child.parent?._id === parent._id ||
            child.parent === parent.slug ||
            child.parent?.slug === parent.slug
        );

        return {
          ...parent,
          children: parentChildren
        };
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (selectedCategory) params.append('category', selectedCategory);

      if (sortBy) {
        switch (sortBy) {
          case 'price-low':
            params.append('sort', 'price');
            break;
          case 'price-high':
            params.append('sort', '-price');
            break;
          case 'rating':
            params.append('sort', '-averageRating');
            break;
          case 'newest':
          default:
            params.append('sort', '-createdAt');
        }
      }

      if (searchQuery) params.append('search', searchQuery);
      if (minRating > 0) params.append('minRating', minRating);

      params.append('page', currentPage);
      params.append('limit', 12);

      const res = await API.get(`/products?${params.toString()}`);

      let fetchedProducts = [];
      let total = 0;
      let pages = 1;

      if (res.data.data?.products) {
        fetchedProducts = res.data.data.products;
        total = res.data.data.total || res.data.data.totalProducts || 0;
        pages = res.data.data.totalPages || 1;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        fetchedProducts = res.data.data;
        total = res.data.total || fetchedProducts.length;
        pages = res.data.totalPages || 1;
      } else if (Array.isArray(res.data.products)) {
        fetchedProducts = res.data.products;
        total = res.data.total || fetchedProducts.length;
        pages = res.data.totalPages || 1;
      } else if (Array.isArray(res.data)) {
        fetchedProducts = res.data;
        total = fetchedProducts.length;
      }

      setProducts(fetchedProducts);
      setTotalPages(pages);
      setTotalProducts(total);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1);

    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    if (sortBy) params.set('sort', sortBy);
    if (searchQuery) params.set('search', searchQuery);
    if (minRating > 0) params.set('minRating', String(minRating));
    setSearchParams(params);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams);
    if (value) params.set('sort', value);
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSortBy('newest');
    setSearchQuery('');
    setMinRating(0);
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.slug || product._id}`);
  };

  const getBreadcrumb = () => {
    if (!selectedCategory) return null;

    const findCategory = (cats, slug) => {
      for (let cat of cats) {
        if (cat.slug === slug) return cat;
        if (cat.children && cat.children.length > 0) {
          const found = findCategory(cat.children, slug);
          if (found) return found;
        }
      }
      return null;
    };

    const category = findCategory(categories, selectedCategory);
    return category?.name || selectedCategory;
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

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlistToggle = (e, product) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  // pagination helper for window of pages
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    if (currentPage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      ];
    }
    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2
    ];
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Top header (white + purple, minimal) */}
      <section className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
            <Link to="/" className="hover:text-purple-600">
              Home
            </Link>
            <FiChevronRight size={14} />
            <span className="text-slate-700 font-medium">
              {getBreadcrumb() || 'All products'}
            </span>
          </div>

          {/* Title + stats */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
                {getBreadcrumb() || 'Discover products'}
              </h1>
              <p className="text-sm md:text-base text-slate-500 mt-1">
                {loading
                  ? 'Loading products...'
                  : `Explore ${totalProducts} products across multiple categories.`}
              </p>
            </div>

            {/* Sort + view toggle */}
            <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
              <form onSubmit={handleSearch} className="w-full md:w-auto">
                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 pr-3 rounded-full bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </form>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none px-4 py-2.5 pr-9 rounded-full border border-slate-200 bg-white text-xs md:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="newest">Newest first</option>
                    <option value="price-low">Price: Low to high</option>
                    <option value="price-high">Price: High to low</option>
                    <option value="rating">Top rated</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="hidden md:flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                      viewMode === 'grid'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FiGrid size={16} />
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                      viewMode === 'list'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FiList size={16} />
                    List
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs md:text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:border-purple-300 hover:text-purple-700 md:hidden"
                >
                  <FiFilter size={16} />
                  Filters
                  {(selectedCategory || minRating > 0) && (
                    <span className="h-4 w-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center">
                      {(selectedCategory ? 1 : 0) + (minRating > 0 ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside
            className={`lg:w-72 lg:shrink-0 ${
              showFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <FiFilter size={16} />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Filters
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-purple-600 hover:text-purple-700"
                >
                  Clear all
                </button>
              </div>

              {/* Categories */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1">
                  <FiTag className="text-purple-500" />
                  Categories
                </h3>
                {categoriesLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 rounded-xl bg-slate-100 animate-pulse"
                      />
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No categories available.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === ''}
                        onChange={() => handleCategoryChange('')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-slate-700">
                        All categories
                      </span>
                    </label>
                    {categories.map((category) => (
                      <div key={category._id} className="space-y-1">
                        <label className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === category.slug}
                            onChange={() =>
                              handleCategoryChange(category.slug)
                            }
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1 flex items-center justify-between gap-2">
                            <span className="text-sm text-slate-800">
                              {category.name}
                            </span>
                            {category.productCount > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
                                {category.productCount}
                              </span>
                            )}
                          </div>
                        </label>

                        {category.children && category.children.length > 0 && (
                          <div className="ml-6 space-y-1 border-l border-slate-100 pl-3">
                            {category.children.map((sub) => (
                              <label
                                key={sub._id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name="category"
                                  checked={selectedCategory === sub.slug}
                                  onChange={() =>
                                    handleCategoryChange(sub.slug)
                                  }
                                  className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500"
                                />
                                <div className="flex-1 flex items-center justify-between gap-2">
                                  <span className="text-xs text-slate-700">
                                    {sub.name}
                                  </span>
                                  {sub.productCount > 0 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
                                      {sub.productCount}
                                    </span>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating filter */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1">
                  <FiStar className="text-amber-400" />
                  Minimum rating
                </h3>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === 0}
                      onChange={() => setMinRating(0)}
                      className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-700">
                      All ratings
                    </span>
                  </label>
                  {[4, 3, 2, 1].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                      />
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                          {renderStars(rating)}
                        </div>
                        <span className="text-xs text-slate-700">
                          & up
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Active filters */}
              {(selectedCategory || minRating > 0) && (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <h3 className="text-xs font-semibold text-slate-700 mb-1">
                    Active filters
                  </h3>
                  {selectedCategory && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs">
                      <span className="font-medium">{getBreadcrumb()}</span>
                      <button
                        type="button"
                        onClick={() => handleCategoryChange('')}
                        className="p-1 rounded-full hover:bg-purple-100"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  )}
                  {minRating > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs">
                      <span className="font-medium">{minRating}+ stars</span>
                      <button
                        type="button"
                        onClick={() => setMinRating(0)}
                        className="p-1 rounded-full hover:bg-amber-100"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile apply */}
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="mt-4 w-full lg:hidden px-4 py-2.5 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
              >
                Apply filters
              </button>
            </div>
          </aside>

          {/* Main product area */}
          <main className="flex-1 space-y-6">
            {/* Chips row (optional quick info) */}
            <div className="flex flex-wrap gap-2 text-[11px] md:text-xs text-slate-600">
              <span className="px-3 py-1 rounded-full bg-white border border-slate-100">
                Showing page {currentPage} of {totalPages}
              </span>
              {selectedCategory && (
                <span className="px-3 py-1 rounded-full bg-white border border-purple-100 text-purple-700">
                  Category: {getBreadcrumb()}
                </span>
              )}
              {minRating > 0 && (
                <span className="px-3 py-1 rounded-full bg-white border border-amber-100 text-amber-700">
                  Rating: {minRating}+ stars
                </span>
              )}
            </div>

            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm px-4 py-5 md:px-6 md:py-6">
              {loading ? (
                <div
                  className={`grid ${
                    viewMode === 'grid'
                      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                      : 'grid-cols-1'
                  } gap-5`}
                >
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-slate-100 rounded-3xl h-72 animate-pulse"
                    />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-3">🔍</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-sm text-slate-500 mb-5 max-w-md mx-auto">
                    {searchQuery
                      ? `No results for “${searchQuery}”. Try other keywords or clear filters.`
                      : 'Try adjusting filters to see more products.'}
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
                  >
                    Clear all filters
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <>
                  {/* GRID VIEW */}
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {products.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleProductClick(product)}
                          onMouseEnter={() =>
                            setHoveredProduct(product._id)
                          }
                          onMouseLeave={() =>
                            setHoveredProduct(null)
                          }
                          className="group cursor-pointer"
                        >
                          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden">
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

                              <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                                {product.discount > 0 && (
                                  <span className="inline-flex items-center gap-1 bg-red-500 text-white px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm">
                                    <FiPercent size={12} />
                                    {product.discount}% OFF
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleWishlistToggle(e, product)
                                  }
                                  className={`ml-auto p-2 rounded-full border text-slate-700 bg-white/90 hover:text-red-500 hover:border-red-200 transition-colors ${
                                    hoveredProduct === product._id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  }`}
                                >
                                  <FiHeart
                                    className={
                                      isInWishlist(product._id)
                                        ? 'fill-red-500'
                                        : ''
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
                                  {renderStars(
                                    product.averageRating || 0
                                  )}
                                </div>
                                <span className="text-xs font-semibold text-slate-900">
                                  {product.averageRating?.toFixed(1) ||
                                    '0.0'}
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
                              </div>

                              <button
                                type="button"
                                onClick={(e) =>
                                  handleAddToCart(e, product)
                                }
                                disabled={product.stock === 0}
                                className={`w-full mt-2 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                                  isInCart(product._id)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                <FiShoppingCart />
                                {isInCart(product._id)
                                  ? 'In cart'
                                  : 'Add to cart'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* LIST VIEW */}
                  {viewMode === 'list' && (
                    <div className="space-y-4">
                      {products.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleProductClick(product)}
                          onMouseEnter={() =>
                            setHoveredProduct(product._id)
                          }
                          onMouseLeave={() =>
                            setHoveredProduct(null)
                          }
                          className="group cursor-pointer"
                        >
                          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all flex overflow-hidden">
                            <div className="relative w-40 md:w-56 lg:w-64 bg-slate-50 overflow-hidden shrink-0">
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
                                <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-red-500 text-white px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm">
                                  <FiPercent size={12} />
                                  {product.discount}% OFF
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleWishlistToggle(e, product)
                                }
                                className={`absolute top-3 right-3 p-2 rounded-full border text-slate-700 bg-white/90 hover:text-red-500 hover:border-red-200 transition-colors`}
                              >
                                <FiHeart
                                  className={
                                    isInWishlist(product._id)
                                      ? 'fill-red-500'
                                      : ''
                                  }
                                />
                              </button>
                            </div>

                            <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
                              <div>
                                <h3 className="font-semibold text-base md:text-lg text-slate-900 mb-2 line-clamp-2">
                                  {product.name}
                                </h3>
                                {product.description && (
                                  <p className="text-xs md:text-sm text-slate-500 mb-3 line-clamp-2">
                                    {product.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="flex items-center gap-0.5">
                                    {renderStars(
                                      product.averageRating || 0
                                    )}
                                  </div>
                                  <span className="text-xs font-semibold text-slate-900">
                                    {product.averageRating?.toFixed(1) ||
                                      '0.0'}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    ({product.reviewCount || 0} reviews)
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-xl md:text-2xl font-semibold text-purple-600">
                                    ₹{product.finalPrice || product.price}
                                  </span>
                                  {product.discount > 0 && (
                                    <span className="text-xs md:text-sm text-slate-400 line-through">
                                      ₹{product.price}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleAddToCart(e, product)
                                  }
                                  disabled={product.stock === 0}
                                  className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold flex items-center gap-2 transition-colors ${
                                    isInCart(product._id)
                                      ? 'bg-green-500 text-white'
                                      : 'bg-purple-600 text-white hover:bg-purple-700'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  <FiShoppingCart />
                                  {isInCart(product._id)
                                    ? 'In cart'
                                    : 'Add to cart'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-full text-xs md:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {getPageNumbers().map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold ${
                            currentPage === page
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-full text-xs md:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* custom scrollbar for filters */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #a855f7;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
};

export default Products;

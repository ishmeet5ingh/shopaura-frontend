import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import API from "../services/api";
import {
  FiStar,
  FiHeart,
  FiShoppingCart,
  FiChevronRight,
  FiTruck,
  FiShield,
  FiRotateCcw,
  FiCheck,
  FiAlertCircle,
  FiX,
  FiZap,
  FiPackage,
} from "react-icons/fi";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist, loading: wishlistLoading } =
    useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isHeartedFromAPI, setIsHeartedFromAPI] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const isCurrentlyHearted = isHeartedFromAPI || isInWishlist(product?._id);

  // Compute images once product changes
  const images = useMemo(() => {
    if (!product) return [];
    return [
      product.thumbnail?.url,
      ...(product.images?.map((img) => img.url) || []),
    ].filter(Boolean);
  }, [product]);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (product && isInCart(product._id)) {
      const cartQty = getItemQuantity(product._id);
      setQuantity(cartQty);
    } else {
      setQuantity(1);
    }
  }, [product, isInCart, getItemQuantity]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const endpoint = isAuthenticated
        ? `/products/${id}`
        : `/products/${id}/public`;
      const res = await API.get(endpoint);
      const productData = res.data.product;
      setProduct(productData);
      setIsHeartedFromAPI(!!productData.ishearted);
    } catch (error) {
      console.error("Error fetching product:", error);
      try {
        const fallbackRes = await API.get(`/products/${id}/public`);
        setProduct(fallbackRes.data.product);
        setIsHeartedFromAPI(false);
      } catch (fallbackError) {
        console.error("Fallback failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/product/${id}`);
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleQuantityChange = (type) => {
    if (!product) return;
    if (type === "increment" && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    if (isInCart(product._id)) {
      updateQuantity(product._id, quantity);
    } else {
      addToCart({ ...product, quantity });
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    try {
      await toggleWishlist(product);
      setIsHeartedFromAPI((prev) => !prev);
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      setIsHeartedFromAPI((prev) => !prev);
    }
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={i < rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}
        size={16}
      />
    ));

  const renderClickableStars = (rating, onClick) =>
    [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onClick(i + 1)}
        className="focus:outline-none transition-transform hover:scale-110"
      >
        <FiStar
          className={
            i < rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
          }
          size={22}
        />
      </button>
    ));

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!product || !reviewForm.comment.trim()) return;

    setSubmittingReview(true);
    try {
      await API.post("/reviews", {
        product: product._id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });

      setReviewForm({ rating: 5, title: "", comment: "" });
      setShowReviewModal(false);
      fetchReviews();
      fetchProduct();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            <div className="bg-slate-200 h-64 md:h-72 rounded-2xl" />
            <div className="space-y-4">
              <div className="bg-slate-200 h-7 rounded-xl w-3/4" />
              <div className="bg-slate-200 h-5 rounded-xl w-1/2" />
              <div className="bg-slate-200 h-20 rounded-xl" />
              <div className="bg-slate-200 h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-3">😕</div>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
            Product not found
          </h2>
          <p className="text-sm md:text-base text-slate-500 mb-5">
            This product might have been removed or is not available.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
          >
            Back to products
          </button>
        </div>
      </div>
    );
  }

  const finalPrice = product.finalPrice || product.price;
  const hasDiscount = product.discount > 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
            <Link to="/" className="hover:text-purple-600">
              Home
            </Link>
            <FiChevronRight size={14} />
            <Link to="/products" className="hover:text-purple-600">
              Products
            </Link>
            {product.category && (
              <>
                <FiChevronRight size={14} />
                <Link
                  to={`/products?category=${product.category.slug}`}
                  className="hover:text-purple-600"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <FiChevronRight size={14} />
            <span className="text-slate-800 font-medium line-clamp-1">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 lg:gap-10 mb-10 items-start">
          {/* Images */}
          <div className="space-y-3 md:space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative">
              {/* Smaller, more contained image */}
              <div className="aspect-4/5 md:aspect-4/5 bg-slate-50 max-h-95 md:max-h-105 mx-auto">
                <img
                  src={
                    images[selectedImage] ||
                    "https://placehold.co/500x500?text=Product"
                  }
                  alt={product.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/500x500?text=Product";
                  }}
                />
              </div>

              {hasDiscount && (
                <div className="absolute top-3 left-3 md:top-4 md:left-4 px-2.5 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm">
                  <span>{product.discount}% OFF</span>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWishlistToggle();
                }}
                disabled={wishlistLoading}
                className={`absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full border text-slate-700 bg-white/90 hover:text-red-500 hover:border-red-200 transition-colors ${
                  wishlistLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FiHeart
                  size={18}
                  className={isCurrentlyHearted ? "fill-red-500" : ""}
                />
              </button>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border text-xs ${
                      selectedImage === index
                        ? "border-purple-500 ring-2 ring-purple-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5 md:space-y-6">
            {/* Basic info & pricing */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
                {product.name}
              </h1>

              {product.brand && (
                <p className="text-xs md:text-sm text-slate-500 mb-3">
                  Brand:{" "}
                  <span className="font-medium text-slate-800">
                    {product.brand}
                  </span>
                </p>
              )}

              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(product.averageRating || 0))}
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {product.averageRating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-xs text-slate-500">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>

              <div className="mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-end gap-2.5 mb-1">
                  <span className="text-2xl md:text-3xl font-semibold text-purple-600">
                    ₹{finalPrice}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-xs md:text-sm text-slate-400 line-through">
                        ₹{product.price}
                      </span>
                      <span className="text-xs md:text-sm font-semibold text-emerald-600">
                        Save ₹{product.price - finalPrice}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs md:text-sm text-slate-500">
                  Inclusive of all taxes • Free shipping over ₹500
                </p>
              </div>

              {/* Stock state */}
              <div className="mb-4">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 px-3.5 py-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                      <FiCheck className="text-white" />
                    </div>
                    <div>
                      {product.stock <= 10 ? (
                        <p className="text-xs font-semibold text-amber-700">
                          Low stock • {product.stock} left
                        </p>
                      ) : (
                        <p className="text-xs font-semibold text-emerald-700">
                          In stock • {product.stock} units
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-3.5 py-3">
                    <FiAlertCircle className="text-red-600" />
                    <p className="text-xs font-semibold text-red-700">
                      Out of stock
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity & actions */}
              {product.stock > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Quantity
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange("decrement")}
                      className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-lg font-semibold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-base font-semibold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange("increment")}
                      disabled={quantity >= product.stock}
                      className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-lg font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2.5 mb-5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full py-3 rounded-full text-sm md:text-base font-semibold flex items-center justify-center gap-2 ${
                    isInCart(product._id)
                      ? "bg-emerald-500 text-white"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FiShoppingCart size={18} />
                  {isInCart(product._id) ? "Update cart" : "Add to cart"}
                </button>

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`w-full py-3 rounded-full text-sm md:text-base font-semibold flex items-center justify-center gap-2 border ${
                    isCurrentlyHearted
                      ? "border-red-300 text-red-500 bg-red-50"
                      : "border-slate-200 text-slate-700 hover:border-red-300 hover:text-red-500"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FiHeart
                    size={18}
                    className={isCurrentlyHearted ? "fill-red-500" : ""}
                  />
                  {wishlistLoading
                    ? "Processing..."
                    : isCurrentlyHearted
                    ? "In wishlist"
                    : "Add to wishlist"}
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs md:text-sm">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <FiTruck className="text-purple-500" />
                  <span>Fast & reliable delivery</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <FiRotateCcw className="text-purple-500" />
                  <span>30-day easy returns</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <FiShield className="text-purple-500" />
                  <span>Secure payments</span>
                </div>
              </div>

              {product.seller && (
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs md:text-sm">
                    <FiPackage className="text-purple-500" />
                    <div>
                      <p className="text-slate-500">Sold by</p>
                      <p className="text-slate-900 font-medium">
                        {product.seller.name || "ShopAura seller"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
          <div className="border-b border-slate-200 flex overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={`px-5 md:px-7 py-3 text-sm md:text-base font-semibold whitespace-nowrap ${
                activeTab === "description"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("specifications")}
              className={`px-5 md:px-7 py-3 text-sm md:text-base font-semibold whitespace-nowrap ${
                activeTab === "specifications"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`px-5 md:px-7 py-3 text-sm md:text-base font-semibold whitespace-nowrap ${
                activeTab === "reviews"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Reviews ({product.reviewCount || 0})
            </button>
          </div>

          <div className="p-5 md:p-7">
            {activeTab === "description" && (
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FiZap className="text-purple-500" />
                  Product description
                </h3>
                <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                  {product.description || "No description available."}
                </p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
                  Technical details
                </h3>
                <div className="space-y-2 text-sm md:text-base">
                  <SpecRow label="Brand" value={product.brand || "N/A"} />
                  <SpecRow label="SKU" value={product.sku || "N/A"} />
                  <SpecRow
                    label="Category"
                    value={product.category?.name || "N/A"}
                  />
                  <SpecRow label="Stock" value={`${product.stock} units`} />
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex py-2">
                      <span className="w-1/3 text-slate-500">Tags</span>
                      <div className="w-2/3 flex flex-wrap gap-2">
                        {product.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                    Customer reviews
                  </h3>
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(true)}
                      className="px-4 py-2 rounded-full bg-purple-600 text-white text-xs md:text-sm font-semibold hover:bg-purple-700"
                    >
                      Write a review
                    </button>
                  )}
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewCard
                        key={review._id}
                        review={review}
                        renderStars={renderStars}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-2">⭐</div>
                    <p className="text-sm md:text-base text-slate-600 mb-4">
                      No reviews yet. Be the first to review this product.
                    </p>
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => setShowReviewModal(true)}
                        className="px-5 py-2.5 rounded-full bg-purple-600 text-white text-xs md:text-sm font-semibold hover:bg-purple-700"
                      >
                        Write first review
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                Write a review
              </h2>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-2 rounded-full hover:bg-slate-100"
              >
                <FiX size={18} />
              </button>
            </div>

            <form
              onSubmit={handleReviewSubmit}
              className="px-5 md:px-6 py-5 space-y-5"
            >
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <img
                  src={
                    product.thumbnail?.url ||
                    "https://placehold.co/80x80?text=Product"
                  }
                  alt={product.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Share your experience with other shoppers.
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  Rating
                </p>
                <div className="flex items-center gap-3">
                  {renderClickableStars(reviewForm.rating, (rating) =>
                    setReviewForm((prev) => ({ ...prev, rating }))
                  )}
                  <span className="text-xs text-slate-600">
                    {reviewForm.rating}{" "}
                    {reviewForm.rating === 1 ? "star" : "stars"}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  Title (optional)
                </p>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  maxLength={100}
                  placeholder="Sum up your experience in one line"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  Review
                </p>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  rows={5}
                  required
                  maxLength={1000}
                  placeholder="Tell us what you liked or didn’t like."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {reviewForm.comment.length}/1000 characters
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || !reviewForm.comment.trim()}
                  className="flex-1 px-4 py-2.5 rounded-full bg-purple-600 text-white text-xs md:text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? "Submitting..." : "Submit review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SpecRow = ({ label, value }) => (
  <div className="flex py-2 border-b border-slate-100">
    <span className="w-1/3 text-slate-500">{label}</span>
    <span className="w-2/3 text-slate-900">{value}</span>
  </div>
);

const ReviewCard = ({ review, renderStars }) => (
  <div className="border border-slate-100 rounded-2xl p-4 md:p-5 bg-white">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold">
          {review.user?.name?.[0]?.toUpperCase() || "A"}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {review.user?.name || "Anonymous"}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-0.5">
              {renderStars(review.rating)}
            </div>
            <span>
              {new Date(review.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
    {review.title && (
      <p className="text-sm font-semibold text-slate-900 mb-1">
        {review.title}
      </p>
    )}
    <p className="text-sm text-slate-700">{review.comment}</p>
  </div>
);

export default ProductDetail;

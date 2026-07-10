import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const ReviewPage = () => {

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState(false);

  const [error, setError] = useState("");

  const [orderId, setOrderId] = useState("");

  const [products, setProducts] = useState([]);

  // =====================================
  // Load Review Data
  // =====================================

 useEffect(() => {

  if (!token) {
    setError("Invalid review link.");
    setLoading(false);
    return;
  }

  loadReview();

}, [token]);

  const loadReview = async () => {

    try {

      const res = await axios.get(
        `${API_URL}/api/reviews/verify`,
        {
          params: {
            token,
          },
        }
      );

      setOrderId(res.data.orderId);

      setProducts(res.data.products);

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Failed to load review page."
      );

    } finally {

      setLoading(false);

    }

  };
    // =====================================
  // Update Rating
  // =====================================

  const updateRating = (productId, rating) => {

    setProducts((prev) =>
      prev.map((product) =>
        product.productId === productId
          ? {
              ...product,
              rating,
            }
          : product
      )
    );

  };

  // =====================================
  // Submit Reviews
  // =====================================

  const handleSubmit = async () => {

    const reviews = products.map((product) => ({
      productId: product.productId,
      rating: product.rating,
    }));

    // At least one rating
    const hasRating = reviews.some(
      (item) => item.rating > 0
    );

    if (!hasRating) {
      alert("Please rate at least one product.");
      return;
    }

    try {

      setSubmitting(true);

      await axios.post(
        `${API_URL}/api/reviews`,
        {
          token,
          reviews,
        }
      );

      setSuccess(true);

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Failed to submit reviews."
      );

    } finally {

      setSubmitting(false);

    }

  };

  // =====================================
  // Star Rating Component
  // =====================================

  const RatingStars = ({ product }) => {

    return (
      <div className="flex items-center gap-2 mt-4">

        {[1, 2, 3, 4, 5].map((star) => (

          <button
            key={star}
            type="button"
            onClick={() =>
              updateRating(
                product.productId,
                star
              )
            }
            className="
              text-3xl
              transition
              hover:scale-110
              active:scale-95
            "
          >

            {star <= product.rating
              ? "⭐"
              : "☆"}

          </button>

        ))}

      </div>
    );

  };
    // =====================================
  // UI
  // =====================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-semibold animate-pulse">
          Loading your review page...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center">

          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Review Link
          </h1>

          <p className="text-gray-600">
            {error}
          </p>

        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">

        <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-10 text-center">

          <div className="text-6xl mb-4">
            ✅
          </div>

          <h1 className="text-3xl font-bold text-green-600">
            Thank You!
          </h1>

          <p className="text-gray-600 mt-4">
            Your ratings have been submitted successfully.
          </p>

          <p className="text-gray-500 mt-2">
            We really appreciate your feedback ❤️
          </p>

        </div>

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100 py-12 px-4">

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center">

          <h1 className="text-4xl font-bold">
            🥛 Uma Dairy
          </h1>

          <p className="text-gray-500 mt-3">
            Rate the products from your delivered order
          </p>

        </div>

        <div className="mt-10 space-y-6">

          {products.map((product) => (

            <div
              key={product.productId}
              className="
                border
                rounded-xl
                p-5
                flex
                flex-col
                md:flex-row
                gap-5
                items-center
              "
            >

              <img
                src={
                  product.image
                    ? `${API_URL}${product.image}`
                    : "/placeholder.png"
                }
                alt={product.name}
                className="
                  w-28
                  h-28
                  rounded-lg
                  object-cover
                  border
                "
              />

              <div className="flex-1">

                <h2 className="text-xl font-semibold">
                  {product.name}
                </h2>

                <p className="text-gray-500 mt-1">
                  Quantity : {product.quantity}
                </p>

                {product.alreadyRated && (
                  <span
                    className="
                      inline-block
                      mt-2
                      text-sm
                      text-green-600
                    "
                  >
                    Previously Rated
                  </span>
                )}

                <RatingStars product={product} />

              </div>

            </div>

          ))}

        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="
            w-full
            mt-10
            bg-orange-500
            hover:bg-orange-600
            text-white
            py-4
            rounded-xl
            text-lg
            font-semibold
            transition
            disabled:opacity-50
          "
        >

          {submitting
            ? "Submitting..."
            : "Submit Reviews"}

        </button>

      </div>

    </div>

  );

};

export default ReviewPage;

import { FaHeart, FaRegHeart } from "react-icons/fa";

const ProductCard = ({
  product,
  isWishlisted,
  imageIndex,
  onClick,
  onHover,
  onLeave,
  toggleWishlist,
  backendUrl,
}) => {
  const {
    _id,
    name,
    price,
    mrp,
    discount,
    unit,
    images = [],
    inStock,
    category,
  } = product || {};

  const safeImages =
    Array.isArray(images) && images.length > 0 ? images : ["/default.jpg"];

  const currentImage = safeImages[imageIndex % safeImages.length];

  const badge =
    category === "Ghee"
      ? { text: "Pure", color: "bg-yellow-100 text-yellow-700" }
      : category === "Paneer"
      ? { text: "Fresh", color: "bg-green-100 text-green-700" }
      : category === "Milk"
      ? { text: "Daily", color: "bg-blue-100 text-blue-700" }
      : { text: "Natural", color: "bg-orange-100 text-[#F97354]" };

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="group relative bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
    >
      {/* Badge */}
      <div
        className={`absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}
      >
        {badge.text}
      </div>

      {/* Wishlist */}
      <button
        onClick={(e) => toggleWishlist(e, _id)}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#F97354] hover:scale-110 transition"
      >
        {isWishlisted ? <FaHeart /> : <FaRegHeart />}
      </button>

      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-[#FFF8F1]">
        <img
          src={
            currentImage.startsWith("/uploads")
              ? `${backendUrl}${currentImage}`
              : currentImage
          }
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-5">

        <h2 className="text-xl font-bold text-[#3B2418] truncate">
          {name}
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          {category}
        </p>

        <p className="text-gray-400 text-sm">
          {unit}
        </p>

        {/* Price */}
        <div className="flex items-center flex-wrap gap-2 mt-3">

          <span className="text-2xl font-bold text-[#F97354]">
            ₹{price}
          </span>

          {mrp && (
            <>
              <span className="text-gray-400 line-through">
                ₹{mrp}
              </span>

              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {discount}% OFF
              </span>
            </>
          )}

        </div>

        {/* Stock */}
        <div className="mt-3">

          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              inStock
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {inStock ? "✔ In Stock" : "✖ Out of Stock"}
          </span>

        </div>

        {/* Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="mt-5 w-full bg-[#F97354] hover:bg-[#ea6847] text-white py-3 rounded-xl font-semibold transition-all duration-300"
        >
          🛒 Add to Cart
        </button>

      </div>
    </div>
  );
};

export default ProductCard;




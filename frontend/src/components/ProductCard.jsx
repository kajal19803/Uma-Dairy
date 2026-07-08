import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useCart } from "../context/CartContext";

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
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();

  const quantity =
    cartItems.find((item) => item._id === _id)?.quantity || 0;

  return (
  <div
    onClick={onClick}
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
    className="group relative bg-white rounded-2xl md:rounded-3xl overflow-visible md:overflow-hidden border border-orange-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
  >
    {/* Badge */}
    <div
      className={`absolute top-2 md:top-4 left-2 md:left-4 z-20 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold ${badge.color}`}
    >
      {badge.text}
    </div>

    {/* Wishlist */}
<button
  onClick={(e) => {
    e.stopPropagation();
    toggleWishlist(e, _id);
  }}
  className="absolute top-2 right-2 md:top-4 md:right-4 z-50 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border border-orange-100 shadow-lg flex items-center justify-center hover:scale-110 transition"
>
  {isWishlisted ? (
    <FaHeart size={20} className="text-[#F97354] md:w-6 md:h-6" />
  ) : (
    <FaRegHeart size={20} className="text-[#F97354] md:w-6 md:h-6" />
  )}
</button>

    {/* Image Slider */}
    <div className="relative h-36 md:h-64 overflow-hidden bg-[#FFF8F1]">

      <div
        className="absolute top-0 left-0 h-full flex transition-transform duration-500"
        style={{
          transform: `translateX(-${(imageIndex % safeImages.length) * 100}%)`,
          width: `${safeImages.length * 100}%`,
        }}
      >
        {safeImages.map((img, index) => (
          <div
            key={index}
            className="w-full h-full flex-shrink-0"
          >
            <img
              src={
                img.startsWith("/uploads")
                  ? `${backendUrl}${img}`
                  : img
              }
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          </div>
        ))}
      </div>

    </div>

    {/* Content */}
    <div className="p-3 md:p-5">

      <h2 className="text-base md:text-xl font-bold text-[#3B2418] truncate">
        {name}
      </h2>

      <p className="text-gray-500 text-xs md:text-sm mt-1">
        {category}
      </p>

      <p className="text-gray-400 text-xs md:text-sm">
        {unit}
      </p>

      {/* Price */}
            <div className="flex items-center flex-wrap gap-2 mt-3">
        <span className="text-lg md:text-2xl font-bold text-[#F97354]">
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
      <div className="mt-2 md:mt-3">
        <span
          className={`inline-flex items-center px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold ${
            inStock
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {inStock ? "✔ In Stock" : "✖ Out of Stock"}
        </span>
      </div>

      {/* Add to Cart */}
      <div className="mt-5">
        {quantity === 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            disabled={!inStock}
           className={`w-full py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl font-semibold transition ${
  inStock
    ? "bg-[#F97354] hover:bg-[#ea6847] text-white"
    : "bg-gray-300 text-gray-500 cursor-not-allowed"
}`}
          >
            🛒 Add to Cart
          </button>
        ) : (
          <div className="flex items-center justify-between border border-orange-200 rounded-lg md:rounded-xl overflow-hidden bg-orange-50">
  <button
    onClick={(e) => {
      e.stopPropagation();
      if (quantity > 1) {
        updateQuantity(_id, quantity - 1);
      } else {
        removeFromCart(_id);
      }
    }}
    className="w-8 h-8 md:w-12 md:h-12 bg-[#F97354] hover:bg-[#ea6847] text-white text-lg md:text-xl font-bold transition"
  >
    −
  </button>

  <span className="text-base md:text-lg font-bold text-[#3B2418]">
    {quantity}
  </span>

  <button
    onClick={(e) => {
      e.stopPropagation();
      updateQuantity(_id, quantity + 1);
    }}
    className="w-8 h-8 md:w-12 md:h-12 bg-[#F97354] hover:bg-[#ea6847] text-white text-lg md:text-xl font-bold transition"
  >
    +
  </button>
</div>
        )}
      </div>

    </div>
  </div>
);

};

export default ProductCard;
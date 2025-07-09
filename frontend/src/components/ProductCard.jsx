import { FaHeart, FaRegHeart } from 'react-icons/fa';

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
    images = [], // ensure it's at least an empty array
    inStock,
    category,
  } = product || {};

  const safeImages = Array.isArray(images) && images.length > 0 ? images : ['/default.jpg'];
  const currentImage = safeImages[imageIndex % safeImages.length];

  return (
    <div
      className="group bg-white shadow-md rounded-lg p-4 relative cursor-pointer hover:shadow-lg transition"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Image Slider */}
      <div className="relative h-40 w-full overflow-hidden rounded-md mb-4">
        <div
          className="absolute top-0 left-0 h-full flex transition-transform duration-500"
          style={{
            transform: `translateX(-${(imageIndex % safeImages.length) * 100}%)`,
            width: `${safeImages.length * 100}%`,
          }}
        >
          {safeImages.map((img, idx) => (
            <div key={idx} className="h-full w-full flex-shrink-0">
              <img
                src={img.startsWith('/uploads') ? `${backendUrl}${img}` : img}
                alt={`Product ${idx}`}
                className="h-full w-60 object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile view: icon beside name */}
      <div className="flex justify-between items-center md:hidden">
        <h2 className="text-lg font-semibold text-gray-800">{name || 'Unnamed'}</h2>
        <div onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => toggleWishlist(e, _id)}
            className="text-red-500 text-xl"
          >
            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
      </div>

      {/* Info block for desktop */}
      <div className="hidden md:block group-hover:hidden">
        <p className="text-sm text-gray-700">{name}</p>
        <p className="text-gray-600 text-sm">{category}</p>
        <p className="text-gray-600 text-sm">{unit}</p>
        <p className="text-gray-700 mb-2">
          <span className="text-green-700 font-bold">₹{price}</span>
          {mrp && (
            <>
              <span className="line-through text-sm text-gray-500 ml-2">₹{mrp}</span>
              <span className="ml-2 text-sm text-red-600">({discount}% OFF)</span>
            </>
          )}
        </p>
      </div>

      {/* Desktop hover: heart + label */}
      <div
        onClick={(e) => toggleWishlist(e, _id)}
        className="hidden md:flex group-hover:flex group-hover:opacity-100 opacity-0 transition-opacity duration-200 items-center justify-center gap-1 mt-2 text-red-500 font-medium text-sm cursor-pointer"
      >
        <span className="text-base">{isWishlisted ? <FaHeart /> : <FaRegHeart />}</span>
        <span>Add to Wishlist</span>
      </div>

      {/* Mobile view details */}
      <div className="md:hidden">
        <p className="text-gray-600 text-sm">{category}</p>
        <p className="text-gray-700 mb-2">
          <span className="text-green-700 font-bold">₹{price}</span>
          {mrp && (
            <>
              <span className="line-through text-sm text-gray-500 ml-2">₹{mrp}</span>
              <span className="ml-2 text-sm text-red-600">({discount}% OFF)</span>
            </>
          )}
        </p>
        <p className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-500'}`}>
          {inStock ? 'In Stock' : 'Out of Stock'}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;




import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch product:", err);
        setLoading(false);
      });

    fetch(`${BACKEND_BASE_URL}/api/products/related/${id}`)
      .then((res) => res.json())
      .then((data) => setRelatedProducts(data));
  }, [id]);

  const getQuantity = () => {
    const item = cartItems.find((item) => item._id === id);
    return item ? item.quantity : 0;
  };

  const handleIncrement = () => {
    const currentQty = getQuantity();
    updateQuantity(product._id, currentQty + 1);
  };

  const handleDecrement = () => {
    const currentQty = getQuantity();

    if (currentQty > 1) {
      updateQuantity(product._id, currentQty - 1);
    } else {
      removeFromCart(product._id);
    }
  };

  const handleToggleWishlist = (e, productId) => {
    e.stopPropagation();
    toggleWishlist(productId);
  };

  const quantity = getQuantity();

  if (loading)
    return (
      <p className="text-center text-gray-700 mt-10">
        Loading...
      </p>
    );

  if (!product)
    return (
      <p className="text-center text-red-500 mt-10">
        Product not found.
      </p>
    );

  return (
    <div className="min-h-screen w-screen bg-[#FFF8F1] pt-20 lg:pt-28 pb-12 lg:pb-20">

      {/* Image Preview */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative w-full max-w-6xl px-4 lg:px-10"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`${BACKEND_BASE_URL}${product.images[selectedImage]}`}
              alt=""
              className="max-h-[70vh] lg:max-h-[85vh] mx-auto rounded-2xl lg:rounded-3xl shadow-2xl"
            />

            {selectedImage > 0 && (
              <button
                onClick={() => setSelectedImage(selectedImage - 1)}
                className="absolute left-2 lg:left-6 top-1/2 -translate-y-1/2
                           w-10 h-10 lg:w-14 lg:h-14
                           rounded-full bg-white text-[#F97354]
                           text-xl lg:text-3xl shadow-xl"
              >
                ❮
              </button>
            )}

            {selectedImage < product.images.length - 1 && (
              <button
                onClick={() => setSelectedImage(selectedImage + 1)}
                className="absolute right-2 lg:right-6 top-1/2 -translate-y-1/2
                           w-10 h-10 lg:w-14 lg:h-14
                           rounded-full bg-white text-[#F97354]
                           text-xl lg:text-3xl shadow-xl"
              >
                ❯
              </button>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 lg:px-5">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">

          {/* LEFT */}
          <div className="bg-white rounded-2xl lg:rounded-[32px] shadow-xl p-3 lg:p-6 lg:sticky lg:top-28">

            <Swiper
              pagination={{ clickable: true }}
              modules={[Pagination]}
              className="rounded-2xl lg:rounded-[28px]"
            >
              {product.images?.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={`${BACKEND_BASE_URL}${img}`}
                    alt=""
                    onClick={() => setSelectedImage(index)}
                    className="w-full
                               h-72
                               sm:h-96
                               lg:h-[620px]
                               object-cover
                               rounded-2xl
                               lg:rounded-[28px]
                               cursor-zoom-in"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="grid grid-cols-4 gap-2 lg:gap-3 mt-4 lg:mt-5">

              {product.images?.map((img, index) => (
                <img
                  key={index}
                  src={`${BACKEND_BASE_URL}${img}`}
                  alt=""
                  onClick={() => setSelectedImage(index)}
                  className="h-16 sm:h-20 lg:h-24
                             w-full
                             rounded-xl lg:rounded-2xl
                             object-cover
                             cursor-pointer
                             border-2 border-orange-100
                             hover:border-[#F97354]"
                />
              ))}

            </div>

          </div>

          {/* RIGHT STARTS HERE */}
          <div className="bg-white rounded-2xl lg:rounded-[32px] shadow-xl p-5 lg:p-10">
            {/* Header */}
<div className="flex justify-between items-start gap-4">

  <div className="flex-1">

    <div className="inline-flex px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-orange-100 text-[#F97354] text-sm lg:text-base font-semibold">
      {product.category}
    </div>

    <h1 className="mt-4 lg:mt-5 text-2xl sm:text-3xl lg:text-5xl font-bold text-[#3B2418] leading-tight">
      {product.name}
    </h1>

    <div className="flex items-center gap-2 lg:gap-3 mt-3 lg:mt-4">

      <span className="text-yellow-500 text-base lg:text-xl">
        ⭐ {product.rating?.toFixed(1) || "0.0"}
      </span>

      <span className="text-gray-500 text-sm lg:text-base">
        ({product.numRatings || 0} Ratings)
      </span>

    </div>

  </div>

  <button
    onClick={(e) => handleToggleWishlist(e, product._id)}
    className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-white shadow-xl flex items-center justify-center border border-orange-100 flex-shrink-0"
  >
    {wishlist.includes(product._id) ? (
      <FaHeart size={20} color="#F97354" />
    ) : (
      <FaRegHeart size={20} color="#F97354" />
    )}
  </button>

</div>

{/* Price */}

<div className="flex flex-wrap items-center gap-3 lg:gap-4 mt-6 lg:mt-8">

  <span className="text-3xl lg:text-5xl font-bold text-[#F97354]">
    ₹{product.price}
  </span>

  <span className="line-through text-lg lg:text-2xl text-gray-400">
    ₹{product.mrp}
  </span>

  <span className="bg-red-100 text-red-600 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-base">
    {product.discount}% OFF
  </span>

</div>

{/* Description */}

<p className="mt-6 lg:mt-8 text-sm lg:text-lg leading-7 lg:leading-8 text-gray-600">
  {product.description}
</p>

{/* Stock */}

<div className="mt-6 lg:mt-8">

  <span
    className={`px-3 lg:px-4 py-2 rounded-full text-sm lg:text-base font-semibold ${
      product.inStock
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-600"
    }`}
  >
    {product.inStock ? "✔ In Stock" : "✖ Out of Stock"}
  </span>

</div>

{/* Ingredients */}

{product.ingredients && (

<div className="mt-8 lg:mt-10">

  <h3 className="text-lg lg:text-2xl font-bold text-[#3B2418] mb-3">
    Ingredients
  </h3>

  <div className="bg-[#FFF8F1] rounded-xl lg:rounded-2xl p-4 lg:p-5 text-sm lg:text-base text-gray-600 leading-7 lg:leading-8">
    {product.ingredients}
  </div>

</div>

)}

{/* Nutritional Information */}

{product.nutritionalInfo && (

<div className="mt-8">

  <h3 className="text-lg lg:text-2xl font-bold text-[#3B2418] mb-3">
    Nutritional Information
  </h3>

  <div className="bg-[#FFF8F1] rounded-xl lg:rounded-2xl p-4 lg:p-5 whitespace-pre-line text-sm lg:text-base leading-7 lg:leading-8 text-gray-600">
    {product.nutritionalInfo}
  </div>

</div>

)}

{/* Cart */}

<div className="mt-8 lg:mt-10">

{product.inStock && (

quantity === 0 ? (

<button
  onClick={() => addToCart(product)}
  className="w-full bg-[#F97354] hover:bg-[#ea6847] text-white py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg transition"
>
  🛒 Add To Cart
</button>

) : (

<div className="flex items-center justify-between rounded-xl lg:rounded-2xl overflow-hidden border border-orange-200 bg-orange-50">

  <button
    onClick={handleDecrement}
    className="w-12 h-12 lg:w-16 lg:h-16 bg-[#F97354] text-white text-2xl lg:text-3xl hover:bg-[#ea6847] transition"
  >
    −
  </button>

  <div className="text-xl lg:text-2xl font-bold text-[#3B2418]">
    {quantity}
  </div>

  <button
    onClick={handleIncrement}
    className="w-12 h-12 lg:w-16 lg:h-16 bg-[#F97354] text-white text-2xl lg:text-3xl hover:bg-[#ea6847] transition"
  >
    +
  </button>

</div>

)

)}

</div>
{/* Features */}

<div className="grid grid-cols-3 gap-2 lg:gap-5 mt-8 lg:mt-12">

  <div className="bg-[#FFF8F1] rounded-xl lg:rounded-2xl p-3 lg:p-5 text-center">

    <div className="text-2xl lg:text-4xl">
      🌿
    </div>

    <p className="mt-2 lg:mt-3 text-xs lg:text-base font-semibold text-[#3B2418]">
      100% Natural
    </p>

  </div>

  <div className="bg-[#FFF8F1] rounded-xl lg:rounded-2xl p-3 lg:p-5 text-center">

    <div className="text-2xl lg:text-4xl">
      🚚
    </div>

    <p className="mt-2 lg:mt-3 text-xs lg:text-base font-semibold text-[#3B2418]">
      Fast Delivery
    </p>

  </div>

  <div className="bg-[#FFF8F1] rounded-xl lg:rounded-2xl p-3 lg:p-5 text-center">

    <div className="text-2xl lg:text-4xl">
      🛡️
    </div>

    <p className="mt-2 lg:mt-3 text-xs lg:text-base font-semibold text-[#3B2418]">
      Quality Assured
    </p>

  </div>

</div>

{/* RIGHT CARD END */}
</div>

{/* MAIN GRID END */}
</div>

{/* Related Products */}

<div className="mt-12 lg:mt-20">

  <h2 className="text-2xl lg:text-4xl font-bold text-[#3B2418] mb-6 lg:mb-8">
    Related Products
  </h2>

  <div
    className="
      grid
      grid-cols-2
      sm:grid-cols-2
      lg:grid-cols-4
      gap-3
      lg:gap-8
    "
  >
    {relatedProducts.map((item) => (
      <ProductCard
        key={item._id}
        product={item}
        isWishlisted={wishlist.includes(item._id)}
        imageIndex={0}
        onClick={() => navigate(`/product/${item._id}`)}
        onHover={() => {}}
        onLeave={() => {}}
        toggleWishlist={handleToggleWishlist}
        backendUrl={BACKEND_BASE_URL}
      />
    ))}
  </div>

</div>

{/* PAGE END */}
</div>

</div>
);
};

export default ProductDetail;
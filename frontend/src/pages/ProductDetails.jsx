import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useUserStore from '../store/userStore';
import ProductCard from '../components/ProductCard'; 

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const { cartItems, addToCart, updateQuantity } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch product:', err);
        setLoading(false);
      });

    fetch(`${BACKEND_BASE_URL}/api/products/related/${id}`)
      .then(res => res.json())
      .then(data => setRelatedProducts(data));
  }, [id]);

  const getQuantity = () => {
    const item = cartItems.find((item) => item._id === id);
    return item ? item.quantity : 0;
  };

  const handleIncrement = () => {
    const currentQty = getQuantity();
    updateQuantity(id, currentQty + 1);
  };

  const handleDecrement = () => {
    const currentQty = getQuantity();
    if (currentQty > 1) updateQuantity(id, currentQty - 1);
  };

  const handleToggleWishlist = (e, productId) => {
    e.stopPropagation();
    if (wishlist.includes(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const quantity = getQuantity();

  if (loading) return <p className="text-center text-gray-700 mt-10">Loading...</p>;
  if (!product) return <p className="text-center text-red-500 mt-10">Product not found.</p>;

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-100 via-green-100 to-teal-200 py-8 px-4 md:px-16">
      {/* 🔍 Image Zoom View */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-[90%] max-h-[90%]" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${BACKEND_BASE_URL}${product.images[selectedImage]}`}
              className="max-h-[80vh] w-auto mx-auto rounded shadow-lg"
              alt={`Product Image ${selectedImage + 1}`}
            />
            {selectedImage > 0 && (
              <button onClick={() => setSelectedImage((prev) => prev - 1)} className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white text-3xl bg-black bg-opacity-50 px-4 py-2 rounded-r hover:bg-opacity-80">❮</button>
            )}
            {selectedImage < product.images.length - 1 && (
              <button onClick={() => setSelectedImage((prev) => prev + 1)} className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white text-3xl bg-black bg-opacity-50 px-4 py-2 rounded-l hover:bg-opacity-80">❯</button>
            )}
          </div>
        </div>
      )}

      {/* Product Details Section */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-[40%]">
          <Swiper pagination={{ clickable: true }} modules={[Pagination]} className="rounded-md">
            {product.images?.map((img, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={`${BACKEND_BASE_URL}${img}`}
                  alt={`${product.name} ${idx + 1}`}
                  onClick={() => setSelectedImage(idx)}
                  className="w-full h-[500px] object-cover rounded-md cursor-pointer"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="w-full md:w-[60%]">
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{product.category}</p>

          <div className="mt-2 flex items-center gap-2">
            <p className="text-yellow-600 font-semibold text-lg">⭐ {product.rating?.toFixed(1) || "0.0"}</p>
            <p className="text-gray-500 text-sm">({product.numRatings || 0} ratings)</p>
          </div>

          <div className="mt-4">
            <span className="text-2xl font-bold text-green-700">₹{product.price}</span>
            <span className="line-through text-gray-500 ml-3">₹{product.mrp}</span>
            <span className="ml-2 text-red-600 text-sm">({product.discount}% OFF)</span>
            {product.unit && (
              <span className="ml-4 text-sm text-gray-600">per {product.unit}</span>
            )}
          </div>

          <p className="mt-4 text-gray-700 whitespace-pre-line">{product.description}</p>
          <p className={`mt-4 font-medium ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </p>

          <div className="mt-4 flex items-center gap-2 text-red-600 cursor-pointer w-fit" onClick={(e) => handleToggleWishlist(e, product._id)}>
            {wishlist.includes(product._id) ? <FaHeart /> : <FaRegHeart />}
            <span className="text-sm">{wishlist.includes(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
          </div>

          {product.ingredients && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800">Ingredients:</h3>
              <p className="text-gray-700">{product.ingredients}</p>
            </div>
          )}

          {product.nutritionalInfo && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800">Nutritional Information:</h3>
              <p className="text-gray-700 whitespace-pre-line">{product.nutritionalInfo}</p>
            </div>
          )}

          {product.inStock && (
            <div className="mt-6">
              {quantity === 0 ? (
                <button onClick={() => addToCart(product)} className="px-6 py-2 bg-yellow-800 text-white rounded hover:bg-yellow-700 transition">Add to Cart</button>
              ) : (
                <div className="flex items-center space-x-4">
                  <button onClick={handleDecrement} className="px-3 py-1 bg-yellow-800 text-white rounded hover:bg-yellow-700 transition">-</button>
                  <span className="text-lg font-semibold">{quantity}</span>
                  <button onClick={handleIncrement} className="px-3 py-1 bg-yellow-800 text-white rounded hover:bg-yellow-700 transition">+</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-6xl mx-auto mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedProducts.map((item, index) => (
              <ProductCard
                key={item._id}
                product={item}
                isWishlisted={wishlist.includes(item._id)}
                imageIndex={0} // no slider needed
                onClick={() => navigate(`/product/${item._id}`)}
                onHover={() => {}}
                onLeave={() => {}}
                toggleWishlist={handleToggleWishlist}
                backendUrl={BACKEND_BASE_URL}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;



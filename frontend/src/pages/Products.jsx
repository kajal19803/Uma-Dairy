import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const Products = () =>{
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [filters, setFilters] = useState({
    category: '',
    inStock: '',
    unit: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchProducts = () => {
    const query = new URLSearchParams();

    if (filters.category) query.append('category', filters.category);
    if (filters.inStock) query.append('inStock', filters.inStock);
    if (filters.unit) query.append('unit', filters.unit);

    fetch(`${BACKEND_BASE_URL}/api/products?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        const initialIndexes = {};
        data.forEach(p => {
          initialIndexes[p._id] = 0;
        });
        setCurrentImageIndex(initialIndexes);
      })
      .catch(err => console.error('Failed to fetch products:', err));
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    if (token) {
      fetch(`${BACKEND_BASE_URL}/api/auth/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const ids = data.wishlist.map(p => p._id);
          setWishlistIds(ids);
        })
        .catch(err => console.error('Failed to fetch wishlist:', err));
    }
  }, [token]);

  useEffect(() => {
  if (
    hoveredIndex !== null &&
    products[hoveredIndex] &&
    Array.isArray(products[hoveredIndex].images) &&
    products[hoveredIndex].images.length > 0
  ) {
    const productId = products[hoveredIndex]._id;
    const imageCount = products[hoveredIndex].images.length;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => ({
        ...prev,
        [productId]: (prev[productId] + 1) % imageCount,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }
}, [hoveredIndex, products]);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();
    if (!token) {
      navigate('/login');
      return;
    }

    const isInWishlist = wishlistIds.includes(productId);
    const url = `${BACKEND_BASE_URL}/api/auth/wishlist/${isInWishlist ? 'remove' : 'add'}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      const data = await res.json();
      if (res.ok) {
        setWishlistIds(data.wishlist.map(id => id.toString()));
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };


  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-teal-200 p-6">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-6">All Products</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        <select
          value={filters.category}
          onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
          className="p-2 border bg-white rounded"
        >
          <option value="">All Categories</option>
          <option value="Dairy">Dairy</option>
          <option value="Paneer">Paneer</option>
          <option value="Ghee">Ghee</option>
        </select>

        <select
          value={filters.inStock}
          onChange={e => setFilters(prev => ({ ...prev, inStock: e.target.value }))}
          className="p-2 border bg-white rounded"
        >
          <option value="">Stock Status</option>
          <option value="true">In Stock</option>
          <option value="false">Out of Stock</option>
        </select>

        <select
          value={filters.unit}
          onChange={e => setFilters(prev => ({ ...prev, unit: e.target.value }))}
          className="p-2 border bg-white rounded"
        >
          <option value="">All Units</option>
          <option value="litre">Litre</option>
          <option value="kg">Kilogram</option>
          <option value="gm">Gram</option>
        </select>

        <button
          onClick={() => setFilters({ category: '', inStock: '', unit: '' })}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Reset Filters
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length === 0 && (
          <p className="col-span-full text-center">No products available</p>
        )}

        {products.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            isWishlisted={wishlistIds.includes(product._id)}
            imageIndex={currentImageIndex[product._id] || 0}
            onClick={() => handleProductClick(product._id)}
            onHover={() => setHoveredIndex(index)}
            onLeave={() => setHoveredIndex(null)}
            toggleWishlist={toggleWishlist}
            backendUrl={BACKEND_BASE_URL}
          />
        ))}
      </div>
    </div>
  );
};

export default Products;

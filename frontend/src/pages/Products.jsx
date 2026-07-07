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
    <div className="min-h-screen overflow-x-hidden w-screen bg-[#FFF8F1]">

  {/* Header */}

 <div className="pt-24 md:pt-28 pb-6 md:pb-8 text-center px-4">

    <h1 className="text-3xl md:text-5xl font-bold text-[#3B2418]">
      Our Products
    </h1>

    <p className="mt-2 md:mt-4 text-sm md:text-lg text-gray-600">
      Fresh • Pure • Farm to Home
    </p>

    <div className="mt-3 inline-flex px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-orange-100 text-xs md:text-base text-[#F97354] font-medium">
      {products.length} Products Available
    </div>

  </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-10">

<div className="w-[70%] md:w-full mx-auto bg-white rounded-3xl shadow-lg p-4 md:p-6 flex flex-wrap justify-center gap-3 md:gap-5">
<select
value={filters.category}
onChange={(e)=>setFilters(prev=>({...prev,category:e.target.value}))}
className="w-full sm:w-auto rounded-xl border border-orange-200 px-4 py-2.5 bg-[#FFF8F1] text-sm md:text-base text-[#3B2418] outline-none"
>

<option value="">All Categories</option>
<option value="Dairy">Dairy</option>
<option value="Paneer">Paneer</option>
<option value="Ghee">Ghee</option>

</select>

<select
value={filters.inStock}
onChange={(e)=>setFilters(prev=>({...prev,inStock:e.target.value}))}
className="w-full sm:w-auto rounded-xl border border-orange-200 px-4 py-2.5 bg-[#FFF8F1] text-sm md:text-base"
>

<option value="">Stock Status</option>
<option value="true">In Stock</option>
<option value="false">Out of Stock</option>

</select>

<select
value={filters.unit}
onChange={(e)=>setFilters(prev=>({...prev,unit:e.target.value}))}
className="w-full sm:w-auto rounded-xl border border-orange-200 px-4 py-2.5 bg-[#FFF8F1] text-sm md:text-base"
>

<option value="">All Units</option>
<option value="litre">Litre</option>
<option value="kg">Kilogram</option>
<option value="gm">Gram</option>

</select>

<button
onClick={()=>setFilters({category:"",inStock:"",unit:""})}
className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F97354] text-sm md:text-base text-white hover:bg-[#ea6b4b] transition"
>

Reset Filters

</button>

</div>

</div>

      {/* Product Grid */}
      <div className="p-3 md:p-1 max-w-7xl mx-auto px-4 md:px-0 grid
grid-cols-2
sm:grid-cols-2
lg:grid-cols-3
xl:grid-cols-4
gap-4
md:gap-8
pb-16 md:pb-20">
        {products.length === 0 && (
          <p className="col-span-full text-center text-xl text-gray-500 py-20">
No Products Found 🥛
</p>
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

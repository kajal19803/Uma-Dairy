import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search).get("q") || "";

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);

        const indexes = {};
        data.forEach((p) => {
          indexes[p._id] = 0;
        });

        setCurrentImageIndex(indexes);
      });
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredProducts(filtered);
  }, [query, products]);

  useEffect(() => {
    if (token) {
      fetch(`${BACKEND_BASE_URL}/api/auth/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setWishlistIds(data.wishlist.map((p) => p._id));
        });
    }
  }, [token]);

  useEffect(() => {
    if (
      hoveredIndex !== null &&
      filteredProducts[hoveredIndex] &&
      filteredProducts[hoveredIndex].images?.length > 0
    ) {
      const product = filteredProducts[hoveredIndex];

      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => ({
          ...prev,
          [product._id]:
            (prev[product._id] + 1) % product.images.length,
        }));
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [hoveredIndex, filteredProducts]);

  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();

    if (!token) {
      navigate("/login");
      return;
    }

    const isInWishlist = wishlistIds.includes(productId);

    const url = `${BACKEND_BASE_URL}/api/auth/wishlist/${
      isInWishlist ? "remove" : "add"
    }`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });

    const data = await res.json();

    if (res.ok) {
      setWishlistIds(data.wishlist.map((id) => id.toString()));
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] px-6 py-28">

      <h1 className="text-4xl font-bold text-[#4E342E] mb-2">
        Search Results
      </h1>

      <p className="text-gray-500 mb-8">
        Showing results for
        <span className="font-semibold text-[#F97354]">
          {" "}
          "{query}"
        </span>
      </p>

      {filteredProducts.length === 0 ? (
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-600">
            😔 No Products Found
          </h2>

          <p className="text-gray-400 mt-3">
            Try searching for Milk, Ghee, Paneer or Chhach.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              backendUrl={BACKEND_BASE_URL}
              isWishlisted={wishlistIds.includes(product._id)}
              imageIndex={currentImageIndex[product._id] || 0}
              onClick={() => navigate(`/product/${product._id}`)}
              onHover={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
              toggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;

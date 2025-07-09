import { useState, useEffect, useRef } from "react";
import { ShoppingCart, MoreVertical, X, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import useUserStore from '../store/userStore';


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef();
  const { clearUser } = useUserStore();

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    setIsLoggedIn(!!token);
    setUserRole(role);
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("userUpdated", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("userUpdated", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    clearUser();
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/login");
    setMenuOpen(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setShowSearch(false);
      if (menuOpen) setMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-2xl font-bold text-blue-600">
          <Link to="/" onClick={() => setMenuOpen(false)}>Uma Dairy</Link>
        </div>

        <div className="flex items-center space-x-4" ref={dropdownRef}>
          {/* Desktop Search */}
          <div className="hidden md:flex w-[250px]">
            <input
              type="text"
              placeholder="Search..."
              className="border px-3 py-1 rounded-md w-full bg-gray-100 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          {/* Mobile Search */}
          <div className="md:hidden">
            <button onClick={() => setShowSearch(!showSearch)} aria-label="Toggle search">
              <Search className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Cart */}
          {userRole !== "admin" && (
            <div className="relative">
              <Link to="/cart" onClick={() => setMenuOpen(false)} aria-label="Cart">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
              </Link>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          )}

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-4 font-medium text-gray-700">
            {!isLoggedIn ? (
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            ) : (
              <>
                {userRole === "admin" ? (
                  <Link to="/admindashboard" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                ) : (
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Profile</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-white"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="ml-1 p-0 bg-transparent border-none outline-none"
          >
            {menuOpen ? <X className="w-6 h-6 text-black" /> : <MoreVertical className="w-6 h-6 text-black" />}
          </button>

          {/* Mobile Dropdown */}
          {menuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-md rounded-md z-50 flex flex-col text-gray-700">
              <Link to="/" className="px-4 py-2 hover:bg-gray-100 border-b" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/features" className="px-4 py-2 hover:bg-gray-100 border-b" onClick={() => setMenuOpen(false)}>Features</Link>
              <Link to="/team" className="px-4 py-2 hover:bg-gray-100 border-b" onClick={() => setMenuOpen(false)}>Team</Link>
              <Link to="/contact" className="px-4 py-2 hover:bg-gray-100 border-b" onClick={() => setMenuOpen(false)}>Contact Us</Link>

              {!isLoggedIn ? (
                <Link to="/login" className="px-4 py-2 hover:bg-gray-100 border-b" onClick={() => setMenuOpen(false)}>Login</Link>
              ) : (
                <>
                  {userRole === "admin" ? (
                    <Link to="/admindashboard" className="px-4 py-2 hover:bg-gray-100 border-b" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                  ) : (
                    <Link to="/dashboard" className="px-4 py-2 hover:bg-gray-100 border-b" onClick={() => setMenuOpen(false)}>Profile</Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="px-4 py-2 text-left hover:bg-gray-100 text-red-600 font-semibold"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Input */}
      {showSearch && (
        <div className="absolute top-full left-0 w-full bg-white p-4 shadow-md md:hidden">
          <input
            type="text"
            placeholder="Search..."
            className="border px-3 py-2 w-full rounded-md bg-gray-100 text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            autoFocus
          />
        </div>
      )}
    </nav>
  );
};

export default Navbar;

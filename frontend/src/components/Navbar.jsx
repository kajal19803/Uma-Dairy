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

  // Notify other components
  window.dispatchEvent(new Event("userUpdated"));

  setMenuOpen(false);
  setShowSearch(false);

  navigate("/", { replace: true });
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
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#FFF8F1]/90 backdrop-blur-xl border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
    to="/"
    onClick={() => setMenuOpen(false)}
    className="flex items-center gap-3"
>
    <img
        src="/dairy-logo.png"
        alt="Uma Dairy"
        className="h-14 w-14 rounded-full object-cover shadow-md border border-orange-100"
    />

    <div>
        <h1 className="text-3xl font-bold text-[#4E342E] leading-none">
            Uma Dairy
        </h1>

        <p className="text-xs text-gray-500">
            Pure by Nature, Trusted by You
        </p>
    </div>
</Link>

        <div className="flex items-center space-x-4" ref={dropdownRef}>
          {/* Desktop Search */}
          <div className="hidden md:flex w-[250px]">
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-full border border-orange-200 bg-white px-5 py-2 text-black outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          {/* Mobile Search */}
          <div className="md:hidden">
            <button onClick={() => setShowSearch(!showSearch)} aria-label="Toggle search">
              <Search className="w-6 h-6 text-[#5C3A2E] hover:text-[#F97354] transition" />
            </button>
          </div>

          {/* Cart */}
          {userRole !== "admin" && (
            <div className="relative">
              <Link to="/cart" onClick={() => setMenuOpen(false)} aria-label="Cart">
                <ShoppingCart className="w-6 h-6 text-[#5C3A2E] hover:text-[#F97354] transition" />
              </Link>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F97354] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </div>
          )}

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8 font-medium text-[#5C3A2E]">
            {!isLoggedIn ? (
             <Link
                to="/login"
                className="rounded-full text-[#4E342E] border border-orange-300 px-5 py-2 transition hover:bg-[#F97354] hover:text-white"
             >
             Login
           </Link>
            ) : (
              <>
                {userRole === "admin" ? (
                  <Link to="/admindashboard"className="hover:text-[#F97354] text-[#4E342E] transition" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                ) : (
                  <Link to="/dashboard" className="hover:text-[#F97354] text-[#4E342E] transition" onClick={() => setMenuOpen(false)}>Profile</Link>
                )}
                <button
                 type="button"
                 onClick={handleLogout}
                 className="rounded-full bg-[#F97354] px-5 py-2 text-white transition hover:bg-[#e95d3d]"
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
            {menuOpen ? <X className="w-6 h-6 text-[#5C3A2E]"/> : <MoreVertical className="w-6 h-6 text-[#5C3A2E]" />}
          </button>

          {/* Mobile Dropdown */}
          {menuOpen && (
            <div className="absolute top-full right-0 mt-3 w-60 rounded-2xl bg-[#FFF8F1] shadow-2xl border border-orange-100 overflow-hidden z-50 flex flex-col">
              <Link to="/" className="px-4 py-2  text-[#4E342E] hover:bg-orange-50 border-b" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/features" className="px-4 py-2 text-[#4E342E] hover:bg-orange-50 border-b" onClick={() => setMenuOpen(false)}>Features</Link>
              <Link to="/team" className="px-4 py-2 text-[#4E342E] hover:bg-orange-50 border-b" onClick={() => setMenuOpen(false)}>Team</Link>
              <Link to="/contact" className="px-4 py-2 text-[#4E342E] hover:bg-orange-50 border-b" onClick={() => setMenuOpen(false)}>Contact Us</Link>

              {!isLoggedIn ? (
                <Link to="/login" className="px-4 py-2 text-[#4E342E] hover:bg-orange-50 border-b" onClick={() => setMenuOpen(false)}>Login</Link>
              ) : (
                <>
                  {userRole === "admin" ? (
                    <Link to="/admindashboard" className="px-4 py-2 text-[#4E342E] hover:bg-orange-50 border-b" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                  ) : (
                    <Link to="/dashboard" className="px-4 py-2 text-[#4E342E] hover:bg-orange-50 border-b" onClick={() => setMenuOpen(false)}>Profile</Link>
                  )}
                  <button
                   type="button"
                   onClick={handleLogout}
                   className="px-4 py-3 text-left text-[#F97354] font-semibold hover:bg-orange-50"
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
        <div className="absolute top-full left-0 w-full bg-[#FFF8F1] p-4 shadow-xl md:hidden">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-full border border-orange-200 bg-white px-5 py-3 text-black outline-none focus:border-orange-400"
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

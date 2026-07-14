import { useState, useEffect, useRef } from "react";
import { ShoppingCart, MoreVertical, X, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import useUserStore from '../store/userStore';


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(() => localStorage.getItem("userRole"));
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

  navigate("/", { replace: true });
};

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      if (menuOpen) setMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-screen z-50 bg-[#FFF8F1]/90 backdrop-blur-xl border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4 flex items-center justify-between">
        <Link
    to="/"
    onClick={() => setMenuOpen(false)}
    className="flex items-center gap-2 md:gap-3 min-w-0"
>
    <img
        src="/dairy-logo.png"
        alt="Uma Dairy"
        className="h-10 w-10 md:h-14 md:w-14 rounded-full object-cover shadow-md border border-orange-100 flex-shrink-0"
    />

    <div className="min-w-0">
        <h1 className="text-sm sm:text-xl md:text-3xl font-bold text-[#4E342E] leading-tight md:leading-none whitespace-normal md:whitespace-nowrap">
  <span className="block md:inline">Uma</span>
  <span className="block md:inline md:ml-1">Dairy</span>
</h1>

        <p className="hidden sm:block text-xs text-gray-550">
            Pure by Nature, Trusted by You
        </p>
    </div>
</Link>

        <div className="flex items-center gap-2 md:gap-4" ref={dropdownRef}>
          {/* Desktop Search */}
          <div className="hidden md:flex items-center relative w-[320px]">
  <Search
    className="absolute left-4 h-5 w-5 text-gray-400"
  />

  <input
    type="text"
    placeholder="Search for dairy products..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={handleSearchKeyDown}
    className="w-full pl-12 pr-4 py-3 rounded-full border border-orange-200 bg-white text-[#4E342E] outline-none transition-all duration-300 focus:border-[#F97354] focus:ring-2 focus:ring-orange-200"
  />
</div>

         {/* Mobile Search */}
<div className="flex-1 mx-2 md:hidden">
  <div className="flex items-center bg-white border border-orange-200 rounded-full px-3 py-1.5">
    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />

    <input
      type="text"
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyDown={handleSearchKeyDown}
      className="ml-2 w-full bg-transparent outline-none text-sm text-[#4E342E] placeholder:text-gray-400"
    />
  </div>
</div>
          {/* Cart */}
          {userRole !== "admin" && (
            <div className="relative">
              <Link to="/cart" onClick={() => setMenuOpen(false)} aria-label="Cart">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-[#5C3A2E] hover:text-[#F97354] transition"/>
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
                  <Link to="/admindashboard"className="text-[#4E342E] hover:text-[#F97354]  transition" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                ) : (
                  <Link to="/dashboard" className="text-[#4E342E] hover:text-[#F97354]  transition" onClick={() => setMenuOpen(false)}>Profile</Link>
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
            {menuOpen ? <X className="w-5 h-5 md:w-6 md:h-6 text-[#5C3A2E]"/> : <MoreVertical className="w-5 h-5 md:w-6 md:h-6 text-[#5C3A2E]" />}
          </button>

          {/* Mobile Dropdown */}
          {menuOpen && (
            <div className="absolute top-full right-1 mt-2 w-30 md:w-56 rounded-xl bg-[#FFF8F1] shadow-xl border border-orange-100 overflow-hidden z-50 flex flex-col">
              <Link to="/" className="px-5 py-2 text-sm  text-[#4E342E] hover:bg-orange-50 border-b" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/contact" className="px-2 py-2 text-sm  text-[#4E342E] hover:bg-orange-50 border-b" onClick={() => setMenuOpen(false)}>Contact Us</Link>
            <div className="md:hidden">
              {!isLoggedIn ? (
                <Link to="/login" className="px-5 py-2 text-sm  text-[#4E342E] hover:bg-orange-50 border-b" onClick={() => setMenuOpen(false)}>Login</Link>
              ) : (
                <>
                  {userRole === "admin" ? (
                    <Link to="/admindashboard" className="px-5 py-2 text-sm  text-[#4E342E] hover:bg-orange-50 border-b" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                  ) : (
                    <Link to="/dashboard" className="px-5 py-2 text-sm  text-[#4E342E] hover:bg-orange-50 border-b" onClick={() => setMenuOpen(false)}>Profile</Link>
                  )}
                  <button
                   type="button"
                   onClick={handleLogout}
                   className="px-5 py-2 text-sm bg-transparent text-[#F97354] font-semibold hover:bg-orange-50"
                   >
                   Logout
                  </button>
                </>
              )}
              </div>
            </div>
          )}
        </div>
      </div>

     
    </nav>
  );
};

export default Navbar;
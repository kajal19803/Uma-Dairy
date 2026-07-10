import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Moon, Sun } from 'lucide-react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import ChatWidget from './components/ChatWidget'; 
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetails';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Search from './components/search';
import Payment from './pages/Payment';
import PaymentStatus from './pages/PaymentStatus';
import About from './pages/About';
import Contact from './pages/Contact';
import ReviewPage from "./pages/ReviewPage";
import { WishlistProvider } from './context/WishlistContext';
import Policy from './pages/Policy';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const App = () => {
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    document.title = 'Uma Dairy';
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <GoogleOAuthProvider clientId={clientId || ''}>
      <WishlistProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          
          
          <div className="fixed bottom-4 left-4 z-50">
            <button
              onClick={() => setDarkMode(prev => !prev)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-yellow-500 dark:text-white shadow-lg transition duration-300"
              aria-label="Toggle Dark Mode"
            >
              { darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Navbar */}
          <Navbar />
           

          {/* Main Content */}
          <main className="flex-grow pt-16">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/admindashboard" element={<PrivateRoute adminOnly={true}><AdminDashboard /></PrivateRoute>} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/paymentstatus" element={<PaymentStatus />} />
                <Route path="/about" element={<About />} />
                <Route path="/policy" element={<Policy />}/>
                <Route path="/contact" element={<Contact />} />
                <Route path="/review" element={<ReviewPage />} />
              </Routes>
            </ErrorBoundary>
          </main>

          {/* Footer */}
          <Footer />

          
          <ChatWidget />
        </div>
      </WishlistProvider>
    </GoogleOAuthProvider>
  );
};

export default App;

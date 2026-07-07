import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#FFF8F1] border-t border-orange-100 mt-0">

      <div className="max-w-7xl mx-auto px-5 md:px-6 py-10 md:py-14">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">

          {/* Logo */}

          <div>

            <div className="flex items-center gap-3">

              <img
                src="/dairy-logo.png"
                alt="Uma Dairy"
                className="w-12 h-12 md:w-16 md:h-16 rounded-full shadow-md"
              />

              <div>

                <h2 className="text-2xl md:text-3xl font-bold text-[#3B2418]">
                  Uma Dairy
                </h2>

                <p className="text-[11px] md:text-sm text-gray-500">
                  Pure by Nature, Trusted by You
                </p>

              </div>

            </div>

            <p className="mt-4 text-sm md:text-base text-gray-600 leading-6 md:leading-7">
              Fresh milk, desi ghee, curd and traditional dairy
              products made with love and delivered fresh from
              our farm to your home.
            </p>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="text-lg md:text-xl font-bold text-[#3B2418] mb-4 md:mb-5">
              Quick Links
            </h3>

            <div className="space-y-2">

              <Link
                to="/"
                className="block text-sm md:text-base text-gray-600 hover:text-[#F97354]"
              >
                Home
              </Link>

              <Link
                to="/products"
                className="block text-sm md:text-base text-gray-600 hover:text-[#F97354]"
              >
                Products
              </Link>

              <Link
                to="/about"
                className="block text-sm md:text-base text-gray-600 hover:text-[#F97354]"
              >
                About Us
              </Link>

              <Link
                to="/contact"
                className="block text-sm md:text-base text-gray-600 hover:text-[#F97354]"
              >
                Contact
              </Link>

              <Link
                to="/policy"
                className="block text-sm md:text-base text-gray-600 hover:text-[#F97354]"
              >
                Policy
              </Link>

            </div>

          </div>
                    {/* Products */}

          <div>

            <h3 className="text-lg md:text-xl font-bold text-[#3B2418] mb-4 md:mb-5">
              Our Products
            </h3>

            <div className="space-y-2 text-sm md:text-base text-gray-600">

              <p>🥛 Fresh Milk</p>
              <p>🧈 Desi Ghee</p>
              <p>🥣 Curd</p>
              <p>🌿 Cow Dung Cakes</p>

            </div>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-lg md:text-xl font-bold text-[#3B2418] mb-4 md:mb-5">
              Contact
            </h3>

            <div className="space-y-3 text-sm md:text-base text-gray-600">

              <div className="flex items-center gap-3">
                <Mail className="text-[#F97354] flex-shrink-0" size={18} />
                <span>support@umadairy.com</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="text-[#F97354] flex-shrink-0" size={18} />
                <span>Jabalpur, Madhya Pradesh</span>
              </div>

            </div>

            <div className="flex gap-3 mt-6">

              <a
                href="#"
                className="p-2.5 md:p-3 rounded-full bg-white shadow hover:bg-[#F97354] hover:text-white transition"
              >
                <Facebook size={18} />
              </a>

              <a
                href="#"
                className="p-2.5 md:p-3 rounded-full bg-white shadow hover:bg-[#F97354] hover:text-white transition"
              >
                <Instagram size={18} />
              </a>

              <a
                href="#"
                className="p-2.5 md:p-3 rounded-full bg-white shadow hover:bg-[#F97354] hover:text-white transition"
              >
                <Linkedin size={18} />
              </a>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div className="border-t border-orange-100">

        <div className="max-w-7xl mx-auto px-5 md:px-6 py-4 md:py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-center">

          <p className="text-xs md:text-sm text-gray-500">
            © 2026 Uma Dairy. All Rights Reserved.
          </p>

          <p className="text-xs md:text-sm text-gray-500">
            Made with ❤️ using React & Node.js
          </p>

        </div>

      </div>

    </footer>
  );
}



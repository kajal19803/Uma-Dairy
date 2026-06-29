import {
  Facebook,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#FFF8F1] border-t border-orange-100 mt-0">

      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">

          {/* Logo */}
          <div>

            <div className="flex items-center gap-3">

              <img
                src="/dairy-logo.png"
                alt="Uma Dairy"
                className="w-16 h-16 rounded-full shadow-md"
              />

              <div>
                <h2 className="text-3xl font-bold text-[#3B2418]">
                  Uma Dairy
                </h2>

                <p className="text-gray-500 text-sm">
                  Pure by Nature, Trusted by You
                </p>
              </div>

            </div>

            <p className="mt-5 text-gray-600 leading-7">
              Fresh milk, desi ghee, curd and traditional dairy
              products made with love and delivered fresh from
              our farm to your home.
            </p>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="text-xl font-bold text-[#3B2418] mb-5">
              Quick Links
            </h3>

            <div className="space-y-3">

              <Link
                to="/"
                className="block text-gray-600 hover:text-[#F97354]"
              >
                Home
              </Link>

              <Link
                to="/products"
                className="block text-gray-600 hover:text-[#F97354]"
              >
                Products
              </Link>

              <Link
                to="/about"
                className="block text-gray-600 hover:text-[#F97354]"
              >
                About Us
              </Link>

              <Link
                to="/contact"
                className="block text-gray-600 hover:text-[#F97354]"
              >
                Contact
              </Link>

            </div>

          </div>

          {/* Products */}

          <div>

            <h3 className="text-xl font-bold text-[#3B2418] mb-5">
              Our Products
            </h3>

            <div className="space-y-3 text-gray-600">

              <p>🥛 Fresh Milk</p>
              <p>🧈 Desi Ghee</p>
              <p>🥣 Curd</p>
              <p>🌿 Cow Dung Cakes</p>

            </div>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-xl font-bold text-[#3B2418] mb-5">
              Contact
            </h3>

            <div className="space-y-4 text-gray-600">

              <div className="flex gap-3">
                <Phone className="text-[#F97354]" size={18} />
                <span>+91 XXXXXXXXXX</span>
              </div>

              <div className="flex gap-3">
                <Mail className="text-[#F97354]" size={18} />
                <span>support@umadairy.com</span>
              </div>

              <div className="flex gap-3">
                <MapPin className="text-[#F97354]" size={18} />
                <span>Ranchi, Jharkhand</span>
              </div>

            </div>

            <div className="flex gap-4 mt-8">

              <a
                href="#"
                className="p-3 rounded-full bg-white shadow hover:bg-[#F97354] hover:text-white transition"
              >
                <Facebook size={18} />
              </a>

              <a
                href="#"
                className="p-3 rounded-full bg-white shadow hover:bg-[#F97354] hover:text-white transition"
              >
                <Instagram size={18} />
              </a>

              <a
                href="#"
                className="p-3 rounded-full bg-white shadow hover:bg-[#F97354] hover:text-white transition"
              >
                <Linkedin size={18} />
              </a>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div className="border-t border-orange-100">

        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center">

          <p className="text-gray-500 text-sm">
            © 2026 Uma Dairy. All Rights Reserved.
          </p>

          <p className="text-sm text-gray-500 mt-3 md:mt-0">
            Made with ❤️ using React & Node.js
          </p>

        </div>

      </div>

    </footer>
  );
}



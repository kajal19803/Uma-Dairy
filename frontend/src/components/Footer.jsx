import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="w-full bg-green-100 text-green-800 px-6  border-t border-green-300">
    < div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 h-16">
      <span className="text-sm font-medium">
        © 2025 <span className="font-semibold">Uma Dairy</span>. All rights reserved.
      </span>

      <ul className="flex flex-wrap gap-x-6 text-sm font-medium">
        <li>
          <Link to="/about" className="hover:underline">
            About Us
          </Link>
        </li>
        <li>
          <Link to="/policy" className="hover:underline">
            Policy & Legal
          </Link>
        </li>
        <li>
          <Link to="/contact" className="hover:underline">
            Contact
          </Link>
        </li>
        <li>
          <a href="mailto:support@umadairy.com" className="hover:underline">
            support@umadairy.com
          </a>
        </li>
      </ul>
    </div>
  </footer>
);

export default Footer;



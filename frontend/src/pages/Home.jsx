import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-green-100 to-teal-200 px-4">
      <motion.div
        className="text-center max-w-2xl bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-teal-200"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-teal-700 mb-4 flex justify-center items-center gap-2"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          🐄 Uma Dairy 🧈
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-gray-700 mb-6 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          🥛 शुद्धता, परंपरा और भरोसे का संगम। <br />
          देसी घी, ताज़ा दूध और घर जैसा स्वाद।
        </motion.p>

        <motion.div
          className="text-sm text-gray-500 mb-6 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          "जहाँ हर बूँद में है माँ के हाथों का स्वाद।"
        </motion.div>

        <motion.button
          onClick={() => navigate('/products')}
          className="px-7 py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold rounded-full shadow-md hover:from-teal-600 hover:to-green-600 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
        >
          🛒 See Our Products
        </motion.button>
      </motion.div>
    </div>
  );
}


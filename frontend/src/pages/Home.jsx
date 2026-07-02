import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen bg-[#FFF8F1]">

      {/* HERO SECTION */}
<section className="pt-28 pb-16 px-5">
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="relative max-w-7xl mx-auto h-[560px] rounded-[32px] overflow-hidden shadow-2xl"
  >

    {/* Background Image */}
    <img
      src="/hero.png"
      alt="Uma Dairy"
      className="absolute inset-0 w-full h-full object-cover object-[75%]"
    />

    {/* Left Fade Overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 via-[35%] to-transparent" />

    {/* Content */}
    <div className="relative z-10 h-full flex items-center">

      <div className="max-w-xl px-10 lg:px-16">

        <div className="inline-flex items-center gap-2 bg-orange-100 text-[#F97354] px-5 py-2 rounded-full font-semibold mb-7">
          🌿 100% Pure & Natural
        </div>

        <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-[#3B2418]">
          Good for You,
          <br />
          Good for{" "}
          <span className="text-[#F97354]">
            Nature
          </span>
        </h1>
        <p className="mt-5 text-lg leading-8 text-black text-bold"> 📍 Currently Delivering Only in Jabalpur </p>
        <p className="mt-7 text-lg leading-8 text-gray-700">
          Fresh milk, pure desi ghee, homemade curd and
          traditional dairy products delivered directly
          from our farm to your home.
        </p>

        <div className="flex flex-wrap gap-5 mt-10">

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/products")}
            className="px-8 py-4 rounded-xl bg-[#F97354] text-white font-semibold shadow-lg hover:bg-[#eb6847]"
          >
            Shop Now
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-xl border border-[#F97354] text-[#F97354] bg-white font-semibold hover:bg-orange-50"
          >
            Learn More
          </motion.button>

        </div>

      </div>

    </div>

  </motion.div>
</section>

      {/* CTA SECTION */}

      <section className="pb-20 px-5">

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-[#F97354] to-[#ffb36c] p-12 text-center text-white shadow-xl"
        >

          <h2 className="text-4xl font-bold">
            Taste the Purity of Nature
          </h2>

          <p className="mt-5 text-lg opacity-90">
            Experience fresh dairy products made with love,
            tradition and freshness delivered straight from
            our farm to your home.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="mt-8 bg-white text-[#F97354] px-8 py-4 rounded-full font-bold inline-flex items-center gap-2 hover:scale-105 transition"
          >
            Explore Products
            <ArrowRight size={18} />
          </button>

        </motion.div>

      </section>

    </div>
  );
}


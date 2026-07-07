import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-[#FFF8F1]">

      {/* HERO SECTION */}
      <section className="pt-24 md:pt-28 pb-14 md:pb-16 px-4 md:px-5">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-7xl mx-auto h-[380px] sm:h-[430px] md:h-[560px] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl"
        >

          {/* Background Image */}
          <img
            src="/hero.png"
            alt="Uma Dairy"
            className="absolute inset-0 w-full h-full object-cover object-right md:object-[75%]"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/75 via-[45%] to-transparent" />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">

            <div className="max-w-[220px] sm:max-w-sm md:max-w-xl px-5 md:px-10 lg:px-16">

              <div className="inline-flex items-center gap-2 bg-orange-100 text-[#F97354] px-3 md:px-5 py-1 rounded-full text-[11px] md:text-base font-semibold mb-3 md:mb-7">
                🌿 100% Pure & Natural
              </div>

              <h1 className="text-[22px] sm:text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-[#3B2418]">
                Good for You,
                <br />
                Good for{" "}
                <span className="text-[#F97354]">
                  Nature
                </span>
              </h1>

              <p className="mt-2 text-[12px] md:text-lg font-semibold text-black">
                📍 Currently Delivering Only in Jabalpur
              </p>

              <p className="mt-3 text-[12px] md:text-lg leading-5 md:leading-8 text-gray-700">
                Fresh milk, pure desi ghee,
                homemade curd and traditional
                dairy products delivered directly
                from our farm to your home.
              </p>
                            <div className="flex flex-wrap gap-2 md:gap-5 mt-5 md:mt-10">

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/products")}
                  className="px-4 md:px-8 py-2 md:py-4 rounded-xl bg-[#F97354] text-white text-sm md:text-base font-semibold shadow-lg hover:bg-[#eb6847]"
                >
                  Shop Now
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 md:px-8 py-2 md:py-4 rounded-xl border border-[#F97354] text-[#F97354] text-sm md:text-base bg-white font-semibold hover:bg-orange-50"
                >
                  Learn More
                </motion.button>

              </div>

            </div>

          </div>

        </motion.div>

      </section>

      {/* CTA SECTION */}

      <section className="pb-16 md:pb-20 px-4 md:px-5">

        <motion.div
          whileHover={{ scale: 1.01 }}
         className="max-w-6xl mx-auto rounded-[22px] md:rounded-3xl bg-gradient-to-r from-[#F97354] to-[#ffb36c] p-4 md:p-12 text-center text-white shadow-xl"
        >

          <h2 className="text-lg md:text-4xl font-bold leading-tight">
            Taste the Purity of Nature
          </h2>

          <p className="mt-2 md:mt-5 text-xs md:text-lg leading-5 md:leading-8 opacity-90 max-w-[260px] md:max-w-3xl mx-auto">
            Experience fresh dairy products made with love,
            tradition and freshness delivered straight from
            our farm to your home.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="mt-4 md:mt-8 bg-white text-[#F97354] px-4 md:px-8 py-2 md:py-4 rounded-full text-sm md:text-base font-bold inline-flex items-center gap-2 hover:scale-105 transition"
          >
            Explore Products
            <ArrowRight size={18} />
          </button>

        </motion.div>

      </section>

    </div>
  );
}


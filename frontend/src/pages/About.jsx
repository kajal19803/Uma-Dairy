const About = () => {
  return (
    <div className="min-h-screen w-screen bg-[#FFF8F1] pt-28 pb-20">

      <div className="max-w-7xl mx-auto px-5">

        {/* Hero */}
        <div className="text-center mb-16">

          <div className="inline-flex px-5 py-2 rounded-full bg-orange-100 text-[#F97354] font-semibold">
            Since 2025
          </div>

          <h1 className="mt-6 text-5xl md:text-6xl font-bold text-[#3B2418]">
            About Uma Dairy
          </h1>

          <p className="mt-5 text-lg text-gray-600 max-w-3xl mx-auto">
            Bringing fresh, pure and natural dairy products directly from our
            farm to your family's table.
          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left Image */}

          <div className="relative">

            <img
              src="/hero.png"
              alt="Uma Dairy"
              className="rounded-[32px] shadow-2xl w-full h-[550px] object-cover"
            />

            <div className="absolute bottom-8 left-8 bg-white rounded-3xl shadow-xl px-8 py-6">

              <h2 className="text-4xl font-bold text-[#F97354]">
                100%
              </h2>

              <p className="text-gray-600 font-medium">
                Natural Dairy Products
              </p>

            </div>

          </div>

          {/* Right */}

          <div>

            <h2 className="text-4xl font-bold text-[#3B2418] mb-8">
              Our Story
            </h2>

            <p className="text-gray-600 leading-8 text-lg mb-6">
              Uma Dairy started in <strong>2025</strong> as a small family-run
              dairy business with one simple goal — delivering fresh, healthy
              and pure dairy products to every home.
            </p>

            <p className="text-gray-600 leading-8 text-lg mb-6">
              We began by serving customers locally through offline sales. With
              growing trust and positive feedback, we expanded our reach and
              embraced technology to provide a seamless online shopping
              experience.
            </p>

            <p className="text-gray-600 leading-8 text-lg">
              Today, Uma Dairy proudly supports local farmers, follows ethical
              farming practices and ensures every product meets the highest
              quality standards before reaching your doorstep.
            </p>

            <div className="grid grid-cols-2 gap-5 mt-10">

              <div className="bg-white rounded-3xl shadow-lg p-6">

                <div className="text-5xl mb-4">
                  🥛
                </div>

                <h3 className="font-bold text-xl text-[#3B2418]">
                  Fresh Dairy
                </h3>

                <p className="text-gray-500 mt-2">
                  Daily fresh milk, ghee, paneer and more.
                </p>

              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6">

                <div className="text-5xl mb-4">
                  🌿
                </div>

                <h3 className="font-bold text-xl text-[#3B2418]">
                  Natural Quality
                </h3>

                <p className="text-gray-500 mt-2">
                  No harmful chemicals or artificial additives.
                </p>

              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6">

                <div className="text-5xl mb-4">
                  🚚
                </div>

                <h3 className="font-bold text-xl text-[#3B2418]">
                  Fast Delivery
                </h3>

                <p className="text-gray-500 mt-2">
                  Farm fresh products delivered quickly.
                </p>

              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6">

                <div className="text-5xl mb-4">
                  ❤️
                </div>

                <h3 className="font-bold text-xl text-[#3B2418]">
                  Trusted by Families
                </h3>

                <p className="text-gray-500 mt-2">
                  Quality and customer satisfaction always come first.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default About;




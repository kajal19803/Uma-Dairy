import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: Send data to backend

    setSubmitted(true);
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen w-screen bg-[#FFF8F1] pt-28 pb-20">

      <div className="max-w-7xl mx-auto px-5">

        <div className="text-center mb-16">

          <div className="inline-flex px-5 py-2 rounded-full bg-orange-100 text-[#F97354] font-semibold">
            Get In Touch
          </div>

          <h1 className="mt-6 text-3xl lg:text-5xl md:text-6xl font-bold text-[#3B2418]">
            Contact Us
          </h1>

          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you. Send us your questions,
            feedback or suggestions and we'll get back to you as soon as possible.
          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* Left */}

          <div className="space-y-6">

            <div className="bg-white rounded-3xl shadow-xl p-8">

              <div className="text-5xl mb-5">📍</div>

              <h2 className="text-2xl font-bold text-[#3B2418]">
                Visit Us
              </h2>

              <p className="mt-4 text-gray-600 leading-8">
                Uma Dairy<br />
                Fresh Dairy Farm<br />
                Jabalpur, Madhya Pradesh<br />
              </p>

            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8">

              <div className="text-5xl mb-5">📞</div>

              <h2 className="text-2xl font-bold text-[#3B2418]">
                Call Us
              </h2>

              <p className="mt-4 text-gray-600">
                +91 XXXXX XXXXX
              </p>

            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8">

              <div className="text-5xl mb-5">✉️</div>

              <h2 className="text-2xl font-bold text-[#3B2418]">
                Email
              </h2>

              <p className="mt-4 text-gray-600">
                support@umadairy.com
              </p>

            </div>

          </div>

          {/* Right */}

          <div className="bg-white rounded-[32px] shadow-xl p-10">

            {submitted ? (

              <div className="text-center py-16">

                <div className="text-7xl mb-6">
                  ✅
                </div>

                <h2 className="text-4xl font-bold text-[#3B2418]">
                  Thank You!
                </h2>

                <p className="mt-5 text-gray-600 text-lg">
                  Your message has been sent successfully.
                  We will contact you soon.
                </p>

              </div>

            ) : (

              <form onSubmit={handleSubmit} className="space-y-6">

                <div>

                  <label className="block mb-2 font-semibold text-[#3B2418]">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none focus:border-[#F97354]"
                  />

                </div>

                <div>

                  <label className="block mb-2 font-semibold text-[#3B2418]">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none focus:border-[#F97354]"
                  />

                </div>

                <div>

                  <label className="block mb-2 font-semibold text-[#3B2418]">
                    Message
                  </label>

                  <textarea
                    rows="6"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none resize-none focus:border-[#F97354]"
                  />

                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[#F97354] hover:bg-[#ea6847] text-white font-bold text-lg transition"
                >
                  Send Message
                </button>

              </form>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Contact;

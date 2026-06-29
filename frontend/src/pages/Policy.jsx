import React from "react";

const sections = [
  {
    icon: "🔒",
    title: "Privacy Policy",
    content:
      "Uma Dairy respects your privacy. We collect only the information required to process orders, improve our services, and provide a better shopping experience.",
    points: [
      "Personal information such as name, phone number and address",
      "Order history and basic usage analytics",
      "Your information is never sold to third parties",
      "Only trusted delivery and payment partners receive required data",
    ],
  },
  {
    icon: "💸",
    title: "Refund & Cancellation",
    content:
      "Orders can be cancelled within 10 minutes of placement. Due to the perishable nature of dairy products, returns are generally not accepted.",
    points: [
      "Refund if the order was not delivered",
      "Refund for damaged or expired products",
      "Issue must be reported within 24 hours with proof",
      "Support: support@umadairy.com",
    ],
  },
  {
    icon: "🚚",
    title: "Shipping & Delivery",
    content:
      "We deliver fresh dairy products to selected service locations. Delivery time may vary depending on weather, festivals, or local conditions.",
    points: [
      "Fast doorstep delivery",
      "Fresh products packed hygienically",
      "Delivery timeline depends on location",
    ],
  },
  {
    icon: "📜",
    title: "Terms & Conditions",
    content:
      "By using Uma Dairy, you agree to follow our latest terms and conditions.",
    points: [
      "Provide accurate delivery information",
      "Prices may change without notice",
      "Any misuse may lead to account suspension",
    ],
  },
  {
    icon: "🧑‍⚖️",
    title: "User Conduct",
    content:
      "Users must use the platform responsibly and ethically.",
    points: [
      "No fake orders",
      "No abusive behaviour",
      "No fraudulent activities",
    ],
  },
  {
    icon: "⚠️",
    title: "Liability Disclaimer",
    content:
      "Uma Dairy strives to maintain the highest quality standards, but natural products may vary slightly.",
    points: [
      "Weather may affect delivery",
      "Natural variations in dairy products are possible",
    ],
  },
  {
    icon: "⚖️",
    title: "Governing Law",
    content:
      "These policies are governed by the laws of India.",
    points: [
      "Jurisdiction: Jabalpur, Madhya Pradesh",
    ],
  },
];

const Policy = () => {
  return (
    <div className="min-h-screen w-screen bg-[#FFF8F1] pt-28 pb-20">

      <div className="max-w-7xl mx-auto px-5">

        {/* Header */}

        <div className="text-center mb-16">

          <div className="inline-flex px-5 py-2 rounded-full bg-orange-100 text-[#F97354] font-semibold">
            Legal Information
          </div>

          <h1 className="mt-6 text-5xl md:text-6xl font-bold text-[#3B2418]">
            Policy Center
          </h1>

          <p className="mt-5 text-lg text-gray-600 max-w-3xl mx-auto">
            Transparency and trust are the foundation of Uma Dairy.
            Please read our policies carefully before using our services.
          </p>

        </div>

        {/* Cards */}

        <div className="grid md:grid-cols-2 gap-8">

          {sections.map((section, index) => (

            <div
              key={index}
              className="bg-white rounded-[30px] shadow-xl p-8 hover:-translate-y-2 hover:shadow-2xl transition duration-300"
            >

              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-3xl mb-6">
                {section.icon}
              </div>

              <h2 className="text-3xl font-bold text-[#3B2418] mb-5">
                {section.title}
              </h2>

              <p className="text-gray-600 leading-8 mb-6">
                {section.content}
              </p>

              <ul className="space-y-3">

                {section.points.map((item, i) => (

                  <li
                    key={i}
                    className="flex items-start gap-3 text-gray-600"
                  >

                    <span className="text-[#F97354] font-bold">
                      ✔
                    </span>

                    <span>{item}</span>

                  </li>

                ))}

              </ul>

            </div>

          ))}

        </div>

        {/* Footer */}

        <div className="mt-16 bg-white rounded-[30px] shadow-xl p-8 text-center">

          <h3 className="text-3xl font-bold text-[#3B2418]">
            Need Help?
          </h3>

          <p className="mt-4 text-gray-600 text-lg">
            If you have any questions regarding our policies,
            please contact our support team.
          </p>

          <div className="mt-6 inline-flex px-6 py-3 rounded-full bg-orange-100 text-[#F97354] font-semibold">
            📧 support@umadairy.com
          </div>

          <p className="mt-8 text-gray-400 text-sm">
            Last Updated • June 2025
          </p>

        </div>

      </div>

    </div>
  );
};

export default Policy;

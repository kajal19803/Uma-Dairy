import React from 'react';


const Policy = () => (
  <div className="w-screen min-h-screen bg-white flex justify-center items-start py-10 px-4">
    <div className="max-w-4xl w-full text-center text-green-900 space-y-6">

      <h1 className="text-4xl font-bold border-b-2 border-green-800 pb-2">Uma Dairy – Policy Center</h1>

      {/* Privacy Policy */}
      <section>
        <h2 className="text-2xl font-semibold mt-6">🔒 Privacy Policy</h2>
        <p>Uma Dairy respects your privacy. We collect limited information to process orders, enhance user experience, and provide better service.</p>
        <ul className="list-disc list-inside text-left mt-2">
          <li>Personal data: Name, address, phone number, etc.</li>
          <li>Usage data: Analytics, device info, order history</li>
        </ul>
        <p>We do not sell your data. Only trusted delivery/payment partners may access it for service fulfillment.</p>
      </section>

      {/* Refund & Cancellation Policy */}
      <section>
        <h2 className="text-2xl font-semibold mt-6">💸 Refund & Cancellation Policy</h2>
        <p>Orders can be cancelled within 10 minutes of placement. No returns are accepted due to perishability.</p>
        <p>Refunds are allowed only in these cases:</p>
        <ul className="list-disc list-inside text-left mt-2">
          <li>Product not delivered</li>
          <li>Damaged or expired items (must be reported within 24 hrs with proof)</li>
        </ul>
        <p>Contact: <strong>support@umadairy.com</strong></p>
      </section>

      {/* Shipping & Delivery */}
      <section>
        <h2 className="text-2xl font-semibold mt-6">🚚 Shipping & Delivery</h2>
        <p>We deliver to select pin codes within Madhya Pradesh. Orders are usually dispatched within a few hours depending on availability and time of day.</p>
        <p>Delivery timelines may vary due to weather, festivals, or logistical challenges.</p>
      </section>

      {/* Terms & Conditions */}
      <section>
        <h2 className="text-2xl font-semibold mt-6">📜 Terms & Conditions</h2>
        <ul className="list-disc list-inside text-left mt-2">
          <li>Provide accurate and updated delivery details</li>
          <li>Use our platform lawfully; any misuse can lead to legal action</li>
          <li>Prices and availability are subject to change without prior notice</li>
        </ul>
        <p>Continued use of Uma Dairy means acceptance of the latest terms.</p>
      </section>

      {/* User Conduct */}
      <section>
        <h2 className="text-2xl font-semibold mt-6">🧑‍⚖️ User Conduct</h2>
        <p>Any form of abusive behavior, spamming, fake orders, or fraudulent claims will lead to account suspension and legal action.</p>
      </section>

      {/* Liability Disclaimer */}
      <section>
        <h2 className="text-2xl font-semibold mt-6">⚠️ Liability Disclaimer</h2>
        <p>Uma Dairy is not responsible for delays due to unforeseen conditions. We ensure best quality, but product outcomes may vary slightly due to environmental factors.</p>
      </section>

      {/* Governing Law */}
      <section>
        <h2 className="text-2xl font-semibold mt-6">⚖️ Governing Law & Jurisdiction</h2>
        <p>This agreement shall be governed by the laws of India. All legal matters are subject to Jabalpur jurisdiction.</p>
      </section>

      <footer className="mt-10 text-sm text-gray-600">
        Last updated: June 2025
      </footer>

    </div>
  </div>
);

export default Policy;

import React from 'react';

const About = () => {
  return (
    
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      {/* px-4 thoda horizontal padding de raha hai */}
      <div className="max-w-3xl w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">About Uma Dairy</h1>
        <p className="text-gray-700 mb-4">
          Uma Dairy was initiated in 2025 as a small family business. Initially, we operated offline, selling fresh and high-quality dairy products directly to our community.
        </p>
        <p className="text-gray-700 mb-4">
          Over the years, our passion for quality and customer satisfaction has helped us grow and connect with more customers. Today, we are embracing technology to bring the same trusted products right to your doorstep.
        </p>
        <p className="text-gray-700">
          We remain committed to sustainable farming practices, supporting local farmers, and delivering the freshest dairy products to every home.
        </p>
      </div>
    </div>
  );
};

export default About;




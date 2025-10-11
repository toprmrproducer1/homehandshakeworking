import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-black">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          Welcome to Our Platform
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Transform your content with AI-powered tools
        </p>
      </div>
    </section>
  );
};

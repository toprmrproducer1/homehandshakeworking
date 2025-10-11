import React from 'react';
import { motion } from 'framer-motion';
import { useClerk } from '@clerk/clerk-react';
import { ArrowRight, Rocket } from 'lucide-react';

export const HeroLightning: React.FC = () => {
  const { openSignIn } = useClerk();

  const handleGetStarted = () => {
    openSignIn({
      afterSignInUrl: '/',
      afterSignUpUrl: '/',
    });
  };

  const handleSignIn = () => {
    openSignIn({
      afterSignInUrl: '/',
      afterSignUpUrl: '/',
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col bg-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black"></div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="1" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <motion.path
          d="M 650 80 L 630 140 L 680 140 L 650 220 L 620 300 L 680 300 L 640 400 L 600 500 L 660 500 L 620 600"
          stroke="url(#lightningGradient)"
          strokeWidth="3"
          fill="none"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 1, 0],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1,
            ease: "easeInOut"
          }}
        />

        <motion.path
          d="M 400 100 L 380 180 L 420 180 L 390 260 L 360 340 L 410 340 L 380 420"
          stroke="url(#lightningGradient)"
          strokeWidth="2.5"
          fill="none"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 1, 0],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatDelay: 1.5,
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        <motion.path
          d="M 900 120 L 880 200 L 920 200 L 890 280 L 860 360 L 910 360 L 880 450 L 840 550"
          stroke="url(#lightningGradient)"
          strokeWidth="2"
          fill="none"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 1, 0],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <motion.circle
          cx="650"
          cy="80"
          r="8"
          fill="#a855f7"
          filter="url(#glow)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.5, 1, 0],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1,
            ease: "easeInOut"
          }}
        />

        <motion.circle
          cx="400"
          cy="100"
          r="6"
          fill="#c084fc"
          filter="url(#glow)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.5, 1, 0],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatDelay: 1.5,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </svg>

      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center transform rotate-45">
                <div className="w-6 h-6 border-2 border-white rounded transform -rotate-45"></div>
              </div>
            </div>

            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Contact
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleSignIn}
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium rounded-full hover:from-purple-700 hover:to-purple-900 transition-all duration-200 text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-12">
              <Rocket className="h-4 w-4" />
              <span>Start Your Free 14-Day Trial</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-7xl md:text-8xl lg:text-9xl font-bold mb-8 leading-none"
          >
            <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
              Homehandshake
            </span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 text-gray-200"
          >
            The Creator's AI Control Center
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl md:text-2xl font-medium mb-8 text-gray-300"
          >
            Clip. Create. Share. Everywhere.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Transform your content workflow into a money-making machine. Extract your best moments, turn them into viral clips, and blast them across every platform — automatically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col items-center"
          >
            <button
              onClick={handleGetStarted}
              className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-full hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 text-lg mb-4"
            >
              Start Your Free 14-Day Trial
            </button>
            <p className="text-gray-500 text-sm">
              No credit card. Cancel anytime.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" style={{ zIndex: 5 }}></div>
    </section>
  );
};

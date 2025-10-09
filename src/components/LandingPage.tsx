import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { HeroSection } from './ui/hero-odyssey';
import { motion } from 'framer-motion';
import { TestimonialsColumn } from './ui/testimonials-columns';
import { PricingWithChart } from './ui/pricing-with-chart';
import {
  Scissors,
  Share2,
  Zap,
  Target,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Layers,
  Globe
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const testimonials = [
    {
      text: "Homehandshake completely transformed how I manage content. What used to take hours now takes minutes!",
      image: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100",
      name: "Sarah Chen",
      role: "Content Creator"
    },
    {
      text: "The AI clipping feature is incredible. It finds the perfect moments in my videos every time.",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100",
      name: "Marcus Johnson",
      role: "YouTuber"
    },
    {
      text: "Multi-platform posting made easy. I reach 10x more people with half the effort.",
      image: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=100",
      name: "Emily Rodriguez",
      role: "Digital Marketer"
    }
  ];

  const testimonials2 = [
    {
      text: "The analytics dashboard gives me insights I never had before. Game changer for my content strategy.",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100",
      name: "David Kim",
      role: "Social Media Manager"
    },
    {
      text: "Best investment for my agency. My team collaborates seamlessly now.",
      image: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100",
      name: "Jessica Williams",
      role: "Agency Owner"
    },
    {
      text: "From podcast to viral clips in seconds. This platform is pure magic.",
      image: "https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=100",
      name: "Alex Turner",
      role: "Podcast Host"
    }
  ];

  const testimonials3 = [
    {
      text: "The ROI is insane. More engagement, more clients, and way less stress.",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100",
      name: "Olivia Martinez",
      role: "Influencer"
    },
    {
      text: "I can finally focus on creating content instead of editing and posting. Worth every penny!",
      image: "https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=100",
      name: "Ryan Cooper",
      role: "Video Producer"
    },
    {
      text: "Scheduling posts across platforms has never been easier. My reach doubled in just 2 months.",
      image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100",
      name: "Sophia Lee",
      role: "Brand Strategist"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <HeroSection />

      <main className="relative z-10">
        <section className="px-6 py-20 bg-gradient-to-b from-black via-purple-950/20 to-black">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                💡 The Problem
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                You pour hours into content… editing, clipping, resizing, re-uploading — one platform at a time.
              </p>
              <p className="text-xl text-gray-400 mt-4 max-w-3xl mx-auto">
                By the time you're done, the algorithm's already moved on. Your content's dead before it's even posted.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 bg-clip-text text-transparent">
                🚀 The Solution
              </h2>
              <p className="text-2xl text-purple-200 mb-4">
                Meet Homehandshake — your AI-powered content ops partner.
              </p>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                Built for creators, editors, and media teams who want to dominate the feed without losing their minds (or weekends).
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
            >
              <motion.div variants={itemVariants} className="group relative bg-gradient-to-br from-purple-900/20 to-black p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Scissors className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-purple-200">🧠 Smart Content Clipping</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    AI scans your videos, finds the "stop scroll" moments, and turns them into platform-perfect clips.
                  </p>
                  <ul className="space-y-2 text-sm text-purple-300">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> Auto captions</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> Auto resizing</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> Emotion-based hook detection</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> Batch export for 30+ clips in seconds</li>
                  </ul>
                  <p className="text-purple-400 mt-4 font-medium">You talk. We find the gold.</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="group relative bg-gradient-to-br from-purple-900/20 to-black p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-purple-200">🌍 Multi-Platform Sharing</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Post once. Appear everywhere. Homehandshake auto-optimizes your clips for:
                  </p>
                  <ul className="space-y-2 text-sm text-purple-300">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> TikTok</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> Instagram</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> YouTube Shorts</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> Facebook Reels</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> LinkedIn</li>
                  </ul>
                  <p className="text-purple-400 mt-4 font-medium">One upload → 15+ optimized posts → Zero extra work.</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="group relative bg-gradient-to-br from-purple-900/20 to-black p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-purple-200">⚡ Lightning-Fast Processing</h3>
                  <p className="text-gray-400 leading-relaxed">
                    From long-form to viral short in seconds. No exporting. No waiting. No editors ghosting you.
                    AI handles clipping, formatting, and scheduling — while you focus on creating.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="group relative bg-gradient-to-br from-purple-900/20 to-black p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-purple-200">🎯 Targeted Distribution</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Your content doesn't just go everywhere — it goes where it matters.
                    Homehandshake personalizes delivery per platform, audience, and engagement type.
                  </p>
                  <p className="text-purple-400 mt-4 font-medium">Smarter targeting. More reach. Higher ROI.</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="group relative bg-gradient-to-br from-purple-900/20 to-black p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-purple-200">🤝 Team Collaboration Made Easy</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Bring your team into the loop. Plan, review, approve, and schedule — all in one sleek dashboard.
                    Built for solo creators, agencies, and production studios who run on efficiency.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="group relative bg-gradient-to-br from-purple-900/20 to-black p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-purple-200">📊 Analytics & Insights</h3>
                  <p className="text-gray-400 leading-relaxed">
                    See what hits and what flops — instantly. Track views, engagement rates, and conversion metrics across all platforms in one unified dashboard.
                  </p>
                  <p className="text-purple-400 mt-4 font-medium">No more guessing. Just data-driven growth.</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="px-6 py-20 bg-gradient-to-b from-black via-purple-950/10 to-black overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 bg-clip-text text-transparent">
                💬 What Creators Are Saying
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Join thousands of creators who've transformed their content workflow
              </p>
            </motion.div>

            <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[700px] overflow-hidden">
              <TestimonialsColumn testimonials={testimonials} duration={15} />
              <TestimonialsColumn testimonials={testimonials2} className="hidden md:block" duration={19} />
              <TestimonialsColumn testimonials={testimonials3} className="hidden lg:block" duration={17} />
            </div>
          </div>
        </section>

        <section className="px-6 py-20 bg-gradient-to-b from-black via-purple-950/10 to-black">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 bg-clip-text text-transparent">
                🌈 Built by AI. Powered by You.
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-left mb-12">
                <div className="bg-gradient-to-br from-purple-900/20 to-black p-6 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 mb-2">💬 GPT-4.1 for smart content writing</p>
                </div>
                <div className="bg-gradient-to-br from-purple-900/20 to-black p-6 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 mb-2">🎥 DALL·E & Veo for visuals & videos</p>
                </div>
                <div className="bg-gradient-to-br from-purple-900/20 to-black p-6 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 mb-2">📅 Cross-platform posting</p>
                </div>
                <div className="bg-gradient-to-br from-purple-900/20 to-black p-6 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 mb-2">📈 Real-time analytics</p>
                </div>
              </div>
              <p className="text-xl text-gray-300 mb-8">
                Everything automated. Everything customizable. Your brand, your content — amplified by AI.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="px-6 py-20 bg-gradient-to-b from-black via-purple-950/10 to-black">
          <PricingWithChart />
        </section>

        <section className="px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 rounded-3xl p-12 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(168,85,247,0.3)_0%,_transparent_50%)]"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  🏁 Ready to Transform Your Workflow?
                </h2>
                <p className="text-xl mb-8 text-purple-100">
                  Join 50,000+ creators who clip smarter, create faster, and grow bigger.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-purple-100">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Free 14-day trial
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    No credit card required
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Cancel anytime
                  </div>
                </div>

                <SignUpButton mode="modal">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-8 py-4 bg-white text-purple-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl inline-flex items-center"
                  >
                    🔥 Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </motion.button>
                </SignUpButton>
              </div>
            </div>
          </div>
        </section>

        <footer className="px-6 py-12 border-t border-purple-900/20">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-200 to-purple-400 bg-clip-text text-transparent">
              🖤 Built for Creators. Powered by AI.
            </p>
            <p className="text-gray-400">
              Homehandshake — because great content deserves to go everywhere.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;

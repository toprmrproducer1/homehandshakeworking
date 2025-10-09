import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Scissors,
  Image as ImageIcon,
  Send,
  History,
  Users,
  BarChart3,
  Settings,
  X,
  Sparkles,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ activeTab, onTabChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mouseX, setMouseX] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      if (e.clientX < 50) {
        setIsOpen(true);
      } else if (e.clientX > 300) {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'clip', label: 'Clip Content', icon: Scissors },
    { id: 'generate', label: 'Generate Images', icon: ImageIcon },
    { id: 'post', label: 'Create Post', icon: Send },
    { id: 'history', label: 'Post History', icon: History },
    { id: 'library', label: 'Library', icon: FolderOpen },
    { id: 'social', label: 'Social Accounts', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <div
        className="fixed left-0 top-0 bottom-0 w-12 z-40 pointer-events-none"
        style={{
          background: isOpen ? 'transparent' : 'linear-gradient(to right, rgba(168,85,247,0.1), transparent)'
        }}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-black via-purple-950/20 to-black border-r border-purple-500/20 backdrop-blur-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                        Homehandshake
                      </h2>
                      <p className="text-xs text-gray-400">Content Platform</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-purple-500/10'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-8 p-4 rounded-lg bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm mb-1">Upgrade to Pro</h3>
                      <p className="text-xs text-gray-400 mb-3">
                        Unlock unlimited features and advanced analytics
                      </p>
                      <button className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium text-white transition-colors">
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SidebarMenu;

// Navbar.tsx

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import AuthModal from './ui/AuthModal';

const navItems = [
  { name: 'Home', href: 'https://chayceurban.com' },
  { name: 'Economy', href: '/economy', isInternal: true },
  { name: 'About', href: '#about' },
  { name: 'Notable Moments', href: '#projects' },
  { name: 'Skills', href: '#skills' },
  { name: 'Contact', href: '#contact' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowProfileDropdown(false);
  };

  return (
    <>
      <header
        className={`fixed w-full z-50 transition-all duration-300 shadow-md 
          ${scrolled ? 'py-2' : 'py-4'} 
          bg-gradient-to-r from-gray-800 via-gray-900 to-black 
          text-gray-100
        `}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <a href="#" className="text-2xl font-bold">
              CHAYCE
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="hover:text-gray-300 font-medium transition-colors"
              >
                {item.name}
              </motion.a>
            ))}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
                >
                  My Profile
                </button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-2 z-20">
                    <a
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-700 transition"
                    >
                      My Profile
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setShowAuthModal(true)}>
                <UserCircleIcon className="h-8 w-8 hover:text-gray-300 transition" />
                <span className="text-sm font-medium hover:text-gray-300 transition">Login/Sign Up</span>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md focus:outline-none hover:text-gray-300 transition"
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="md:hidden py-4 absolute w-full bg-gradient-to-r from-gray-800 via-gray-900 to-black shadow-lg"
          >
            <div className="space-y-2 px-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-2 hover:text-gray-300 transition"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              {user ? (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition w-full"
                  >
                    My Profile
                  </button>
                  {showProfileDropdown && (
                    <div className="bg-gray-800 rounded-md shadow-lg py-2 mt-2">
                      <a
                        href="/profile"
                        className="block px-4 py-2 hover:bg-gray-700 transition"
                      >
                        My Profile
                      </a>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setShowAuthModal(true)}>
                  <UserCircleIcon className="h-8 w-8 hover:text-gray-300 transition" />
                  <span className="text-sm font-medium hover:text-gray-300 transition">Login/Sign Up</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};

export default Navbar;

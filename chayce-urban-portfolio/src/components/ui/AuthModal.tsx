// components/ui/AuthModal.tsx

"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = async () => {
    setError(null);
    setSuccessMessage(null);

    if (isSignUp) {
      if (!name.trim()) {
        setError("Name is required for signing up.");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) setError(error.message);
      else {
        setSuccessMessage(
          "Confirmation email sent! Please check your inbox to verify your account."
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) setError(error.message);
      else onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl w-96 relative"
      >
        <h2 className="text-2xl mb-4 text-center text-gray-800 dark:text-white">
          {isSignUp ? 'Create an Account' : 'Sign In'}
        </h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4 text-center">{successMessage}</p>}

        {isSignUp && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full p-3 mb-4 border rounded-lg outline-none text-gray-800 dark:text-white dark:bg-gray-800"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full p-3 mb-4 border rounded-lg outline-none text-gray-800 dark:text-white dark:bg-gray-800"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full p-3 mb-4 border rounded-lg outline-none text-gray-800 dark:text-white dark:bg-gray-800"
        />

        <div className="flex justify-between mb-4">
          <button 
            onClick={handleAuth}
            className="bg-black hover:bg-gray-500 text-white py-2 px-4 rounded-lg w-full"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <div className="text-center text-gray-600 dark:text-gray-400 mt-4">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <span 
                onClick={() => { setIsSignUp(false); setError(null); setSuccessMessage(null); }}
                className="text-black hover:underline cursor-pointer"
              >
                Sign In
              </span>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <span 
                onClick={() => { setIsSignUp(true); setError(null); setSuccessMessage(null); }}
                className="text-black hover:underline cursor-pointer"
              >
                Sign Up
              </span>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
        >
          ✕
        </button>
      </motion.div>
    </div>
  );
};

export default AuthModal;

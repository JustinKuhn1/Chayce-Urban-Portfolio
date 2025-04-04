// src/app/components/sections/PasswordProtection.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PasswordProtectionProps {
  redirectPath: string;
}

export default function PasswordProtection({ redirectPath }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store the auth token and expiry in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('tokenExpiry', data.expires.toString());
        
        // Redirect to the protected page
        router.push(redirectPath);
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
          403 Forbidden
          </h2>
          <p className="mt-2 text-center text-gray-600">
          You do not have permission to access chayceurban.com.
          </p>
          
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Wallet, PieChart, TrendingUp, Clock, DollarSign, Briefcase } from 'lucide-react';
import Navbar from "@/components/Navbar";
import Footer from '@/components/Footer';
import AuthModal from '@/components/ui/AuthModal'; // Import the AuthModal component
import Leaderboard from '@/components/sections/Leaderboard'; // Import the new Leaderboard component

interface Economy {
  id: string;
  user_id: string;
  balance: number;
  assets: number;
  liabilities: number;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
}

interface RealtimePayload {
  new: Economy;
}

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [economy, setEconomy] = useState<Economy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  // Fetch user and their economy data
  useEffect(() => {
    const fetchUserAndEconomy = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setShowAuthModal(true);
          setLoading(false);
          return;
        }
        
        // Get the user's economy data including verification status
        const { data: economyData, error: economyError } = await supabase
          .from('economy')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (economyError && economyError.code !== 'PGRST116') {
          console.error('Error fetching economy data:', economyError);
          setError('Failed to fetch economy data.');
        } else if (economyData) {
          setEconomy(economyData);
          setUser({
            ...user,
            is_verified: economyData.is_verified,
          });
        } else {
          console.log('Economy data not found for user');
          setUser(user);
        }
      } catch (error) {
        console.error('Error fetching user and economy:', error);
        setError('Failed to fetch user and economy data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndEconomy();
  }, [router]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setShowAuthModal(true);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex justify-center items-center mt-20 mb-8">
          <div className="text-xl">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Show AuthModal if user is not logged in */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {/* Main content with proper spacing for fixed navbar */}
      <main className="flex-grow pt-24 pb-12">
        {/* Leaderboard Section */}
        <div className="mb-8">
          <Leaderboard />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
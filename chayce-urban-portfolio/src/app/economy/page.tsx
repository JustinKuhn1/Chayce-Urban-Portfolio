"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { RealtimeChannel } from '@supabase/supabase-js';
import Navbar from "@/components/Navbar";
import Footer from '@/components/Footer';
import StockComponent from '@/components/sections/StockComponent';
import AuthModal from '@/components/ui/AuthModal';

interface Economy {
  id: string;
  user_id: string;
  balance: number;
  assets: number;
  liabilities: number;
  created_at: string;
  updated_at: string;
}

interface RealtimePayload {
  new: Economy;
}

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [economy, setEconomy] = useState<Economy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false); // State for showing the AuthModal
  const router = useRouter();

  // Fetch user and their economy data (or create one if it doesn't exist)
  useEffect(() => {
    const fetchUserAndEconomy = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setShowAuthModal(true); // Show the AuthModal instead of redirecting
          setLoading(false);
          return;
        }
        
        setUser(user);
        
        // Fetch the economy record for the current user
        let { data, error } = await supabase
          .from('economy')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          // If no record exists, create one with default values
          const { data: newData, error: insertError } = await supabase
            .from('economy')
            .insert({
              user_id: user.id,
              balance: 0,
              assets: 0,
              liabilities: 0,
            })
            .select()
            .single();

          if (insertError) {
            setError(`Error creating economy record: ${insertError.message}`);
            console.error("Error creating economy record:", insertError.message);
          } else {
            data = newData;
          }
        }
        
        if (data) {
          setEconomy(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndEconomy();
  }, [router]);

  // Listen for auth state changes (sign out events)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setEconomy(null);
        setShowAuthModal(true); // Show the AuthModal on sign out
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  // Set up real-time subscription to the economy table
  useEffect(() => {
    if (!user) return;

    const channel: RealtimeChannel = supabase
      .channel('economy_changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'economy', filter: `user_id=eq.${user.id}` }, 
        (payload: any) => {
          console.log('Real-time update received:', payload);
          if (payload.new && payload.new.user_id === user.id) {
            setEconomy(payload.new as Economy);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
        <StockComponent />
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
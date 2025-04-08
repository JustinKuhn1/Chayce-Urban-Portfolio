"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Wallet, PieChart, TrendingUp, Clock, DollarSign, Briefcase } from 'lucide-react';
import Navbar from "@/components/Navbar";
import Footer from '@/components/Footer';
import StockComponent from '@/components/sections/StockComponent';
import styles from '@/styles/StockComponent.module.css';

interface Economy {
  id: string;
  user_id: string;
  balance: number;
  assets: number;
  liabilities: number;
  created_at: string;
  updated_at: string;
}

interface Investment {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  return_rate: number;
  type: string;
  purchase_date: string;
}

interface RealtimePayload {
  new: Economy;
}

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [economy, setEconomy] = useState<Economy | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  // Fetch user and their economy data (or create one if it doesn't exist)
  useEffect(() => {
    const fetchUserAndEconomy = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push('/auth');
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

        // Fetch investments from database
        const { data: investmentsData, error: investmentsError } = await supabase
          .from('investments')
          .select('*')
          .eq('user_id', user.id);

        if (investmentsError) {
          console.error("Error fetching investments:", investmentsError.message);
        } else if (investmentsData) {
          setInvestments(investmentsData);
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
        router.push('/auth');
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

  // Function to calculate total investments value
  const calculateTotalInvestments = () => {
    return investments.reduce((total, inv) => total + inv.amount, 0);
  };

  // Function to calculate average return rate
  const calculateAverageReturn = () => {
    if (investments.length === 0) return 0;
    const totalReturn = investments.reduce((sum, inv) => sum + inv.return_rate, 0);
    return (totalReturn / investments.length).toFixed(2);
  };

  // Function to calculate allocation percentages
  const calculateAllocationPercentages = () => {
    const totalInvestments = calculateTotalInvestments();
    if (totalInvestments === 0) return {};
    
    const allocationByType = investments.reduce((acc, inv) => {
      acc[inv.type] = (acc[inv.type] || 0) + inv.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const percentageByType: Record<string, number> = {};
    for (const [type, amount] of Object.entries(allocationByType)) {
      percentageByType[type] = Math.round((amount / totalInvestments) * 100);
    }
    
    return percentageByType;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex-grow flex justify-center items-center mt-20 mb-8">
          <div className="text-xl flex items-center gap-2">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Loading your financial dashboard...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      {/* Main content with proper spacing for fixed navbar */}
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Dashboard Header */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
                {user && (
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Welcome back, <span className="font-semibold">{user.user_metadata?.name || user.email || 'User'}</span>
                  </p>
                )}
              </div>
              <div className="mt-4 md:mt-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <ul className="flex flex-wrap -mb-px">
                <li className="mr-2">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
                      activeTab === 'overview' 
                        ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-500 dark:border-blue-500' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Overview
                  </button>
                </li>
                <li className="mr-2">
                  <button 
                    onClick={() => setActiveTab('investments')}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
                      activeTab === 'investments' 
                        ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-500 dark:border-blue-500' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Investments
                  </button>
                </li>
                <li className="mr-2">
                  <button 
                    onClick={() => setActiveTab('stocks')}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
                      activeTab === 'stocks' 
                        ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-500 dark:border-blue-500' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <PieChart className="w-4 h-4 mr-2" />
                    Stocks
                  </button>
                </li>
              </ul>
            </div>

            {/* Overview Tab Content */}
            {activeTab === 'overview' && economy && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium">Net Worth</h2>
                      <DollarSign className="w-6 h-6 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">${economy.balance.toLocaleString()}</p>
                    <p className="text-blue-100 text-sm mt-2">
                      {economy.updated_at && `Updated: ${new Date(economy.updated_at).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-800 dark:text-white">Assets</h2>
                      <Briefcase className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">${economy.assets.toLocaleString()}</p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-800 dark:text-white">Liabilities</h2>
                      <Clock className="w-6 h-6 text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">${economy.liabilities.toLocaleString()}</p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-800 dark:text-white">Investments</h2>
                      <PieChart className="w-6 h-6 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">${calculateTotalInvestments().toLocaleString()}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{investments.length} active investments</p>
                  </div>
                </div>
              </div>
            )}

            {/* Investments Tab Content */}
            {activeTab === 'investments' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Total Value</h3>
                      <Briefcase className="w-6 h-6 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">${calculateTotalInvestments().toLocaleString()}</p>
                    <p className="text-purple-100 text-sm mt-2">{investments.length} active investments</p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">Avg. Return</h3>
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{calculateAverageReturn()}%</p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">Allocation</h3>
                      <PieChart className="w-6 h-6 text-blue-500" />
                    </div>
                    {Object.entries(calculateAllocationPercentages()).map(([type, percentage], index) => (
                      <div key={type} className="flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${
                          index % 3 === 0 ? 'bg-green-500' : 
                          index % 3 === 1 ? 'bg-blue-500' : 'bg-purple-500'
                        }`}></span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{type}: {percentage}%</span>
                      </div>
                    ))}
                    {investments.length === 0 && (
                      <span className="text-sm text-gray-600 dark:text-gray-300">No investments yet</span>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-600">
                  <div className="sm:flex sm:items-center p-6 bg-gray-50 dark:bg-gray-800">
                    <div className="sm:flex-auto">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Investment Portfolio</h3>
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Detailed breakdown of your investment holdings and performance.
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                      <button
                        type="button"
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Add Investment
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Return Rate</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Purchase Date</th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-700">
                        {investments.length > 0 ? (
                          investments.map((investment) => (
                            <tr key={investment.id}>
                              <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900 dark:text-white">{investment.name}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{investment.type}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">${investment.amount.toLocaleString()}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600 dark:text-green-400">{investment.return_rate}%</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{new Date(investment.purchase_date).toLocaleDateString()}</td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">Edit</button>
                                <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-4 px-6 text-center text-gray-500 dark:text-gray-300">
                              No investments found. Add your first investment to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Stocks Tab Content */}
            {activeTab === 'stocks' && (
                <StockComponent />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
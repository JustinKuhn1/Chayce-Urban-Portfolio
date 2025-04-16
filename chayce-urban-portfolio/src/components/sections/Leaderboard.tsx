"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Wallet, Shield, CheckCircle } from 'lucide-react';

interface UserEconomy {
  user_id: string;
  display_name: string;
  balance: number;
  assets: number;
  liabilities: number;
  is_verified: boolean;
  netWorth: number;
  rank: number;
}

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<UserEconomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting current user:', userError);
          setError('Failed to retrieve current user.');
          return;
        }
        
        if (user) {
          setCurrentUserId(user.id);
        }

        const { data: economyData, error: economyError } = await supabase
          .from('economy')
          .select('*');

        if (economyError) {
          console.error('Error fetching economy data:', economyError);
          setError('Failed to fetch economy data.');
          return;
        }

        if (economyData && economyData.length > 0) {
          const processedData = economyData.map((item: any) => {
            const netWorth = (item.balance || 0) + (item.assets || 0) - (item.liabilities || 0);
            
            // Try to get display name from multiple sources with fallbacks
            let displayName = String(item.display_name || '').trim();
            
            // If no display name found, create a readable user ID snippet
            if (!displayName || displayName.trim() === '') {
              displayName = `User ${item.user_id.slice(0, 5)}...`;
            }
              
            return {
              user_id: item.user_id,
              display_name: displayName,
              balance: item.balance || 0,
              assets: item.assets || 0,
              liabilities: item.liabilities || 0,
              is_verified: item.is_verified || false,
              netWorth: netWorth,
              rank: 0
            };
          });

          const sortedData = processedData.sort((a, b) => b.netWorth - a.netWorth);
          
          sortedData.forEach((user, index) => {
            user.rank = index + 1;
          });

          setLeaderboardData(sortedData);
        } else {
          console.log('No economy data found');
        }
      } catch (fetchError) {
        console.error('Unexpected error in leaderboard fetch:', fetchError);
        setError('An unexpected error occurred while fetching leaderboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading leaderboard data...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>Error: {error}</p>
        <p className="mt-2 text-sm">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Wallet className="mr-2" />
          Leaderboard - Top 100
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">User</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Net Worth</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4 text-right">Assets</th>
                <th className="py-3 px-4 text-right">Liabilities</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.length > 0 ? (
                leaderboardData.map((user) => (
                  <tr 
                    key={user.user_id}
                    className={`
                      border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600
                      ${currentUserId === user.user_id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                    `}
                  >
                    <td className="py-4 px-4">
                      {user.rank === 1 && <span className="text-yellow-500">🥇</span>}
                      {user.rank === 2 && <span className="text-gray-400">🥈</span>}
                      {user.rank === 3 && <span className="text-amber-700">🥉</span>}
                      {user.rank > 3 && <span>{user.rank}</span>}
                    </td>
                    <td className="py-4 px-4 font-medium">
  {user.display_name} 
  {currentUserId === user.user_id && <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 py-1 px-2 rounded-full">You</span>}
</td>
                    <td className="py-4 px-4">
                      {user.is_verified ? 
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span>Verified</span>
                        </div> :
                        <div className="flex items-center text-gray-400">
                          <Shield className="w-4 h-4 mr-1" />
                          <span>Unverified</span>
                        </div>
                      }
                    </td>
                    <td className="py-4 px-4 text-right font-bold">
                      {formatCurrency(user.netWorth)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {formatCurrency(user.balance)}
                    </td>
                    <td className="py-4 px-4 text-right text-green-600 dark:text-green-400">
                      {formatCurrency(user.assets)}
                    </td>
                    <td className="py-4 px-4 text-right text-red-600 dark:text-red-400">
                      {formatCurrency(user.liabilities)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500">
                    No leaderboard data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
// StockComponent.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  TrendingUp,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  BarChart2,
  X,
  Check,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { 
  updateStockPrice, 
  simulateMarketMovements, 
  resetDailyValues,
  fetchStockHistory,
  formatDate,
  Stock as StockType
} from '@/lib/marketSimulation';

interface UserStock {
  id: string;
  user_id: string;
  stock_id: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  stock: StockType;
}

interface StockHistoryData {
  date: string;
  price: number;
  volume: number;
}

const StockComponent = () => {
  const [stocks, setStocks] = useState<StockType[]>([]);
  const [userStocks, setUserStocks] = useState<UserStock[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [purchaseAmount, setPurchaseAmount] = useState<{ [key: string]: number }>({});
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Chart-related states
  const [showChart, setShowChart] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<StockType | null>(null);
  const [stockHistory, setStockHistory] = useState<StockHistoryData[]>([]);
  const [loadingChart, setLoadingChart] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<string>('1D'); // Options: 1D, 1W, 1M, 3M, 1Y, 5Y
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [compareStocks, setCompareStocks] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  // -----------------------------
  // Data Fetching and Subscriptions
  // -----------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: economyData } = await supabase
          .from('economy')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (economyData) setUserBalance(economyData.balance);

        const { data: stocksData } = await supabase
          .from('stocks')
          .select('*')
          .order('company_name');
        if (stocksData) setStocks(stocksData);

        const { data: portfolioData } = await supabase
          .from('user_stocks')
          .select(`*, stock:stocks(*)`)
          .eq('user_id', user.id);
        if (portfolioData) setUserStocks(portfolioData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up regular market movements
    const marketInterval = setInterval(() => {
      simulateMarketMovements();
    }, 30000); // Simulate market movements every 30 seconds

    // Set up daily reset if needed (at market open)
    const checkForMarketOpen = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      // Reset at 9:30 AM
      if (hours === 9 && minutes === 30) {
        resetDailyValues();
      }
    };
    const dailyCheckInterval = setInterval(checkForMarketOpen, 60000); // Check every minute

    // Real-time subscription for stock updates
    const stocksSubscription = supabase
      .channel('stocks_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stocks' },
        (payload) => {
          setStocks(currentStocks =>
            currentStocks.map(stock =>
              stock.id === payload.new.id ? { ...stock, ...payload.new } : stock
            )
          );
        }
      )
      .subscribe();

    return () => {
      clearInterval(marketInterval);
      clearInterval(dailyCheckInterval);
      supabase.removeChannel(stocksSubscription);
    };
  }, []);

  // -----------------------------
  // Chart Data Generation
  // -----------------------------
  useEffect(() => {
    if (!selectedStock) return;
    const loadHistoricalData = async () => {
      setLoadingChart(true);
      try {
        const historyData = await fetchStockHistory(selectedStock.id, timeframe);
        setStockHistory(historyData || []);
      } catch (error) {
        console.error('Error loading stock history:', error);
      } finally {
        setLoadingChart(false);
      }
    };
    loadHistoricalData();
  }, [selectedStock, timeframe]);

  useEffect(() => {
    if (!comparisonMode || compareStocks.length === 0) return;
    
    const fetchComparisonData = async () => {
      setLoadingChart(true);
      try {
        // Get list of stock IDs for the selected symbols
        const stockIds = stocks
          .filter(stock => compareStocks.includes(stock.symbol))
          .map(stock => stock.id);
        
        // Fetch history for each stock ID
        const historicalDataPromises = stockIds.map(id => 
          fetchStockHistory(id, timeframe)
        );
        
        const historicalDataSets = await Promise.all(historicalDataPromises);
        
        // Convert multiple datasets into a single comparison dataset
        const mergedData: any[] = [];
        const datepointsMap = new Map();
        
        // First, gather all unique dates
        historicalDataSets.forEach((dataset, index) => {
          const stockSymbol = compareStocks[index];
          dataset?.forEach(point => {
            if (!datepointsMap.has(point.date)) {
              datepointsMap.set(point.date, { date: point.date });
            }
            datepointsMap.get(point.date)[stockSymbol] = point.price;
          });
        });
        
        // Convert map to array
        datepointsMap.forEach(datapoint => {
          mergedData.push(datapoint);
        });
        
        // Sort by date
        mergedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setComparisonData(mergedData);
      } catch (error) {
        console.error('Error fetching comparison data:', error);
      } finally {
        setLoadingChart(false);
      }
    };
    
    fetchComparisonData();
  }, [comparisonMode, compareStocks, timeframe, stocks]);

  // -----------------------------
  // UI Handlers
  // -----------------------------
  const handleViewChart = async (stock: StockType) => {
    // Get the most up-to-date stock data first
    const { data: freshStock } = await supabase
      .from('stocks')
      .select('*')
      .eq('id', stock.id)
      .single();
      
    setSelectedStock(freshStock || stock);
    setShowChart(true);
    setComparisonMode(false);
    setCompareStocks([]);
  };

  const handleOpenComparisonChart = () => {
    // Only open if there is at least one selected stock
    if (compareStocks.length > 0) {
      setComparisonMode(true);
      setSelectedStock(null);
      setShowChart(true);
    }
  };

  const handleCloseChart = () => {
    setShowChart(false);
    setSelectedStock(null);
    setComparisonMode(false);
  };

  const handleToggleCompareStock = (symbol: string) => {
    if (compareStocks.includes(symbol)) {
      setCompareStocks(compareStocks.filter(s => s !== symbol));
    } else if (compareStocks.length < 3) {
      setCompareStocks([...compareStocks, symbol]);
    }
  };

  const handlePurchase = async (stock: StockType) => {
    try {
      const quantity = purchaseAmount[stock.id] || 0;
      if (quantity <= 0) return;
      const totalCost = stock.current_price * quantity;
      
      // Check if there are enough available shares
      if (stock.available_shares && quantity > stock.available_shares) {
        alert(`Only ${stock.available_shares} shares available for ${stock.symbol}`);
        return;
      }
      
      if (totalCost > userBalance) {
        alert('Insufficient funds for this purchase');
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Update user balance
      const { error: balanceError } = await supabase
        .from('economy')
        .update({ balance: userBalance - totalCost })
        .eq('user_id', user.id);
      
      if (balanceError) throw balanceError;
      
      // Check if user already owns this stock
      const { data: existingStock } = await supabase
        .from('user_stocks')
        .select('*')
        .eq('user_id', user.id)
        .eq('stock_id', stock.id)
        .single();
      
      if (existingStock) {
        const newQuantity = existingStock.quantity + quantity;
        const newAvgPrice =
          ((existingStock.purchase_price * existingStock.quantity) +
            (stock.current_price * quantity)) /
          newQuantity;
        
        const { error: updateError } = await supabase
          .from('user_stocks')
          .update({ 
            quantity: newQuantity, 
            purchase_price: newAvgPrice,
            purchase_date: new Date().toISOString()
          })
          .eq('id', existingStock.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_stocks')
          .insert({
            user_id: user.id,
            stock_id: stock.id,
            quantity: quantity,
            purchase_price: stock.current_price,
            purchase_date: new Date().toISOString(),
          });
        
        if (insertError) throw insertError;
      }
      
      // Update the stock price based on this transaction
      const updatedStock = await updateStockPrice(stock.id, quantity, true);
      
      // If we're currently viewing a chart of this stock, update it
if (updatedStock && selectedStock?.id === stock.id) {
  setSelectedStock(updatedStock);
  // Force chart data refresh
  setTimeframe(timeframe);  
}
      
      setUserBalance(prev => prev - totalCost);
      setPurchaseAmount(prev => ({ ...prev, [stock.id]: 0 }));
      refreshPortfolio(user.id);
      alert(`Successfully purchased ${quantity} shares of ${stock.company_name}`);
    } catch (error) {
      console.error('Error purchasing stock:', error);
      alert('Failed to complete the purchase. Please try again.');
    }
  };

  const handleSell = async (userStock: UserStock) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const currentPrice = userStock.stock.current_price;
      const saleProceeds = currentPrice * userStock.quantity;
      
      const { error: balanceError } = await supabase
        .from('economy')
        .update({ balance: userBalance + saleProceeds })
        .eq('user_id', user.id);
      
      if (balanceError) throw balanceError;
      
      const { error: deleteError } = await supabase
        .from('user_stocks')
        .delete()
        .eq('id', userStock.id);
      
      if (deleteError) throw deleteError;
      
      // Update the stock price based on this sale transaction
      const updatedStock = await updateStockPrice(userStock.stock.id, userStock.quantity, false);
      
      // If we're currently viewing a chart of this stock, update it
if (updatedStock && selectedStock?.id === userStock.stock.id) {
  setSelectedStock(updatedStock);
  // Force chart data refresh
  setTimeframe(timeframe);
}
      
      setUserBalance(prev => prev + saleProceeds);
      setUserStocks(prev => prev.filter(stock => stock.id !== userStock.id));
      
      const profitLoss = (currentPrice - userStock.purchase_price) * userStock.quantity;
      const profitLossText =
        profitLoss >= 0
          ? `profit of $${profitLoss.toFixed(2)}`
          : `loss of $${Math.abs(profitLoss).toFixed(2)}`;
      
      alert(`Successfully sold ${userStock.quantity} shares of ${userStock.stock.company_name} for $${saleProceeds.toFixed(2)} with a ${profitLossText}`);
    } catch (error) {
      console.error('Error selling stock:', error);
      alert('Failed to complete the sale. Please try again.');
    }
  };

  const refreshPortfolio = async (userId: string) => {
    setRefreshing(true);
    try {
      const { data } = await supabase
        .from('user_stocks')
        .select(`*, stock:stocks(*)`)
        .eq('user_id', userId);
      if (data) setUserStocks(data);
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // -----------------------------
  // Derived Data and Filters
  // -----------------------------
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === 'gainers') return matchesSearch && stock.price_change > 0;
    if (filterType === 'losers') return matchesSearch && stock.price_change < 0;
    return matchesSearch;
  });

  const calculatePortfolioValue = () => {
    return userStocks.reduce((total, stock) => total + (stock.quantity * stock.stock.current_price), 0);
  };

  const calculateProfitLoss = () => {
    return userStocks.reduce((total, stock) => {
      const currentValue = stock.quantity * stock.stock.current_price;
      const costBasis = stock.quantity * stock.purchase_price;
      return total + (currentValue - costBasis);
    }, 0);
  };

  const getLineColor = (index: number) => {
    const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];
    return colors[index % colors.length];
  };

  // -----------------------------
  // Rendering
  // -----------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        <p>Loading stock data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="stock-container bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-blue-600" />
          Stock Market
        </h2>

        {/* Portfolio Summary */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Portfolio</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Available Cash</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Portfolio Value</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${calculatePortfolioValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Holdings</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{userStocks.length}</p>
            </div>
            <div className={`${calculateProfitLoss() >= 0 ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'} p-4 rounded-lg`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Profit/Loss</p>
              <p className={`text-xl font-bold ${calculateProfitLoss() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {calculateProfitLoss() >= 0 ? '+' : '-'}${Math.abs(calculateProfitLoss()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {userStocks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="stock-table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shares</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">P/L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-800">
                  {userStocks.map((userStock) => {
                    const stock = userStock.stock;
                    const currentValue = userStock.quantity * stock.current_price;
                    const costBasis = userStock.quantity * userStock.purchase_price;
                    const profitLoss = currentValue - costBasis;
                    const profitLossPercentage = (profitLoss / costBasis) * 100;
                    return (
                      <tr key={userStock.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{stock.symbol}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{stock.company_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{userStock.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${userStock.purchase_price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${stock.current_price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${currentValue.toFixed(2)}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${profitLoss >= 0 ? 'positive' : 'negative'}`}>
                          <div className="flex items-center">
                            {profitLoss >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                            ${Math.abs(profitLoss).toFixed(2)} ({profitLossPercentage.toFixed(2)}%)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button onClick={() => handleViewChart(stock)} className="view-btn">
                              <BarChart2 className="w-4 h-4 mr-1" />
                              Chart
                            </button>
                            <button onClick={() => handleSell(userStock)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                              Sell All
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-600 dark:text-gray-300">You don't have any stocks in your portfolio yet.</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Start investing by purchasing stocks below!</p>
            </div>
          )}
          
          {userStocks.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => refreshPortfolio(userStocks[0].user_id)}
                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Portfolio'}
              </button>
            </div>
          )}
        </div>

        {/* Available Stocks */}
        <div className="stock-container bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Available Stocks</h3>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search stocks..."
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Filter className="text-gray-500 dark:text-gray-400 h-5 w-5" />
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Stocks</option>
                <option value="gainers">Gainers</option>
                <option value="losers">Losers</option>
              </select>
            </div>
            {/* If any stocks are selected for comparison, show a button to open the comparison modal */}
            {compareStocks.length > 0 && (
              <button onClick={handleOpenComparisonChart} className="view-btn">
                Compare Selected ({compareStocks.length})
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="stock-table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredStocks.map((stock) => (
                  <tr
                    key={stock.id}
                    className={compareStocks.includes(stock.symbol) ? 'selected-row' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{stock.symbol}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{stock.company_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${stock.current_price.toFixed(2)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${stock.price_change >= 0 ? 'positive' : 'negative'}`}>
                      {stock.price_change >= 0 ? <ArrowUpRight className="inline w-4 h-4 mr-1" /> : <ArrowDownRight className="inline w-4 h-4 mr-1" />}
                      {stock.price_change.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <input
                        type="number"
                        min="0"
                        value={purchaseAmount[stock.id] || ''}
                        onChange={(e) =>
                          setPurchaseAmount({ ...purchaseAmount, [stock.id]: parseInt(e.target.value, 10) })
                        }
                        className="w-16 px-2 py-1 border rounded-md text-sm"
                        placeholder="Qty"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                      <button onClick={() => handlePurchase(stock)} className="view-btn">Buy</button>
                      <button onClick={() => handleViewChart(stock)} className="view-btn">Chart</button>
                      <button
                        onClick={() => handleToggleCompareStock(stock.symbol)}
                        className={`view-btn ${compareStocks.includes(stock.symbol) ? 'bg-gray-500 hover:bg-gray-600' : ''}`}
                      >
                        {compareStocks.includes(stock.symbol) ? <Check className="w-4 h-4 mr-1" /> : null}
                        Compare
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Chart Modal */}
      {showChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300">
          <div className="chart-container bg-white dark:bg-gray-800 p-6 rounded-lg w-11/12 md:w-3/4 lg:w-1/2 relative">
            <button onClick={handleCloseChart} className="absolute top-4 right-4 text-gray-600 dark:text-gray-300">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {comparisonMode ? 'Comparison Chart' : `${selectedStock?.company_name} Stock Chart`}
            </h3>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <label className="mr-2 text-gray-700 dark:text-gray-300">Timeframe:</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="px-2 py-1 border rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="1D">1D</option>
                  <option value="1W">1W</option>
                  <option value="1M">1M</option>
                  <option value="3M">3M</option>
                  <option value="1Y">1Y</option>
                  <option value="5Y">5Y</option>
                </select>
              </div>
              <div>
                <button
                  onClick={() => setComparisonMode(!comparisonMode)}
                  className="px-3 py-1 border rounded-md text-sm text-gray-700 dark:text-gray-300"
                >
                  {comparisonMode ? 'Single Stock' : 'Comparison Mode'}
                </button>
              </div>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              {loadingChart ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
                  <p>Loading chart...</p>
                </div>
              ) : comparisonMode ? (
                <ResponsiveContainer>
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {compareStocks.map((symbol, index) => (
                      <Line key={symbol} type="monotone" dataKey={symbol} stroke={getLineColor(index)} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer>
                  <LineChart data={stockHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#3b82f6" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockComponent;

// marketSimulation.ts - Contains functions for simulating stock market behavior

import { supabase } from '@/lib/supabaseClient';

export interface Stock {
  id: string;
  symbol: string;
  company_name: string;
  current_price: number;
  price_change: number;
  sector: string;
  market_cap: number;
  available_shares: number;
  total_shares: number;
  volatility: number;
  daily_open: number;
  volume_today: number;
}

/**
 * Updates a stock's price based on buy/sell transactions
 * @param stockId The ID of the stock
 * @param quantity Number of shares traded
 * @param isBuy Whether this is a buy (true) or sell (false) transaction
 * @returns The updated stock data
 */
export const updateStockPrice = async (stockId: string, quantity: number, isBuy: boolean) => {
  try {
    // Get current stock data
    const { data: stockData, error: fetchError } = await supabase
      .from('stocks')
      .select('*')
      .eq('id', stockId)
      .single();
    
    if (fetchError || !stockData) {
      console.error('Error fetching stock data:', fetchError);
      return null;
    }
    
    // Calculate price impact based on trade size relative to market cap and available shares
    const marketCapImpact = (quantity * stockData.current_price) / (stockData.market_cap || stockData.current_price * 10000000);
    const liquidityImpact = stockData.available_shares ? (quantity / stockData.available_shares) : 0.0001;
    const priceImpact = Math.min(0.1, marketCapImpact + liquidityImpact * 0.02); // Cap at 10% max move per transaction
    
    // Buy orders increase price, sell orders decrease price
    const impactMultiplier = isBuy ? 1 : -1;
    const newPrice = stockData.current_price * (1 + (impactMultiplier * priceImpact));
    
    // Calculate new price change percentage compared to daily open
    const dailyOpen = stockData.daily_open || stockData.current_price / (1 + stockData.price_change / 100);
    const newPriceChange = ((newPrice - dailyOpen) / dailyOpen) * 100;
    
    // Update available shares
    const newAvailableShares = stockData.available_shares 
      ? (isBuy 
          ? Math.max(0, stockData.available_shares - quantity) 
          : stockData.available_shares + quantity)
      : undefined;
    
    // Update volume
    const newVolume = (stockData.volume_today || 0) + quantity;
    
    // Update the stock in the database
    const { data: updatedStock, error: updateError } = await supabase
      .from('stocks')
      .update({
        current_price: newPrice,
        price_change: newPriceChange,
        available_shares: newAvailableShares,
        volume_today: newVolume
      })
      .eq('id', stockId)
      .select('*')
      .single();
    
    if (updateError) {
      console.error('Error updating stock:', updateError);
      return null;
    }
    
    console.log(`${stockData.symbol} price updated to $${newPrice.toFixed(2)} (${newPriceChange.toFixed(2)}%) - Volume: ${newVolume}`);
    
    // Create a price history entry
    await createPriceHistoryEntry(stockId, newPrice, quantity, isBuy ? 'buy' : 'sell');
    
    return updatedStock;
  } catch (error) {
    console.error('Error updating stock price:', error);
    return null;
  }
};

/**
 * Records a price point in the stock's history
 */
export const createPriceHistoryEntry = async (stockId: string, price: number, volume: number = 0, transactionType: string = 'market') => {
  try {
    await supabase
      .from('stock_history')
      .insert({
        stock_id: stockId,
        price: price,
        volume: volume,
        transaction_type: transactionType,
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error recording price history:', error);
  }
};

/**
 * Simulates natural market movements for all stocks
 */
export const simulateMarketMovements = async () => {
  try {
    // Get global market trend (-1 to 1)
    const marketTrend = (Math.random() * 2 - 1) * 0.005; // Between -0.5% and +0.5%
    
    // Get sector trends (different sectors move differently)
    const sectorTrends: Record<string, number> = {
      'technology': marketTrend + (Math.random() * 0.004 - 0.002),
      'finance': marketTrend + (Math.random() * 0.003 - 0.0015),
      'energy': marketTrend + (Math.random() * 0.006 - 0.003),
      'healthcare': marketTrend + (Math.random() * 0.0035 - 0.00175),
      'consumer': marketTrend + (Math.random() * 0.0025 - 0.00125),
      'industrial': marketTrend + (Math.random() * 0.003 - 0.0015),
      'materials': marketTrend + (Math.random() * 0.0045 - 0.00225),
      'utilities': marketTrend + (Math.random() * 0.002 - 0.001),
      'telecom': marketTrend + (Math.random() * 0.0035 - 0.00175),
      'real_estate': marketTrend + (Math.random() * 0.003 - 0.0015)
    };
    
    // Default for unknown sectors
    const defaultTrend = marketTrend;
    
    // Get all stocks
    const { data: stocksData } = await supabase
      .from('stocks')
      .select('*');
    
    if (!stocksData) return;
    
    // Update each stock
    for (const stock of stocksData) {
      // Determine sector trend
      const sectorTrend = sectorTrends[stock.sector] || defaultTrend;
      
      // Apply sector trend + individual stock volatility
      const stockVolatility = stock.volatility || 1.0;
      const individualFactor = (Math.random() * 2 - 1) * 0.008 * stockVolatility;
      
      // Calculate new price with combined factors
      const totalFactor = marketTrend + sectorTrend + individualFactor;
      const newPrice = stock.current_price * (1 + totalFactor);
      
      // Calculate new price change from daily open
      const dailyOpen = stock.daily_open || stock.current_price / (1 + stock.price_change / 100);
      const newPriceChange = ((newPrice - dailyOpen) / dailyOpen) * 100;
      
      // Add some random volume
      const randomVolume = Math.floor(Math.random() * 100) + 1;
      const newVolume = (stock.volume_today || 0) + randomVolume;
      
      // Update stock in database
      await supabase
        .from('stocks')
        .update({
          current_price: newPrice,
          price_change: newPriceChange,
          volume_today: newVolume
        })
        .eq('id', stock.id);
      
      // Record the price point in history (only for significant moves)
      if (Math.abs(totalFactor) > 0.002) {
        await createPriceHistoryEntry(stock.id, newPrice, randomVolume);
      }
    }
    
    console.log('Market movement simulation completed');
  } catch (error) {
    console.error('Error simulating market movements:', error);
  }
};

/**
 * Resets daily values for all stocks (to be called at market open)
 */
export const resetDailyValues = async () => {
  try {
    const { data: stocksData } = await supabase
      .from('stocks')
      .select('*');
    
    if (!stocksData) return;
    
    for (const stock of stocksData) {
      await supabase
        .from('stocks')
        .update({
          daily_open: stock.current_price,
          price_change: 0,
          volume_today: 0
        })
        .eq('id', stock.id);
    }
    
    console.log('Daily stock values reset');
  } catch (error) {
    console.error('Error resetting daily values:', error);
  }
};

/**
 * Fetches historical stock data for charting
 */
export const fetchStockHistory = async (stockId: string, timeframe: string) => {
  try {
    let startDate = new Date();
    // Adjust start date based on timeframe
    if (timeframe === '1D') startDate.setDate(startDate.getDate() - 1);
    else if (timeframe === '1W') startDate.setDate(startDate.getDate() - 7);
    else if (timeframe === '1M') startDate.setMonth(startDate.getMonth() - 1);
    else if (timeframe === '3M') startDate.setMonth(startDate.getMonth() - 3);
    else if (timeframe === '1Y') startDate.setFullYear(startDate.getFullYear() - 1);
    else if (timeframe === '5Y') startDate.setFullYear(startDate.getFullYear() - 5);
    
    const { data, error } = await supabase
      .from('stock_history')
      .select('*')
      .eq('stock_id', stockId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error('Error fetching stock history:', error);
      return null;
    }
    
    // If no historical data or insufficient data points, use current price to generate synthetic data
    if (!data || data.length < 5) {
      const { data: stockData } = await supabase
        .from('stocks')
        .select('*')
        .eq('id', stockId)
        .single();
      
      if (!stockData) return [];
      
      // Generate synthetic history using the actual current price as the end point
      return generateSyntheticHistory(stockData, timeframe);
    }
    
    // Format the data for charting
    return data.map(item => ({
      date: formatDate(new Date(item.timestamp), timeframe),
      price: item.price,
      volume: item.volume
    }));
  } catch (error) {
    console.error('Error fetching stock history:', error);
    return [];
  }
};

/**
 * Generates synthetic historical data when real data is unavailable
 */
const generateSyntheticHistory = (stock: Stock, timeframe: string) => {
  const data = [];
  const now = new Date();
  let dataPoints = 30;
  
  if (timeframe === '1D') dataPoints = 24;
  else if (timeframe === '1W') dataPoints = 7;
  else if (timeframe === '3M') dataPoints = 90;
  else if (timeframe === '1Y') dataPoints = 12;
  else if (timeframe === '5Y') dataPoints = 20;

  const currentPrice = stock.current_price;
  const volatility = stock.volatility || 1.0;
  const changeMultiplier = 1 + stock.price_change / 100;
  const startingPrice = currentPrice / changeMultiplier;

  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(now);
    if (timeframe === '1D') date.setHours(now.getHours() - (dataPoints - i));
    else if (timeframe === '5Y') date.setMonth(now.getMonth() - (dataPoints - i) * 3);
    else if (timeframe === '1Y') date.setMonth(now.getMonth() - (dataPoints - i));
    else date.setDate(now.getDate() - (dataPoints - i));

    const progress = i / (dataPoints - 1);
    const trendPrice = startingPrice + (currentPrice - startingPrice) * progress;
    const randomFactor = (Math.random() - 0.5) * 0.05 * volatility;
    const price = trendPrice * (1 + randomFactor);
    
    data.push({
      date: formatDate(date, timeframe),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(100000 + Math.random() * 900000 * volatility)
    });
  }
  
  return data;
};

/**
 * Formats a date according to the timeframe
 */
export const formatDate = (date: Date, timeframe: string): string => {
  if (timeframe === '1D')
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  else if (timeframe === '5Y' || timeframe === '1Y')
    return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
  else 
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
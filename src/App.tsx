/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  ShieldAlert, 
  Bot, 
  Zap, 
  Settings, 
  Bell, 
  Menu,
  ChevronRight,
  Target,
  Clock,
  LayoutDashboard,
  Wallet,
  History,
  Terminal
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from './lib/utils';
import { getTradingRecommendation, Recommendation } from './services/aiService';

// --- Mock Data & Constants ---

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AAPL', 'TSLA', 'NVDA'];

const generateMockData = (base: number, volatility: number, length: number = 30) => {
  const data = [];
  let currentPrice = base;
  for (let i = 0; i < length; i++) {
    const change = (Math.random() - 0.5) * volatility;
    currentPrice += change;
    data.push({
      time: new Date(Date.now() - (length - i) * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: parseFloat(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 1000)
    });
  }
  return data;
};

// --- Components ---

const Sidebar = () => (
  <nav className="w-16 border-r border-[#2d3139] flex flex-col items-center py-6 gap-8 bg-[#0d0f12] h-full">
    <div className="w-10 h-10 bg-gradient-to-br from-[#00ffa3] to-[#0066ff] rounded-lg shadow-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer">
      <span className="font-bold text-black text-xl">A</span>
    </div>
    <div className="flex flex-col gap-6 text-[#8e9299]">
      <button className="p-2 hover:bg-[#15171b] hover:text-[#00ffa3] rounded-lg transition-all group">
        <LayoutDashboard size={24} />
      </button>
      <button className="p-2 hover:bg-[#15171b] hover:text-[#00ffa3] rounded-lg transition-all opacity-40 group">
        <BarChart3 size={24} />
      </button>
      <button className="p-2 hover:bg-[#15171b] hover:text-[#00ffa3] rounded-lg transition-all opacity-40 group">
        <Wallet size={24} />
      </button>
      <button className="p-2 hover:bg-[#15171b] hover:text-[#00ffa3] rounded-lg transition-all opacity-40 group">
        <History size={24} />
      </button>
    </div>
    <div className="mt-auto opacity-40 hover:opacity-100 transition-opacity">
       <Settings size={24} className="text-[#8e9299]" />
    </div>
  </nav>
);

const SignalIndicator = ({ recommendation }: { recommendation: Recommendation | null }) => {
  if (!recommendation) return (
    <div className="flex flex-col items-center justify-center p-8 bg-[#15171b] border border-[#2d3139] rounded-xl animate-pulse">
      <Bot size={48} className="text-[#2d3139] mb-4" />
      <span className="text-[#8e9299] font-mono text-[10px] uppercase tracking-widest leading-none">AI ANALYSIS ENGINE ACTIVE...</span>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-[#00ffa3] to-[#0066ff] p-[1px] rounded-xl shadow-2xl shadow-[#00ffa3]/10"
    >
      <div className="bg-[#15171b] rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3">
          <div className={cn(
            "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
            recommendation.action === 'BUY' ? "bg-[#00ffa3]/10 border-[#00ffa3]/30 text-[#00ffa3]" :
            recommendation.action === 'SELL' ? "bg-red-400/10 border-red-400/30 text-red-400" :
            "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
          )}>
            {recommendation.action} SIGNAL
          </div>
        </div>
        
        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 opacity-70">Smart Recommendation</h2>
        
        <div className="flex items-center gap-4 mb-4">
          <div className={cn("p-3 rounded-lg", 
            recommendation.action === 'BUY' ? 'bg-[#00ffa3]/20 text-[#00ffa3]' :
            recommendation.action === 'SELL' ? 'bg-red-400/20 text-red-400' : 'bg-yellow-400/20 text-yellow-400'
          )}>
            {recommendation.action === 'BUY' ? <TrendingUp size={24} /> : 
             recommendation.action === 'SELL' ? <TrendingDown size={24} /> : 
             <Activity size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-white italic">{(recommendation.confidence * 100).toFixed(0)}%</span>
              <span className="text-[10px] text-[#8e9299] font-bold uppercase tracking-tighter">Confidence</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#8e9299] leading-relaxed mb-4 border-l-2 border-[#2d3139] pl-3 italic">
          {recommendation.reasoning}
        </p>

        <button className="w-full py-2.5 bg-[#00ffa3] hover:bg-[#00e391] text-black text-xs font-black rounded uppercase transition-all shadow-lg active:scale-[0.98]">
          Execute Trade
        </button>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [marketData, setMarketData] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  useEffect(() => {
    setMarketData(generateMockData(65000, 1500));
  }, [selectedSymbol]);

  useEffect(() => {
    if (marketData.length > 0) {
      handleGetRecommendation();
    }
  }, [selectedSymbol]);

  const handleGetRecommendation = async () => {
    setRecommendation(null);
    try {
      const rec = await getTradingRecommendation(selectedSymbol, marketData);
      setRecommendation(rec);
    } catch (error) {
      console.error(error);
    }
  };

  const currentPrice = marketData.length > 0 ? marketData[marketData.length - 1].price : 0;
  const previousPrice = marketData.length > 0 ? marketData[0].price : 0;
  const priceChange = ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2);

  return (
    <div className="bg-[#0a0b0d] text-white h-screen overflow-hidden font-sans flex selection:bg-[#00ffa3]/30">
      {/* --- Sidebar Nav --- */}
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* --- Header --- */}
        <header className="h-16 border-b border-[#2d3139] px-8 flex items-center justify-between bg-[#0a0b0d] z-10 shrink-0">
          <div className="flex items-center gap-4">
             <h1 className="text-lg font-medium tracking-tight uppercase">
               Astra Trader <span className="text-[#00ffa3] font-mono text-[10px] ml-2 uppercase tracking-[3px] opacity-80">v2.0 Engine</span>
             </h1>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse shadow-[0_0_8px_#00ffa3]"></div>
              <span className="text-[10px] text-[#8e9299] font-mono uppercase tracking-widest">Python Backend Active</span>
            </div>
            <div className="h-8 w-[1px] bg-[#2d3139]"></div>
            <div className="flex gap-6 items-center">
              <div className="text-right">
                <p className="text-[10px] text-[#4a4e57] uppercase font-bold tracking-tight">Portfolio Balance</p>
                <p className="font-mono font-bold text-sm text-white">$12,482.90</p>
              </div>
              <button className="px-5 py-2 bg-white text-black text-[10px] font-black rounded uppercase tracking-wider hover:bg-white/90 transition-colors">
                Run Bot
              </button>
            </div>
          </div>
        </header>

        {/* --- Content Area --- */}
        <div className="flex-1 grid grid-cols-12 p-6 gap-6 overflow-hidden">
          
          {/* --- Left Panes --- */}
          <section className="col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-[#15171b] border border-[#2d3139] rounded-xl p-5 shrink-0">
              <h2 className="text-[10px] font-black text-[#4a4e57] uppercase tracking-[2px] mb-4">Watchlist</h2>
              <div className="space-y-3">
                {SYMBOLS.map(symbol => (
                  <button 
                    key={symbol}
                    onClick={() => setSelectedSymbol(symbol)}
                    className={cn(
                      "w-full flex items-center justify-between group transition-all p-2 rounded-lg",
                      selectedSymbol === symbol ? "bg-[#0a0b0d] border border-[#2d3139]" : "hover:bg-[#1a1c22]"
                    )}
                  >
                    <div className="flex flex-col items-start">
                       <span className={cn(
                         "text-xs font-mono font-bold transition-colors",
                         selectedSymbol === symbol ? "text-[#00ffa3]" : "text-[#8e9299]"
                       )}>{symbol}</span>
                       <span className="text-[9px] text-[#4a4e57] uppercase font-bold tracking-tighter">Market Open</span>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-mono font-bold">42.92K</p>
                       <p className="text-[9px] text-[#00ffa3] font-bold">+2.4%</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#15171b] border border-[#2d3139] rounded-xl p-5 flex-1 flex flex-col">
              <h2 className="text-[10px] font-black text-[#4a4e57] uppercase tracking-[2px] mb-4">Live Indicators</h2>
              <div className="space-y-6 flex-1">
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-2">
                    <span className="text-[#8e9299]">RSI (14)</span>
                    <span className="text-[#00ffa3]">68.4</span>
                  </div>
                  <div className="h-1 bg-[#0a0b0d] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00ffa3] w-[68.4%] shadow-[0_0_8px_#00ffa3]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-2">
                    <span className="text-[#8e9299]">MACD Signal</span>
                    <span className="text-red-400">-124.5</span>
                  </div>
                  <div className="h-1 bg-[#0a0b0d] rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 w-[42%] shadow-[0_0_8px_#ef4444]"></div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-[#2d3139] mt-auto">
                   <p className="text-[9px] text-[#4a4e57] uppercase font-black mb-3 text-center tracking-widest">Sentiment Analysis</p>
                   <div className="flex gap-2">
                      <div className="flex-1 bg-[#0a0b0d] p-3 rounded-lg text-center border border-[#2d3139]">
                         <p className="text-[#00ffa3] text-xl font-black italic">84%</p>
                         <p className="text-[9px] text-[#8e9299] font-bold uppercase mt-1 tracking-tighter">Bullish</p>
                      </div>
                      <div className="flex-1 bg-[#0a0b0d] p-3 rounded-lg text-center border border-[#2d3139]">
                         <p className="text-white text-xl font-black italic opacity-40">16%</p>
                         <p className="text-[9px] text-[#8e9299] font-bold uppercase mt-1 tracking-tighter opacity-40">Bearish</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* --- Center Section --- */}
          <section className="col-span-6 flex flex-col gap-6 ">
             <div className="bg-[#15171b] border border-[#2d3139] rounded-xl flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute top-6 left-8 z-10">
                   <p className="text-[10px] text-[#00ffa3] font-mono font-bold tracking-[3px] uppercase mb-1">{selectedSymbol}</p>
                   <h3 className="text-5xl font-mono font-bold tracking-tighter text-white mb-1">
                      ${marketData.length > 0 ? marketData[marketData.length - 1].price.toLocaleString() : '0.00'}
                   </h3>
                   <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded",
                        parseFloat(priceChange) >= 0 ? "text-[#00ffa3] bg-[#00ffa3]/10" : "text-red-400 bg-red-400/10"
                      )}>
                        {parseFloat(priceChange) >= 0 ? '+' : ''}{priceChange}%
                      </span>
                      <span className="text-[10px] text-[#4a4e57] uppercase font-bold tracking-widest">Last 24h</span>
                   </div>
                </div>
                
                <div className="flex-1 flex items-end">
                   <div className="h-[75%] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={marketData} margin={{ top: 0, right: 0, left: 0, bottom: -1 }}>
                          <defs>
                            <linearGradient id="auraGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00ffa3" stopOpacity={0.15}/>
                              <stop offset="100%" stopColor="#0a0b0d" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0d0f12', 
                              border: '1px solid #2d3139', 
                              borderRadius: '8px', 
                              fontSize: '11px', 
                              fontFamily: 'monospace' 
                            }}
                            cursor={{ stroke: '#00ffa3', strokeWidth: 1 }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#00ffa3" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#auraGrad)" 
                            animationDuration={2000}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>

             <div className="h-44 bg-[#0d0f12] border border-[#2d3139] rounded-xl p-5 font-mono text-[10px] overflow-y-auto shrink-0 custom-scrollbar">
                <div className="flex items-center gap-2 text-[#00ffa3] mb-1.5">
                   <Terminal size={12} />
                   <span>SYSTEM LOG v2.0.4 - [Python Engine Initialized]</span>
                </div>
                <div className="text-[#8e9299] mb-1.5">{`> FETCHING REAL-TIME WEBSOCKET FEED FROM GLOBAL SOURCES...`}</div>
                <div className="text-[#8e9299] mb-1.5">{`> MODEL XGB_V3 LOADING FEATURES: [volatility, rsi_divergence, order_flow]`}</div>
                <div className="text-white mb-1.5 leading-relaxed">{`> [SIGNAL] Potential convergence detected at 15m interval for ${selectedSymbol}. Running validation script...`}</div>
                <div className="text-[#00ffa3]">{`> [EXECUTION] Calculating risk-adjusted entry: $${currentPrice.toLocaleString()}`}</div>
                <div className="text-[#00ffa3] animate-pulse">{`> STATUS: Idle (Waiting for permission)`}</div>
             </div>
          </section>

          {/* --- Right Section --- */}
          <section className="col-span-3 flex flex-col gap-6 ">
             <SignalIndicator recommendation={recommendation} />

             <div className="bg-[#15171b] border border-[#2d3139] rounded-xl p-5 flex-1 flex flex-col overflow-hidden">
                <h2 className="text-[10px] font-black text-[#4a4e57] uppercase tracking-[2px] mb-6">Signal History</h2>
                <div className="space-y-5 overflow-hidden flex-1">
                   {[
                     { side: 'SELL', symbol: 'ETH/USDT', time: '14:02 PM', pl: '+1.2%', up: true },
                     { side: 'BUY', symbol: 'SOL/USDT', time: '12:45 PM', pl: '-0.4%', up: false },
                     { side: 'BUY', symbol: 'BTC/USDT', time: '09:12 AM', pl: '+4.8%', up: true },
                     { side: 'SELL', symbol: 'NVDA', time: 'Yesterday', pl: '+2.1%', up: true }
                   ].map((item, idx) => (
                     <div key={idx} className="border-b border-[#2d3139] pb-4 last:border-0 group cursor-pointer hover:border-[#00ffa3]/30 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest",
                             item.side === 'BUY' ? "text-[#00ffa3]" : "text-red-400"
                           )}>{item.side}</span>
                           <span className="text-[9px] text-[#4a4e57] font-bold">{item.time}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-mono font-bold text-white group-hover:text-[#00ffa3] transition-colors">{item.symbol}</span>
                           <span className={cn(
                             "text-[10px] font-mono font-bold",
                             item.up ? "text-[#00ffa3]" : "text-red-400"
                           )}>{item.pl}</span>
                        </div>
                     </div>
                   ))}
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-center gap-2 opacity-30 hover:opacity-100 transition-opacity cursor-pointer">
                   <Activity size={12} className="text-[#00ffa3]" />
                   <span className="text-[9px] font-bold uppercase tracking-widest">View System Metrics</span>
                </div>
             </div>
          </section>

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0a0b0d;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2d3139;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00ffa3;
        }
      `}</style>
    </div>
  );
}

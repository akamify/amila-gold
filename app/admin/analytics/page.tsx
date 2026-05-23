'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  Heart, 
  BarChart3, 
  RefreshCcw, 
  AlertCircle,
  Globe,
  Zap
} from 'lucide-react';
import { fetchAdminAnalyticsOverview, type AdminAnalyticsOverview } from '@/app/lib/apiClient';
import { useSiteSettings } from '@/app/context/SiteSettingsContext';

// --- Helpers ---
const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const formatTrend = (value: number) => {
  const safe = Number(value || 0);
  const sign = safe > 0 ? '+' : '';
  return `${sign}${safe.toFixed(1)}%`;
};

// --- Sub-Components ---

const StatCard = ({ label, val, trend, trendValue, reversed, delay }: any) => {
  const isPositive = reversed ? trendValue < 0 : trendValue >= 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative group bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-red-500/50 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Zap size={40} className="text-red-600" />
      </div>
      
      <span className="block font-sans text-[10px] tracking-[0.2em] font-bold text-slate-500 uppercase mb-4">
        {label}
      </span>
      
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {val}
        </span>
        
        <div className={`flex items-center gap-1.5 text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trend}</span>
          <span className="text-slate-400 font-medium ml-1 text-[10px] uppercase tracking-wider">vs last month</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function AdminAnalytics() {
  const { settings } = useSiteSettings();
  const currency = settings.currencySymbol || '$';

  const [data, setData] = useState<AdminAnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setIsLoading(true);
      setError('');
      const overview = await fetchAdminAnalyticsOverview(30);
      setData(overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Telemetry sync failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const metrics = useMemo(() => {
    const m = data?.metrics;
    const defaultMetrics = [
      { label: 'Avg Order Value', key: 'averageOrderValue', rev: false },
      { label: 'Customer LTV', key: 'customerLtv', rev: false },
      { label: 'Repurchase Rate', key: 'repurchaseRate', isPct: true, rev: false },
      { label: 'Cart Abandonment', key: 'cartAbandonment', isPct: true, rev: true },
    ];

    return defaultMetrics.map(item => {
      const val = m ? (m as any)[item.key] : 0;
      const trend = m ? (m as any)[`${item.key}Trend`] : 0;
      return {
        label: item.label,
        val: item.isPct ? `${Number(val).toFixed(1)}%` : `${currency}${Number(val).toLocaleString()}`,
        trend: formatTrend(trend),
        trendValue: trend,
        reversed: item.rev
      };
    });
  }, [data, currency]);

  const performanceIndex = clamp(Number(data?.performanceIndex || 0));

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 blur-lg bg-red-500/20 animate-pulse"></div>
      </div>
      <p className="font-sans text-xs tracking-[0.3em] font-bold text-slate-500 animate-pulse">ESTABLISHING UPLINK</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-[2px] w-8 bg-red-600"></span>
            <span className="text-[10px] font-black tracking-[0.4em] text-red-600 uppercase">System Intelligence</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 uppercase italic">
            Kinetic<span className="text-red-600">.</span>Insight
          </h2>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-full self-start md:self-auto">
            <button onClick={load} className="p-2 hover:bg-white rounded-full transition-all shadow-sm group">
                <RefreshCcw size={18} className={`text-slate-600 group-active:rotate-180 transition-transform duration-500`} />
            </button>
            <div className="px-4 py-1.5 bg-white rounded-full shadow-sm">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Q4 Live Stream</span>
            </div>
        </div>
      </header>

      {error && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-rose-700">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button onClick={load} className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:text-rose-900 transition-colors">Retry Sync</button>
        </motion.div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {metrics.map((m, i) => (
          <StatCard key={i} {...m} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Regional Performance */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-100 rounded-lg">
                 <Globe size={20} className="text-red-600" />
               </div>
               <h3 className="text-xl font-bold tracking-tight">Regional Distribution</h3>
            </div>
          </div>
          
          <div className="space-y-6">
            {(data?.regional || [{ region: 'Global', growthPercent: 0 }]).map((r, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-red-600 transition-colors">{r.region}</span>
                  <span className={`text-xs font-bold ${r.growthPercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {formatTrend(r.growthPercent)} GROWTH
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${clamp(Math.abs(r.growthPercent) * 2)}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Circular Gauge */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
          
          <h3 className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase mb-8">Performance Index</h3>
          
          <div className="relative w-48 h-48 md:w-56 md:h-56">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
              <motion.circle 
                cx="50%" cy="50%" r="45%" 
                stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray="283"
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * performanceIndex) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-red-600"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-5xl font-black text-white italic">{performanceIndex}%</span>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Efficiency</span>
            </div>
          </div>
          
          <p className="mt-8 text-center text-xs leading-relaxed text-slate-400 max-w-[220px] font-medium italic">
            "{data?.notes || 'System metrics calibrated. All nodes reporting stable growth across active sectors.'}"
          </p>
        </div>
      </div>

      {/* Product Intelligence */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-3">
          <BarChart3 size={24} className="text-red-600" />
          <h3 className="text-2xl font-black tracking-tighter uppercase italic text-slate-800">Product Intelligence</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {[
            { title: 'Added to Cart', items: data?.topProducts?.mostAddedToCart, icon: <ShoppingCart size={14}/> },
            { title: 'Wishlisted', items: data?.topProducts?.mostWishlisted, icon: <Heart size={14}/> },
            { title: 'Units Ordered', items: data?.topProducts?.mostOrdered, icon: <Package size={14}/> },
            { title: 'Top Revenue', items: data?.topProducts?.bestSelling, icon: <TrendingUp size={14}/>, isPrice: true }
          ].map((block, bIdx) => (
            <div key={bIdx} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-red-600">{block.icon}</span>
                <h4 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">{block.title}</h4>
              </div>
              
              <div className="space-y-4">
                {block.items?.length ? block.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="relative w-12 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                      {item.productImage ? (
                        <img src={item.productImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-slate-300"/></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate uppercase tracking-tight">{item.productName}</p>
                      <p className="text-[9px] font-medium text-slate-400">#{item.productId.toString().slice(-6)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">
                        {block.isPrice ? `${currency}${item.metric.toLocaleString()}` : item.metric}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-[10px] font-bold text-slate-400 italic">Awaiting data...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
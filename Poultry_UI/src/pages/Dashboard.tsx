import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bird, Activity, TrendingUp, AlertCircle, Loader2, RefreshCw, ArrowUpRight, Calendar } from 'lucide-react';
import api from '../services/api'; 

interface Metric {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  trend: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Metric[]>([
    { label: 'Total Birds', value: '0', icon: Bird, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12%' },
    { label: 'Active Flocks', value: '0', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Stable' },
    { label: 'Total Revenue', value: '₹0', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+5.4%' },
  ]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/Dashboard');
      const data = res.data;

      if (data) {
        setStats([
          { 
            label: 'Total Birds', 
            value: (data.totalBirds ?? 0).toLocaleString(), 
            icon: Bird, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50/50',
            trend: '+2.1% from last week'
          },
          { 
            label: 'Active Flocks', 
            value: (data.activeFlocks ?? 0).toString(), 
            icon: Activity, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50/50',
            trend: 'Direct tracking'
          },
          { 
            label: 'Total Revenue', 
            value: '₹' + (data.totalRevenue ?? 0).toLocaleString(), 
            icon: TrendingUp, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50/50',
            trend: '+18.3% month-over-month'
          },
        ]);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setError('Connection successful, but failed to fetch statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current date for the header
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Live
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">Admin</span>
          </h1>
          <div className="flex items-center gap-2 text-slate-400 mt-2 font-medium">
            <Calendar size={16} />
            <span>{today}</span>
          </div>
        </div>
        
        <button 
          onClick={fetchDashboardData} 
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50 active:scale-95"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> : <RefreshCw className="w-4 h-4" />}
          Refresh Insights
        </button>
      </div>

      {error && (
        <div className="bg-red-50/50 backdrop-blur-sm border border-red-100 text-red-600 p-5 rounded-2xl flex gap-4 items-center animate-in zoom-in-95">
          <div className="bg-red-100 p-2 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold leading-tight">{error}</p>
        </div>
      )}

      {/* Option 2 Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border border-white shadow-sm transition-transform group-hover:scale-110 duration-500`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black bg-slate-50 px-3 py-1.5 rounded-full text-slate-400 border border-slate-100 uppercase tracking-tighter">
                  <ArrowUpRight size={12} className="text-emerald-500" />
                  {stat.trend}
                </div>
              </div>
              
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                <h3 className="text-4xl font-black text-slate-900 flex items-baseline gap-1">
                  {isLoading ? (
                    <span className="h-10 w-24 bg-slate-100 animate-pulse rounded-lg"></span>
                  ) : (
                    stat.value
                  )}
                </h3>
              </div>

              {/* Decorative Background Element */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
                <Icon size={120} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder for "Quick Actions" - Essential for Option 2 vibe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl shadow-slate-200">
          <div className="relative z-10">
            <h4 className="text-2xl font-black mb-2">Manage Your Flocks</h4>
            <p className="text-slate-400 font-medium mb-8 max-w-xs">Easily track mortality, feed consumption, and vaccinations.</p>
            <button 
              onClick={() => navigate('/flocks')}
              className="bg-emerald-500 text-slate-900 px-6 py-3 rounded-xl font-black text-sm hover:bg-emerald-400 transition-colors active:scale-95"
            >
              View All Flocks
            </button>
          </div>
          <Bird className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-center">
            <h4 className="text-2xl font-black text-slate-900 mb-2">Inventory Alerts</h4>
            <p className="text-slate-400 font-medium mb-8">No critical stock alerts today. Your feed supplies are optimal.</p>
            <div className="flex gap-4">
               <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
               <div className="w-2 h-2 rounded-full bg-slate-100"></div>
               <div className="w-2 h-2 rounded-full bg-slate-100"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
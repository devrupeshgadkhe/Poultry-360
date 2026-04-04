import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; 
import { 
  Plus, 
  Bird, 
  Search, 
  X, 
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  Syringe,
  ClipboardList,
  Calendar,
  BadgeDollarSign,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';

const FlockList: React.FC = () => {
  const navigate = useNavigate();
  const [flocks, setFlocks] = useState<any[]>([]);
  const [filteredFlocks, setFilteredFlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedFlock, setSelectedFlock] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFlocks();
  }, []);

  const fetchFlocks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Flocks');
      setFlocks(response.data);
      setFilteredFlocks(response.data);
    } catch (err: any) {
      setError("Failed to fetch flocks. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = flocks;
    if (statusFilter !== 'All') {
      result = result.filter(f => (f.Status || f.status) === statusFilter);
    }
    if (searchTerm) {
      result = result.filter(f => 
        (f.Breed || f.breed).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredFlocks(result);
  }, [searchTerm, statusFilter, flocks]);

  const handleDeleteFlock = async () => {
    if (!selectedFlock) return;
    try {
      setIsSubmitting(true);
      const id = selectedFlock.Id || selectedFlock.id;
      await api.delete(`/Flocks/${id}`);
      setFlocks(flocks.filter(f => (f.Id || f.id) !== id));
      setIsDeleteModalOpen(false);
      setSelectedFlock(null);
    } catch (err) {
      alert("Error deleting flock");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <div className="relative">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
            <Bird className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={20} />
        </div>
        <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs animate-pulse">Loading Farm Data</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen font-sans text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-200">
                <Activity className="text-white" size={28} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Flock Inventory</h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Manage your active & sold batches</p>
            </div>
        </div>
        <button 
          onClick={() => navigate('/flocks/add')}
          className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95 text-xs tracking-widest uppercase"
        >
          <Plus size={18} /> New Batch
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by breed (e.g. Rohu, Broiler)..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none font-bold text-sm transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
            <select 
            className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 outline-none text-xs uppercase shadow-sm focus:border-emerald-500 transition-all cursor-pointer tracking-widest"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            >
            <option value="All tracking-widest">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Closed">Closed</option>
            <option value="Sold">Fully Sold</option>
            </select>
        </div>
      </div>

      {/* Grid Section */}
      {filteredFlocks.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Bird size={40} />
              </div>
              <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">No Batches Found</h3>
              <p className="text-slate-400 text-sm font-medium mt-2">Try adjusting your filters or add a new flock.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFlocks.map((flock) => {
                const isStatusActive = (flock.Status || flock.status) === 'Active';
                const breedName = flock.Breed || flock.breed;
                const id = flock.Id || flock.id;
                const price = flock.PerBirdPurchasePrice || flock.perBirdPurchasePrice || flock.CostPerBird || 0;

                return (
                <div 
                    key={id} 
                    className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative flex flex-col overflow-hidden"
                >
                    {/* Status Ribbon */}
                    <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-[0.1em] text-white shadow-sm z-10 ${
                        isStatusActive ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}>
                        {flock.Status || flock.status}
                    </div>

                    <div className="p-6 flex-1">
                        {/* Breed Info */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-slate-50 p-3 rounded-2xl text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                <Bird size={24} />
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="text-base font-black text-slate-800 uppercase truncate leading-none mb-1.5">
                                    {breedName}
                                </h3>
                                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                                    <Calendar size={12} className="text-emerald-500" />
                                    {new Date(flock.ArrivalDate || flock.arrivalDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Stock</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-black text-slate-700">{flock.CurrentCount || flock.currentCount}</span>
                                    <span className="text-[8px] font-bold text-slate-400">/ {flock.InitialCount || flock.initialCount}</span>
                                </div>
                            </div>
                            <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
                                <span className="text-[9px] font-black text-emerald-600 uppercase block mb-1">Buy Rate</span>
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-[10px] font-black text-emerald-600">₹</span>
                                    <span className="text-sm font-black text-emerald-700">{parseFloat(price).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="space-y-2.5">
                            <button 
                                onClick={() => navigate(`/daily-logs/${id}`)}
                                className="w-full flex items-center justify-between p-3.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all group/btn shadow-lg shadow-slate-200"
                            >
                                <div className="flex items-center gap-3">
                                    <ClipboardList size={16} className="text-emerald-400" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Daily Entry</span>
                                </div>
                                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>

                            <button 
                                onClick={() => navigate(`/flocks/${id}/vaccinations`)}
                                className="w-full flex items-center justify-between p-3.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group/btn border border-blue-100"
                            >
                                <div className="flex items-center gap-3 text-blue-700">
                                    <Syringe size={16} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Vaccination</span>
                                </div>
                                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                        <button 
                            onClick={() => navigate(`/flocks/edit/${id}`)}
                            className="flex-1 bg-white hover:bg-amber-500 hover:text-white text-slate-600 py-2.5 rounded-xl border border-slate-200 font-black text-[10px] flex items-center justify-center gap-2 transition-all shadow-sm uppercase tracking-widest"
                        >
                            <Pencil size={12} /> Edit
                        </button>
                        <button 
                            onClick={() => { setSelectedFlock(flock); setIsDeleteModalOpen(true); }}
                            className="w-12 bg-white hover:bg-red-600 text-slate-400 hover:text-white py-2.5 rounded-xl border border-slate-200 transition-all shadow-sm flex items-center justify-center"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
                );
            })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border border-white">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12 group-hover:rotate-0 transition-transform">
                <Trash2 size={40} />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Delete Batch?</h2>
              <p className="text-slate-500 font-bold text-xs mt-3 px-2 leading-relaxed uppercase">
                तुम्ही <span className="text-red-600">{selectedFlock?.Breed || selectedFlock?.breed}</span> डिलीट करू इच्छिता? हा डेटा कायमचा निघून जाईल.
              </p>
              
              <div className="flex flex-col gap-3 mt-8">
                <button 
                  onClick={handleDeleteFlock} 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-red-600 text-white rounded-2xl font-black flex items-center justify-center transition-all hover:bg-red-700 shadow-xl shadow-red-200 disabled:opacity-50 uppercase text-[11px] tracking-[0.2em]"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : "Yes, Delete It"}
                </button>
                <button 
                  onClick={() => { setIsDeleteModalOpen(false); setSelectedFlock(null); }} 
                  className="w-full py-4 bg-transparent text-slate-400 font-black hover:text-slate-600 transition-colors uppercase text-[10px] tracking-widest"
                >
                  Cancel Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlockList;
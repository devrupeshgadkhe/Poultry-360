import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Bird, 
  Calendar, 
  Hash, 
  Save, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  CircleDollarSign,
  Info
} from 'lucide-react';
import api from '../../services/api';

const EditFlock: React.FC = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    breed: '',
    initialCount: '',
    currentCount: '',
    arrivalDate: '',
    perBirdPurchasePrice: '', 
    totalPurchasePrice: '',
    status: 'Active',
    isActive: true,
    notes: ''
  });

  // Load existing data from Backend
  useEffect(() => {
    const fetchFlockDetails = async () => {
      try {
        setFetching(true);
        const response = await api.get(`/Flocks/${id}`);
        const data = response.data;
        
        // Mapping PascalCase from Backend to camelCase for State
        setFormData({
          breed: data.Breed || '',
          initialCount: data.InitialCount?.toString() || '',
          currentCount: data.CurrentCount?.toString() || '',
          arrivalDate: data.ArrivalDate ? data.ArrivalDate.split('T')[0] : '',
          perBirdPurchasePrice: data.PerBirdPurchasePrice?.toString() || '0',
          totalPurchasePrice: data.TotalPurchasePrice?.toString() || '0',
          status: data.Status || 'Active',
          isActive: data.IsActive ?? true,
          notes: data.Notes || ''
        });
      } catch (err: any) {
        setError("Failed to fetch flock details.");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchFlockDetails();
  }, [id]);

  // Vice-versa calculation logic
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => {
      const newData = { ...prev, [name]: val };

      // फक्त किंमत किंवा संख्येच्या फील्ड्स बदलल्या तरच कॅल्क्युलेशन करा
      if (name === 'perBirdPurchasePrice' || name === 'initialCount' || name === 'totalPurchasePrice') {
        const count = parseFloat(newData.initialCount) || 0;
        const perBird = parseFloat(newData.perBirdPurchasePrice) || 0;
        const total = parseFloat(newData.totalPurchasePrice) || 0;

        if (name === 'perBirdPurchasePrice' || name === 'initialCount') {
          if (count > 0) {
            newData.totalPurchasePrice = (count * perBird).toFixed(2);
          }
        } else if (name === 'totalPurchasePrice') {
          if (count > 0) {
            newData.perBirdPurchasePrice = (total / count).toFixed(2);
          }
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Mapping to .NET DTO (PascalCase)
      const payload = {
        Id: parseInt(id!),
        Breed: formData.breed,
        InitialCount: parseInt(formData.initialCount),
        CurrentCount: parseInt(formData.currentCount),
        ArrivalDate: formData.arrivalDate,
        StartDate: formData.arrivalDate, // Syncing with ArrivalDate
        PerBirdPurchasePrice: parseFloat(formData.perBirdPurchasePrice) || 0,
        TotalPurchasePrice: parseFloat(formData.totalPurchasePrice) || 0,
        Status: formData.status,
        IsActive: formData.isActive,
        Notes: formData.notes
      };

      await api.put(`/Flocks/${id}`, payload);
      navigate('/flocks');
    } catch (err: any) {
      console.error("Update Error:", err);
      setError(err.response?.data?.Message || "Failed to update flock.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
        <p className="font-bold text-slate-500 animate-pulse uppercase tracking-widest">Loading Batch Details...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-left">
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/flocks')}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-all font-black uppercase text-sm tracking-tighter"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-slate-800 uppercase leading-none">Edit Batch</h1>
          <p className="text-[10px] font-bold text-slate-400 mt-1">ID: #{id}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Bird size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Modify Flock</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Update batch price or status</p>
            </div>
          </div>
          <div className="hidden md:block bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
             <span className="text-[10px] font-black text-slate-500 uppercase block">Current Status</span>
             <span className="text-sm font-bold text-emerald-400 uppercase">{formData.status}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex items-center gap-3 font-bold animate-shake">
              <AlertCircle size={20} />
              <span className="text-sm uppercase tracking-tight">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Breed */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Breed Type</label>
              <div className="relative group">
                <Bird className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input
                  type="text"
                  name="breed"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold transition-all"
                  value={formData.breed}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Arrival Date */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Arrival Date</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input
                  type="date"
                  name="arrivalDate"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold transition-all"
                  value={formData.arrivalDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Bird Count */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Initial Count</label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input
                  type="number"
                  name="initialCount"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold transition-all"
                  value={formData.initialCount}
                  onChange={handleChange}
                />
              </div>
            </div>

             {/* Status Selection */}
             <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Batch Status</label>
              <select
                name="status"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold transition-all appearance-none"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">ACTIVE</option>
                <option value="Closed">CLOSED</option>
                <option value="Sold">FULLY SOLD</option>
              </select>
            </div>

            {/* Price Calculation Section */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Price Per Bird (₹)</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black">₹</span>
                        <input
                        type="number"
                        step="0.01"
                        name="perBirdPurchasePrice"
                        className="w-full pl-10 pr-4 py-4 bg-white border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-black text-emerald-700 transition-all"
                        value={formData.perBirdPurchasePrice}
                        onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Total Batch Cost (₹)</label>
                    <div className="relative group">
                        <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                        <input
                        type="number"
                        step="0.01"
                        name="totalPurchasePrice"
                        className="w-full pl-12 pr-4 py-4 bg-white border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-black text-emerald-700 transition-all"
                        value={formData.totalPurchasePrice}
                        onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="md:col-span-2 flex items-center gap-2 text-[10px] font-bold text-emerald-600/60 uppercase italic">
                    <Info size={12} /> Prices are synced automatically based on bird count
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Notes / Remarks</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Record any specific observations..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-medium resize-none transition-all"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-3xl shadow-inner">
            <div className="relative inline-flex cursor-pointer select-none items-center">
                <input
                type="checkbox"
                id="isActive"
                name="isActive"
                className="sr-only"
                checked={formData.isActive}
                onChange={handleChange}
                />
                <div className={`mr-4 flex h-8 w-[60px] items-center rounded-full p-1 duration-200 ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`h-6 w-6 rounded-full bg-white duration-200 ${formData.isActive ? 'translate-x-[28px]' : ''}`}></div>
                </div>
                <label htmlFor="isActive" className="text-sm font-black text-slate-700 uppercase cursor-pointer">
                    Active Production Batch
                </label>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 uppercase tracking-widest"
            >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                {loading ? 'Updating Batch...' : 'Update Records'}
            </button>
            <button
                type="button"
                onClick={() => navigate('/flocks')}
                className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest"
            >
                Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFlock;
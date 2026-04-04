import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipboardList, Bird, Egg, Save, AlertCircle, Loader2, CheckCircle2, Weight, ArrowLeft } from 'lucide-react';
import api from '../services/api'; 

// Interfaces strictly matching PascalCase .NET DTOs
interface Flock {
  Id: number;
  Breed: string;
  CurrentCount: number;
}

interface DailyLogPayload {
  Id: number;
  FlockId: number;
  Date: string;
  MortalityCount: number;
  FeedConsumedKg: number;
  EggsCollected: number;
  AverageBirdWeightGm: number;
  Notes: string;
}

const DailyLogEntry: React.FC = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [activeFlocks, setActiveFlocks] = useState<Flock[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const [formData, setFormData] = useState<DailyLogPayload>({
    Id: 0,
    FlockId: 0,
    Date: new Date().toISOString().split('T')[0],
    MortalityCount: 0,
    FeedConsumedKg: 0,
    EggsCollected: 0,
    AverageBirdWeightGm: 0,
    Notes: ''
  });

  useEffect(() => {
    const initializeData = async () => {
      setFetchingData(true);
      await fetchFlocks();
      if (id) {
        await fetchExistingLog(id);
      }
      setFetchingData(false);
    };
    initializeData();
  }, [id]);

  const fetchFlocks = async () => {
    try {
      const res = await api.get<Flock[]>('/Flocks');
      const flockData = res.data || [];
      setActiveFlocks(flockData);
      
      if (!id && flockData.length > 0) {
        setFormData(prev => ({ ...prev, FlockId: flockData[0].Id }));
      }
    } catch (err) {
      console.error('Failed to fetch flocks:', err);
    }
  };

  const fetchExistingLog = async (logId: string) => {
    try {
      const res = await api.get('/DailyLogs/' + logId);
      const data = res.data;
      
      setFormData({
        Id: data.Id,
        FlockId: data.FlockId,
        Date: data.Date ? data.Date.split('T')[0] : '',
        MortalityCount: data.MortalityCount || 0,
        FeedConsumedKg: data.FeedConsumedKg || 0,
        EggsCollected: data.EggsCollected || 0,
        AverageBirdWeightGm: data.AverageBirdWeightGm || 0,
        Notes: data.Notes || ''
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setStatus({ type: 'error', msg: 'Failed to retrieve log details.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (id) {
        await api.put(`/DailyLogs/${id}`, formData);
      } else {
        await api.post('/DailyLogs', formData);
      }
      
      setStatus({ 
        type: 'success', 
        msg: id ? 'Log updated successfully!' : 'Log saved successfully!' 
      });
      
      setTimeout(() => navigate('/logs'), 1500);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Error saving log. 401 Unauthorized or API Error.' });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-gray-500 font-bold">Syncing data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={() => navigate('/logs')}
        className="flex items-center gap-2 text-gray-500 font-bold hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Return to History
      </button>

      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">{id ? 'Update Daily Log' : 'New Log Entry'}</h2>
            <p className="text-gray-500 font-medium">Record daily flock health and production.</p>
          </div>
        </div>

        {status && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold">{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Flock</label>
              <select 
                value={formData.FlockId}
                onChange={(e) => setFormData({ ...formData, FlockId: parseInt(e.target.value) })}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-700 transition-all appearance-none"
              >
                {activeFlocks.map(flock => (
                  <option key={flock.Id} value={flock.Id}>
                    {flock.Breed} (Current: {flock.CurrentCount})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Log Date</label>
              <input 
                type="date" 
                value={formData.Date}
                onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-700 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 bg-red-50/50 rounded-3xl border border-red-100/50">
              <label className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 block">Mortality</label>
              <input 
                type="number" 
                value={formData.MortalityCount}
                onChange={(e) => setFormData({ ...formData, MortalityCount: parseInt(e.target.value) || 0 })}
                className="w-full bg-transparent text-2xl font-black text-red-600 outline-none" 
              />
            </div>
            
            <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 block">Eggs Collected</label>
              <input 
                type="number" 
                value={formData.EggsCollected}
                onChange={(e) => setFormData({ ...formData, EggsCollected: parseInt(e.target.value) || 0 })}
                className="w-full bg-transparent text-2xl font-black text-emerald-600 outline-none" 
              />
            </div>

            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 block">Feed (kg)</label>
              <input 
                type="number" 
                step="0.1"
                value={formData.FeedConsumedKg}
                onChange={(e) => setFormData({ ...formData, FeedConsumedKg: parseFloat(e.target.value) || 0 })}
                className="w-full bg-transparent text-2xl font-black text-blue-600 outline-none" 
              />
            </div>

            <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100/50">
              <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 block">Avg Weight (g)</label>
              <input 
                type="number" 
                value={formData.AverageBirdWeightGm}
                onChange={(e) => setFormData({ ...formData, AverageBirdWeightGm: parseInt(e.target.value) || 0 })}
                className="w-full bg-transparent text-2xl font-black text-orange-600 outline-none" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Notes / Observations</label>
            <textarea
              value={formData.Notes}
              onChange={(e) => setFormData({ ...formData, Notes: e.target.value })}
              placeholder="Health observations..."
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-medium text-gray-700 transition-all min-h-[120px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-gray-200 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> {id ? 'Update Entry' : 'Save Entry'}</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DailyLogEntry;
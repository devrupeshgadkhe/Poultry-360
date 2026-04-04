import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle,
  Calendar,
  Bird,
  Utensils,
  Egg,
  Scale,
  TrendingDown,
  ChevronDown,
  Search,
  ClipboardList
} from 'lucide-react';

interface FlockOption {
  Id: number;
  Breed: string;
  IsActive: boolean;
}

interface FeedOption {
  Id: number;
  Name: string;
  PurchasePrice: number;
  Category: string;
}

const EditDailyLog: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [flocks, setFlocks] = useState<FlockOption[]>([]);
  const [feedItems, setFeedItems] = useState<FeedOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [feedSearch, setFeedSearch] = useState('');
  
  const [formData, setFormData] = useState({
    id: 0,
    flockId: 0,
    date: '',
    mortalityCount: 0,
    mortalityReason: '',
    feedItemId: 0,
    feedConsumedKg: 0,
    eggsCollected: 0,
    damagedEggsCollected: 0,
    averageBirdWeightGm: 0,
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setInitialLoading(true);
      const [flocksRes, inventoryRes, logRes] = await Promise.all([
        api.get('/Flocks'),
        api.get('/Inventory'),
        api.get(`/DailyLogs/${id}`)
      ]);

      setFlocks(flocksRes.data.filter((f: any) => f.IsActive || f.Id === logRes.data.FlockId));
      setFeedItems(inventoryRes.data.filter((item: any) => item.Category === 'Feed'));

      // Mapping PascalCase from API to camelCase for Form
      const log = logRes.data;
      setFormData({
        id: log.Id,
        flockId: log.FlockId,
        date: log.Date ? log.Date.split('T')[0] : '',
        mortalityCount: log.MortalityCount || 0,
        mortalityReason: log.MortalityReason || '',
        feedItemId: log.FeedItemId,
        feedConsumedKg: log.FeedConsumedKg || 0,
        eggsCollected: log.EggsCollected || 0,
        damagedEggsCollected: log.DamagedEggsCollected || 0,
        averageBirdWeightGm: log.AverageBirdWeightGm || 0,
        notes: log.Notes || ''
      });

    } catch (err) {
      setError('Log data load karta aala nahi.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['notes', 'mortalityReason', 'date'].includes(name) ? value : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Backend expects PascalCase or properly mapped DTO
      await api.put(`/DailyLogs/${id}`, {
        Id: formData.id,
        FlockId: formData.flockId,
        Date: formData.date,
        MortalityCount: formData.mortalityCount,
        MortalityReason: formData.mortalityReason,
        FeedItemId: formData.feedItemId,
        FeedConsumedKg: formData.feedConsumedKg,
        EggsCollected: formData.eggsCollected,
        DamagedEggsCollected: formData.damagedEggsCollected,
        AverageBirdWeightGm: formData.averageBirdWeightGm,
        Notes: formData.notes
      });
      navigate('/daily-logs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Update kartaana error aala.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTrays = (eggs: number) => {
    const trays = Math.floor(eggs / 30);
    const remaining = eggs % 30;
    return `${trays} Trays ${remaining > 0 ? `+ ${remaining} Eggs` : ''}`;
  };

  const filteredFeed = feedItems.filter(item => 
    item.Name.toLowerCase().includes(feedSearch.toLowerCase())
  );

  if (initialLoading) {
    return (
      <div className="flex h-96 items-center justify-center flex-col gap-3">
        <Loader2 className="animate-spin text-orange-600" size={32} />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Fetching Log Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 px-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/daily-logs')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Edit Daily Log</h1>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Update record ID: #{id}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={18} />
          <p className="font-bold text-xs uppercase tracking-tight">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Flock Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              <Bird size={12} className="text-orange-500" /> Flock
            </label>
            <select
              name="flockId"
              value={formData.flockId}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-700 text-sm focus:border-orange-500 appearance-none cursor-pointer"
            >
              <option value="0">Select Flock...</option>
              {flocks.map(f => <option key={f.Id} value={f.Id}>{f.Breed} (ID: {f.Id})</option>)}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              <Calendar size={12} className="text-orange-500" /> Log Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-700 text-sm focus:border-orange-500"
            />
          </div>

          {/* Feed Custom Dropdown */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              <Utensils size={12} className="text-orange-500" /> Feed Type
            </label>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between cursor-pointer font-bold text-slate-700 text-sm hover:border-orange-200"
            >
              <span className={formData.feedItemId === 0 ? "text-slate-400 font-medium" : ""}>
                {formData.feedItemId === 0 ? "Search Feed..." : feedItems.find(i => i.Id === formData.feedItemId)?.Name}
              </span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-2.5 text-slate-300" size={14} />
                  <input
                    autoFocus
                    className="w-full pl-9 p-2 bg-slate-50 rounded-md outline-none text-xs font-bold focus:bg-orange-50"
                    placeholder="Find item..."
                    value={feedSearch}
                    onChange={(e) => setFeedSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filteredFeed.map(item => (
                    <div
                      key={item.Id}
                      onClick={() => {
                        setFormData(p => ({ ...p, feedItemId: item.Id }));
                        setIsDropdownOpen(false);
                      }}
                      className="p-2 hover:bg-orange-50 rounded-md cursor-pointer flex justify-between items-center group"
                    >
                      <span className="font-bold text-slate-700 text-xs">{item.Name}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase">₹{item.PurchasePrice}/KG</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Feed Consumed (KG)</label>
            <input
              type="number"
              name="feedConsumedKg"
              step="0.01"
              value={formData.feedConsumedKg}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-700 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">Mortality</label>
            <input
              type="number"
              name="mortalityCount"
              value={formData.mortalityCount}
              onChange={handleChange}
              className="w-full p-2.5 bg-red-50/30 border border-red-100 rounded-lg outline-none font-black text-red-600 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bird Weight (Gm)</label>
            <input
              type="number"
              name="averageBirdWeightGm"
              value={formData.averageBirdWeightGm}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-700 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mortality Reason</label>
            <input
              type="text"
              name="mortalityReason"
              value={formData.mortalityReason}
              onChange={handleChange}
              placeholder="e.g. Disease"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-700 text-sm"
            />
          </div>
        </div>

        {/* Eggs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50/30 p-4 rounded-xl border border-orange-100/50">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <Egg size={12} /> Good Eggs
              </label>
              <span className="text-[9px] font-black text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-100">
                {calculateTrays(formData.eggsCollected)}
              </span>
            </div>
            <input
              type="number"
              name="eggsCollected"
              value={formData.eggsCollected}
              onChange={handleChange}
              className="w-full p-2.5 bg-white border border-emerald-100 rounded-lg outline-none font-black text-emerald-700 text-sm focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest">
                <AlertCircle size={12} /> Damaged Eggs
              </label>
              <span className="text-[9px] font-black text-red-400 bg-white px-2 py-0.5 rounded border border-red-100">
                {calculateTrays(formData.damagedEggsCollected)}
              </span>
            </div>
            <input
              type="number"
              name="damagedEggsCollected"
              value={formData.damagedEggsCollected}
              onChange={handleChange}
              className="w-full p-2.5 bg-white border border-red-100 rounded-lg outline-none font-black text-red-600 text-sm focus:border-red-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes / Observations</label>
          <textarea 
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-sm resize-none focus:border-orange-200"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button"
            onClick={() => navigate('/daily-logs')}
            className="flex-1 bg-white border border-slate-200 text-slate-400 py-3 rounded-lg font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-[10px]"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-[2] bg-slate-900 hover:bg-black text-white py-3 rounded-lg font-black shadow-lg flex items-center justify-center gap-3 transition-all text-[10px] uppercase tracking-widest"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {loading ? "Updating..." : "Update Daily Log"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDailyLog;
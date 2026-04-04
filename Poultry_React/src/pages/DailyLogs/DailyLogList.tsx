import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Plus, 
  Loader2,
  FileText,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  IndianRupee,
  Calendar,
  Egg,
  TrendingDown,
  Scale
} from 'lucide-react';

// Backend PascalCase Payload nusar Interface
interface DailyLog {
  Id: number;
  Date: string;
  FlockId: number;
  MortalityCount: number;
  MortalityReason: string | null;
  FeedItemId: number;
  FeedConsumedKg: number;
  FeedCost: number;
  EggsCollected: number;
  DamagedEggsCollected: number;
  TotalTrays: number;
  AverageBirdWeightGm: number;
  DailyBirdCost: number;
  Notes: string | null;
  // Nested Objects matching payload
  Flock?: {
    Id: number;
    Breed: string;
    CurrentCount: number;
  };
  FeedItem?: {
    Id: number;
    Name: string;
    PurchasePrice: number;
  };
}

const DailyLogList: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/DailyLogs');
      // Backend direct array pathvte
      const data = Array.isArray(res.data) ? res.data : [];
      setLogs(data);
      setFilteredLogs(data);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError('Daily logs load karta aale nahit. Backend response check kara.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tumhala hi entry delete karaychi aahe ka?")) return;
    setDeleteLoading(id);
    try {
      await api.delete(`/DailyLogs/${id}`);
      setLogs(prev => prev.filter(l => l.Id !== id));
    } catch (err) {
      alert("Delete fail zale. Krupaya nantar prayatna kara.");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Search Filter logic based on PascalCase keys
  useEffect(() => {
    const results = logs.filter(log => {
      const breed = log.Flock?.Breed?.toLowerCase() || '';
      const notes = log.Notes?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      return breed.includes(search) || notes.includes(search);
    });
    setFilteredLogs(results);
  }, [searchTerm, logs]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-orange-600" size={40} />
        <p className="text-slate-500 font-bold">Data fetch hot aahe...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Daily Production Logs</h1>
          <p className="text-slate-500 text-sm font-medium">Tracking mortality, feed and egg production</p>
        </div>
        <button 
          onClick={() => navigate('/daily-logs/add')}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase"
        >
          <Plus size={18} /> Add Daily Record
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by breed name or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>
      </div>

      {error ? (
        <div className="p-10 bg-red-50 rounded-[2rem] border border-red-100 text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
          <p className="text-red-700 font-bold">{error}</p>
          <button onClick={fetchLogs} className="mt-4 text-orange-600 font-black underline">Retry Loading</button>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Flock</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mortality</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Feed Consumed</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Egg Production</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cost/Bird</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.Id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <p className="font-black text-slate-700 uppercase text-xs">
                              {log.Flock?.Breed || 'Unknown Flock'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              {new Date(log.Date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`inline-block px-3 py-1 rounded-full font-black text-[10px] uppercase ${log.MortalityCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {log.MortalityCount} Deaths
                          </span>
                          {log.MortalityReason && <p className="text-[9px] text-slate-400 mt-1 italic max-w-[100px] truncate">{log.MortalityReason}</p>}
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center">
                          <p className="font-black text-slate-700 text-sm">{log.FeedConsumedKg} KG</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{log.FeedItem?.Name || 'Feed'}</p>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="text-center">
                            <p className="font-black text-emerald-600 text-sm">{log.EggsCollected}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">Good</p>
                          </div>
                          <div className="w-px h-6 bg-slate-100"></div>
                          <div className="text-center">
                            <p className="font-black text-red-400 text-sm">{log.DamagedEggsCollected}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">Dmg</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex flex-col items-end">
                          <p className="font-black text-slate-700 text-sm flex items-center gap-0.5">
                            <IndianRupee size={12} className="text-slate-400" />
                            {log.DailyBirdCost.toFixed(2)}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Avg Wt: {log.AverageBirdWeightGm}g</p>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => navigate(`/daily-logs/edit/${log.Id}`)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            disabled={deleteLoading === log.Id}
                            onClick={() => handleDelete(log.Id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            {deleteLoading === log.Id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <FileText className="mx-auto text-slate-200 mb-4" size={56} />
                      <p className="text-slate-400 font-bold italic">No daily logs found for the selected criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLogList;
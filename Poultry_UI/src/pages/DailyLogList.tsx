import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Edit2, Trash2, Bird, Egg, Search, Calendar, Filter } from 'lucide-react';
import api from '../services/api';

interface DailyLog {
  Id: number;
  Date: string;
  FlockId: number;
  Flock?: { Breed: string };
  MortalityCount: number;
  FeedConsumedKg: number;
  EggsCollected: number;
  AverageBirdWeightGm: number;
}

const DailyLogList: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<DailyLog[]>([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle Filtering Logic locally
  useEffect(() => {
    let result = [...logs];

    // 1. Search Filter (Breed or ID)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.Flock?.Breed.toLowerCase().includes(lowerSearch) ||
        log.FlockId.toString().includes(lowerSearch)
      );
    }

    // 2. Date Range Filter with Normalization
    if (startDate || endDate) {
      result = result.filter(log => {
        // Create a date object from the log and strip time for accurate day-only comparison
        const logDate = new Date(log.Date);
        logDate.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (logDate < start) return false;
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
          if (logDate > end) return false;
        }

        return true;
      });
    }

    setFilteredLogs(result);
  }, [searchTerm, startDate, endDate, logs]);

  const fetchLogs = async () => {
    try {
      const res = await api.get<DailyLog[]>('/DailyLogs');
      setLogs(res.data || []);
      setFilteredLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this log entry?")) return;
    try {
      await api.delete(`/DailyLogs/${id}`);
      const updatedLogs = logs.filter(l => l.Id !== id);
      setLogs(updatedLogs);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Daily Production Logs</h1>
          <p className="text-gray-500 font-medium">History of flock health and egg production</p>
        </div>
        <button 
          onClick={() => navigate('/logs/new')}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" /> New Entry
        </button>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="Search by breed..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <Calendar className="text-gray-400 w-4 h-4 shrink-0" />
           <input 
            type="date"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400 w-4 h-4 shrink-0" />
          <input 
            type="date"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Flock</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-center">Mortality</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-center">Eggs</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredLogs.length > 0 ? filteredLogs.map((log) => (
              <tr key={log.Id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{formatDate(log.Date)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Bird className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-gray-700">{log.Flock?.Breed || `Flock ${log.FlockId}`}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`font-bold ${log.MortalityCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {log.MortalityCount}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1 font-bold text-emerald-600">
                    <Egg className="w-4 h-4" /> {log.EggsCollected}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/logs/edit/${log.Id}`)}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(log.Id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                  No logs found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyLogList;
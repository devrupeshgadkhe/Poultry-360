import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Syringe, 
  Plus, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  X,
  Save,
  IndianRupee,
  Search,
  Pencil,
  Trash2,
  FileCheck
} from 'lucide-react';

const FlockVaccinations: React.FC = () => {
  const { flockId } = useParams();
  const navigate = useNavigate();
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal & Edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    vaccineName: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    administeredBy: '',
    cost: '',
    notes: '',
    status: 'Scheduled'
  });

  const fetchVaccinations = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/Vaccinations/flock/${flockId}`);
      const data = Array.isArray(response.data) ? response.data : [];
      setVaccinations(data);
      setFilteredData(data);
    } catch (err) {
      setError("व्हॅक्सिनेशन डेटा लोड करण्यात अडचण आली आहे.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinations();
  }, [flockId]);

  // Client-side Filtering Logic
  useEffect(() => {
    let result = [...vaccinations];
    if (searchTerm) {
      result = result.filter(v => 
        (v.vaccineName || v.VaccineName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'All') {
      result = result.filter(v => (v.status || v.Status) === statusFilter);
    }
    setFilteredData(result);
  }, [searchTerm, statusFilter, vaccinations]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      vaccineName: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      administeredBy: '',
      cost: '',
      notes: '',
      status: 'Scheduled'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingId(item.id || item.Id);
    setFormData({
      vaccineName: item.vaccineName || item.VaccineName || '',
      scheduledDate: (item.scheduledDate || item.ScheduledDate || '').split('T')[0],
      administeredBy: item.administeredBy || item.AdministeredBy || '',
      cost: (item.cost || item.Cost || 0).toString(),
      notes: item.notes || item.Notes || '',
      status: item.status || item.Status || 'Scheduled'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        Id: editingId || 0,
        FlockId: parseInt(flockId!),
        VaccineName: formData.vaccineName,
        ScheduledDate: formData.scheduledDate,
        AdministeredDate: (formData.status === 'Administered' || formData.status === 'Completed') ? new Date().toISOString() : null,
        AdministeredBy: formData.administeredBy,
        Notes: formData.notes,
        Status: formData.status,
        Cost: parseFloat(formData.cost) || 0
      };

      if (editingId) {
        await api.put(`/Vaccinations/${editingId}`, payload);
      } else {
        await api.post('/Vaccinations', payload);
      }
      
      setIsModalOpen(false);
      fetchVaccinations();
    } catch (err) {
      alert("माहिती सेव्ह करताना त्रुटी आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("तुम्ही नक्की हे व्हॅक्सिनेशन रेकॉर्ड डिलीट करू इच्छिता?")) return;
    try {
      await api.delete(`/Vaccinations/${id}`);
      fetchVaccinations();
    } catch (err) {
      alert("डिलीट करण्यात अडचण आली.");
    }
  };

  // Status Badge helper for variety
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Administered': return 'bg-green-100 text-green-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Administered': return <CheckCircle2 size={12} />;
      case 'Completed': return <FileCheck size={12} />;
      default: return <Clock size={12} />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/flocks')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Syringe className="text-emerald-600" /> Vaccination Log
            </h1>
            <p className="text-sm text-gray-500">Managing Flock #{flockId}</p>
          </div>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 font-bold w-full md:w-auto justify-center"
        >
          <Plus size={20} /> Add Vaccination
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by vaccine name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="border border-gray-200 rounded-xl px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Administered">Administered</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
            <p className="text-gray-500">Fetching records...</p>
          </div>
        ) : error ? (
          <div className="p-20 text-center text-red-500">
            <AlertCircle className="mx-auto mb-2" size={40} />
            <p>{error}</p>
            <button onClick={fetchVaccinations} className="mt-4 underline">Try Again</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4 border-b">Vaccine Details</th>
                  <th className="p-4 border-b">Scheduled Date</th>
                  <th className="p-4 border-b">Administered By</th>
                  <th className="p-4 border-b text-center">Status</th>
                  <th className="p-4 border-b text-right">Cost</th>
                  <th className="p-4 border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.length > 0 ? (
                  filteredData.map((v) => {
                    const id = v.id || v.Id;
                    const status = v.status || v.Status;
                    return (
                      <tr key={id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-gray-900">{v.vaccineName || v.VaccineName}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{v.notes || v.Notes || '-'}</div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(v.scheduledDate || v.ScheduledDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-4 text-sm text-gray-600 flex items-center gap-2 h-16">
                          <User size={14} className="text-gray-400" /> {v.administeredBy || v.AdministeredBy || '-'}
                        </td>
                        <td className="p-4">
                          <span className={`mx-auto px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${getStatusStyle(status)}`}>
                            {getStatusIcon(status)}
                            {status}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-gray-700">₹{(v.cost || v.Cost || 0).toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={() => handleOpenEditModal(v)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400 italic">No matching records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-emerald-600 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <Syringe size={24} />
                <h2 className="text-xl font-bold">{editingId ? "Update Record" : "New Vaccination"}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Vaccine Name</label>
                <input 
                  type="text" required placeholder="e.g. Lasota, Gumboro"
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.vaccineName}
                  onChange={(e) => setFormData({...formData, vaccineName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Scheduled Date</label>
                  <input 
                    type="date" required
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Cost (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Administered By</label>
                <input 
                  type="text" placeholder="Who gave the vaccine?"
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.administeredBy}
                  onChange={(e) => setFormData({...formData, administeredBy: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Current Status</label>
                <div className="flex flex-wrap gap-4 mt-1">
                  {['Scheduled', 'Administered', 'Completed'].map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" name="status" value={s}
                        checked={formData.status === s}
                        onChange={() => setFormData({...formData, status: s})}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <span className="text-sm font-medium text-gray-600">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Notes</label>
                <textarea 
                  rows={2} placeholder="Optional notes..."
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-100"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {editingId ? "Update" : "Save"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlockVaccinations;
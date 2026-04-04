import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bird, Syringe, Skull, Edit2, Trash2, X, Check, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { Flock } from '../types';
import api from '../services/api';

interface VaccinationRecord {
  Id?: number;
  FlockId: number;
  VaccineName: string;
  ScheduledDate: string;
  AdministeredDate?: string;
  AdministeredBy: string;
  Notes: string;
  Status: string;
  Cost: number; // Added for financial tracking
}

const Flocks: React.FC = () => {
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMortalityModalOpen, setIsMortalityModalOpen] = useState(false);
  const [isVaccinationModalOpen, setIsVaccinationModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingVaccineId, setEditingVaccineId] = useState<number | null>(null);
  const [selectedFlock, setSelectedFlock] = useState<Flock | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ breed: '', initialCount: 0, arrivalDate: '', status: 'Active' });
  const [mortalityData, setMortalityData] = useState({ count: 0, reason: '' });
  
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [vaccineData, setVaccineData] = useState<VaccinationRecord>({
    FlockId: 0,
    VaccineName: '',
    ScheduledDate: new Date().toISOString().split('T')[0],
    AdministeredDate: new Date().toISOString().split('T')[0],
    AdministeredBy: '',
    Notes: '',
    Status: 'Completed',
    Cost: 0
  });

  const navigate = useNavigate();

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return {}; }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => { fetchFlocks(); }, []);

  const fetchFlocks = async () => {
    try {
      setError(null);
      const res = await api.get('/Flocks', getAuthConfig());
      const mappedData = Array.isArray(res.data) ? res.data.map((f: any) => ({
        id: f.Id, breed: f.Breed, initialCount: f.InitialCount,
        currentCount: f.CurrentCount, arrivalDate: f.ArrivalDate, status: f.Status
      })) : [];
      setFlocks(mappedData);
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/login');
      setError("Could not load flocks.");
    }
  };

  const fetchVaccinations = async (flockId: number) => {
    try {
      const res = await api.get(`/Vaccinations/flock/${flockId}`, getAuthConfig());
      setVaccinations(res.data || []);
    } catch (err) {
      console.error("Failed to load vaccinations", err);
    }
  };

  const saveFlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        Breed: formData.breed,
        InitialCount: Number(formData.initialCount),
        ArrivalDate: formData.arrivalDate,
        Status: formData.status,
        CurrentCount: editingId ? undefined : Number(formData.initialCount)
      };
      if (editingId) {
        await api.put(`/Flocks/${editingId}`, { Id: editingId, ...payload }, getAuthConfig());
      } else {
        await api.post('/Flocks', payload, getAuthConfig());
      }
      setIsModalOpen(false);
      fetchFlocks();
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const saveMortality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlock) return;
    try {
      const updatedCount = selectedFlock.currentCount - mortalityData.count;
      await api.put(`/Flocks/${selectedFlock.id}`, { 
        Id: selectedFlock.id, Breed: selectedFlock.breed, InitialCount: selectedFlock.initialCount,
        ArrivalDate: selectedFlock.arrivalDate, Status: selectedFlock.status, CurrentCount: updatedCount 
      }, getAuthConfig());
      setIsMortalityModalOpen(false);
      fetchFlocks();
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const deleteFlock = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this flock?')) return;
    try {
      await api.delete(`/Flocks/${id}`, getAuthConfig());
      fetchFlocks();
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const openModal = () => {
    setEditingId(null);
    setFormData({ breed: '', initialCount: 0, arrivalDate: new Date().toISOString().split('T')[0], status: 'Active' });
    setIsModalOpen(true);
  };

  const editFlock = (flock: Flock) => {
    setEditingId(flock.id);
    setFormData({ breed: flock.breed, initialCount: flock.initialCount, arrivalDate: flock.arrivalDate.split('T')[0], status: flock.status });
    setIsModalOpen(true);
  };

  const openMortalityModal = (flock: Flock) => {
    setSelectedFlock(flock);
    setMortalityData({ count: 0, reason: '' });
    setIsMortalityModalOpen(true);
  };

  const openVaccinationModal = (flock: Flock) => {
    setSelectedFlock(flock);
    resetVaccineForm(flock.id);
    fetchVaccinations(flock.id);
    setIsVaccinationModalOpen(true);
  };

  const resetVaccineForm = (flockId: number) => {
    setEditingVaccineId(null);
    setVaccineData({ 
        FlockId: flockId, VaccineName: '', ScheduledDate: new Date().toISOString().split('T')[0],
        AdministeredDate: new Date().toISOString().split('T')[0], AdministeredBy: '', Notes: '', Status: 'Completed',
        Cost: 0
    });
  };

  const editVaccination = (v: VaccinationRecord) => {
    setEditingVaccineId(v.Id || null);
    setVaccineData({
      ...v,
      ScheduledDate: v.ScheduledDate.split('T')[0],
      AdministeredDate: v.AdministeredDate ? v.AdministeredDate.split('T')[0] : '',
      Cost: v.Cost || 0
    });
  };

  const deleteVaccination = async (vId: number) => {
    if (!window.confirm('Delete this vaccination record?')) return;
    try {
      await api.delete(`/Vaccinations/${vId}`, getAuthConfig());
      fetchVaccinations(selectedFlock!.id);
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  const saveVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...vaccineData, Cost: Number(vaccineData.Cost) };
      if (editingVaccineId) {
        await api.put(`/Vaccinations/${editingVaccineId}`, { ...payload, Id: editingVaccineId }, getAuthConfig());
      } else {
        await api.post('/Vaccinations', payload, getAuthConfig());
      }
      fetchVaccinations(selectedFlock!.id);
      resetVaccineForm(selectedFlock!.id);
    } catch (err) {
      alert("Failed to save vaccination record.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Flock Management</h1>
          <p className="text-gray-500">Track populations and health logs.</p>
        </div>
        <button onClick={openModal} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
          <Plus className="w-5 h-5" /> Add New Flock
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5 font-bold">Breed Details</th>
              <th className="px-8 py-5 font-bold">Population</th>
              <th className="px-8 py-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {flocks.map((flock) => (
              <tr key={flock.id} className="hover:bg-gray-50/80 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Bird className="w-6 h-6" /></div>
                    <div>
                      <p className="font-bold text-gray-900">{flock.breed}</p>
                      <p className="text-xs text-gray-400 font-medium">BATCH #{flock.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="font-bold text-gray-900 text-lg">{flock.currentCount}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openVaccinationModal(flock)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl"><Syringe className="w-5 h-5" /></button>
                    <button onClick={() => openMortalityModal(flock)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-xl"><Skull className="w-5 h-5" /></button>
                    <button onClick={() => editFlock(flock)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl"><Edit2 className="w-5 h-5" /></button>
                    <button onClick={() => deleteFlock(flock.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isVaccinationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Health & Vaccinations</h3>
                <p className="text-sm text-blue-600 font-bold">Flock: {selectedFlock?.breed}</p>
              </div>
              <button onClick={() => setIsVaccinationModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-xl shadow-sm"><X /></button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Vaccination Logs</h4>
                <div className="grid gap-3">
                  {vaccinations.map((v) => (
                    <div key={v.Id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 group/item">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${v.Status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {v.Status === 'Completed' ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{v.VaccineName}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                              <span>{new Date(v.AdministeredDate || '').toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{v.AdministeredBy}</span>
                              <span>•</span>
                              <span className="text-emerald-600 font-black">₹{v.Cost?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => editVaccination(v)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => deleteVaccination(v.Id!)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      {v.Notes && <p className="text-xs text-gray-500 bg-white p-2 rounded-lg border border-gray-100 italic">"{v.Notes}"</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest text-blue-600">
                        {editingVaccineId ? 'Edit Entry' : 'Register New Vaccination'}
                    </h4>
                    {editingVaccineId && (
                        <button onClick={() => resetVaccineForm(selectedFlock!.id)} className="text-[10px] font-bold text-red-500 uppercase">Cancel Edit</button>
                    )}
                </div>
                <form onSubmit={saveVaccination} className="grid grid-cols-2 gap-4 bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Vaccine Name</label>
                    <input value={vaccineData.VaccineName} onChange={(e) => setVaccineData({ ...vaccineData, VaccineName: e.target.value })} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Admin Date</label>
                    <input type="date" value={vaccineData.AdministeredDate} onChange={(e) => setVaccineData({ ...vaccineData, AdministeredDate: e.target.value })} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Veterinarian</label>
                    <input value={vaccineData.AdministeredBy} onChange={(e) => setVaccineData({ ...vaccineData, AdministeredBy: e.target.value })} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Name"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Cost (₹)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="number" step="0.01" value={vaccineData.Cost} onChange={(e) => setVaccineData({ ...vaccineData, Cost: parseFloat(e.target.value) })} required className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"/>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Status</label>
                    <select value={vaccineData.Status} onChange={(e) => setVaccineData({ ...vaccineData, Status: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs">
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Missed">Missed</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Observations</label>
                    <textarea value={vaccineData.Notes} onChange={(e) => setVaccineData({ ...vaccineData, Notes: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Any reactions or notes..."/>
                  </div>
                  <button type="submit" className={`col-span-2 py-4 text-white font-bold rounded-2xl mt-2 shadow-lg transition-all ${editingVaccineId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}>
                    {editingVaccineId ? 'Update Record' : 'Submit Record'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Re-including the Mortality Modal to ensure zero truncation */}
      {isMortalityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-orange-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Report Mortality</h3>
                <p className="text-sm text-orange-600 font-bold">Flock: {selectedFlock?.breed}</p>
              </div>
              <button onClick={() => setIsMortalityModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-xl shadow-sm"><X /></button>
            </div>
            <form onSubmit={saveMortality} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Dead Bird Count</label>
                <div className="relative">
                  <Skull className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="number" value={mortalityData.count} onChange={(e) => setMortalityData({ ...mortalityData, count: Number(e.target.value) })} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 text-lg font-bold" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Reason / Notes</label>
                <textarea value={mortalityData.reason} onChange={(e) => setMortalityData({ ...mortalityData, reason: e.target.value })} className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]" placeholder="Disease, heat stress, etc..." />
              </div>
              <button type="submit" className="w-full py-5 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all">Update Current Count</button>
            </form>
          </div>
        </div>
      )}

      {/* Re-including the Add/Edit Flock Modal to ensure zero truncation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-emerald-50/50">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{editingId ? 'Edit Flock' : 'Register Flock'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-xl shadow-sm"><X /></button>
            </div>
            <form onSubmit={saveFlock} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Breed</label>
                <input value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Initial Count</label>
                <input type="number" value={formData.initialCount} onChange={(e) => setFormData({ ...formData, initialCount: Number(e.target.value) })} className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" required disabled={!!editingId} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Arrival Date</label>
                <input type="date" value={formData.arrivalDate} onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })} className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" required />
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">{editingId ? 'Save Changes' : 'Confirm Registration'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flocks;
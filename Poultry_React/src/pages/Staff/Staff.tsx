import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Save, X, ArrowLeft, Loader2, UserSquare2, Phone, MapPin, BadgeIndianRupee } from 'lucide-react';
import api from '../../services/api';

// --- Interface Definition ---
export interface Staff {
  id: number;
  name: string;
  designation: string;
  contactNumber: string;
  address: string;
  monthlySalary: number;
  dailyWages: number;
  joiningDate: string;
  isActive: boolean;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
}

const StaffPage: React.FC = () => {
  // States
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');

  const [formData, setFormData] = useState<Staff>({
    id: 0, name: '', designation: '', contactNumber: '', address: '',
    monthlySalary: 0, dailyWages: 0, joiningDate: new Date().toISOString().split('T')[0],
    isActive: true, bankName: '', accountNumber: '', ifscCode: ''
  });

  // API Call - Fetch All Staff
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await api.get('/Staff');
      setStaffList(response.data || []);
    } catch (error) {
      console.error("Staff fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  // Handle Save (Create/Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Backend expects PascalCase for JSON if configured, but Axios handles the object we send.
      // We ensure the payload matches the backend expectations.
      const payload = {
        ...formData,
        IFSCCode: formData.ifscCode // Ensuring the specific mapping you requested
      };

      if (formData.id > 0) {
        await api.put(`/Staff/${formData.id}`, payload);
      } else {
        await api.post('/Staff', payload);
      }
      await fetchStaff();
      setView('list');
    } catch (error: any) {
      alert(error.response?.data?.message || "डेटा सेव्ह करताना एरर आला!");
    }
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("हा स्टाफ डिलीट करायचा का?")) return;
    try {
      await api.delete(`/Staff/${id}`);
      setStaffList(prev => prev.filter(s => (s.id || (s as any).Id) !== id));
    } catch (error) {
      alert("डिलीट करताना एरर आला.");
    }
  };

  // Helper: Open Form for Edit or Add
  const openForm = (staff?: any) => {
    if (staff) {
      setFormData({
        id: staff.id ?? staff.Id,
        name: staff.name ?? staff.Name ?? '',
        designation: staff.designation ?? staff.Designation ?? '',
        contactNumber: staff.contactNumber ?? staff.ContactNumber ?? '',
        address: staff.address ?? staff.Address ?? '',
        monthlySalary: staff.monthlySalary ?? staff.MonthlySalary ?? 0,
        dailyWages: staff.dailyWages ?? staff.DailyWages ?? 0,
        joiningDate: (staff.joiningDate ?? staff.JoiningDate ?? '').split('T')[0] || new Date().toISOString().split('T')[0],
        isActive: staff.isActive !== undefined ? staff.isActive : (staff.IsActive ?? true),
        bankName: staff.bankName ?? staff.BankName ?? '',
        accountNumber: staff.accountNumber ?? staff.AccountNumber ?? '',
        ifscCode: staff.ifscCode ?? staff.IFSCCode ?? staff.IfscCode ?? ''
      });
    } else {
      setFormData({
        id: 0, name: '', designation: '', contactNumber: '', address: '',
        monthlySalary: 0, dailyWages: 0, joiningDate: new Date().toISOString().split('T')[0],
        isActive: true, bankName: '', accountNumber: '', ifscCode: ''
      });
    }
    setView('form');
  };

  // Filter Logic
  const filteredStaff = staffList.filter(s => {
    const name = (s.name || (s as any).Name || "").toLowerCase();
    const role = (s.designation || (s as any).Designation || "").toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || role.includes(searchTerm.toLowerCase());
  });

  if (loading && staffList.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-orange-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {view === 'list' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Staff Directory</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Poultry 360 Human Resources</p>
            </div>
            <button 
              onClick={() => openForm()}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              <Plus size={18} /> Add Staff Member
            </button>
          </div>

          <div className="p-4 bg-slate-50/50 border-b border-slate-100">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search staff by name..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest">
                <tr>
                  <th className="px-8 py-4">Employee</th>
                  <th className="px-8 py-4">Contact</th>
                  <th className="px-8 py-4">Salary Plan</th>
                  <th className="px-8 py-4 text-center">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((s: any) => (
                  <tr key={s.id || s.Id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black text-sm">
                          {(s.name || s.Name || "?").charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{s.name || s.Name}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{s.designation || s.Designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">{s.contactNumber || s.ContactNumber || '--'}</td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-slate-700">
                        ₹{(s.monthlySalary || s.MonthlySalary) > 0 
                          ? `${(s.monthlySalary || s.MonthlySalary).toLocaleString()}` 
                          : `${s.dailyWages || s.DailyWages}`}
                        <span className="text-[10px] text-slate-400 ml-1 uppercase">
                          / {(s.monthlySalary || s.MonthlySalary) > 0 ? 'Month' : 'Day'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        (s.isActive || s.IsActive) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {(s.isActive || s.IsActive) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openForm(s)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(s.id || s.Id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form View */}
      {view === 'form' && (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">{formData.id > 0 ? 'Edit Staff' : 'Register New Staff'}</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Employee Onboarding</p>
            </div>
            <button onClick={() => setView('list')} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={24} /></button>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Personal */}
              <div className="space-y-5">
                <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest border-b border-orange-100 pb-2">Personal Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Full Name *</label>
                    <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold text-slate-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Designation *</label>
                    <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold text-slate-700" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Contact Number</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold text-slate-700" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Right Column - Payroll */}
              <div className="space-y-5">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">Payroll & Joining</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Monthly (Fixed)</label>
                      <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-black text-slate-700" value={formData.monthlySalary} onChange={e => setFormData({...formData, monthlySalary: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Daily Wages</label>
                      <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-black text-slate-700" value={formData.dailyWages} onChange={e => setFormData({...formData, dailyWages: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Joining Date</label>
                    <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-slate-700" value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Field - Updated */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Residential Address</label>
              <textarea 
                rows={2}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none font-medium text-slate-700" 
                placeholder="Enter complete address..."
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
              />
            </div>

            {/* Bank Details Section */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bank Payout Info (Optional)</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Bank Name</label>
                    <input placeholder="Ex: SBI" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500" value={formData.bankName || ''} onChange={e => setFormData({...formData, bankName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">A/C Number</label>
                    <input placeholder="1234567890" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500" value={formData.accountNumber || ''} onChange={e => setFormData({...formData, accountNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">IFSC Code</label>
                    <input placeholder="SBIN0001234" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 uppercase" value={formData.ifscCode || ''} onChange={e => setFormData({...formData, ifscCode: e.target.value})} />
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <button type="button" onClick={() => setView('list')} className="px-6 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-all">Discard</button>
              <button type="submit" className="px-10 py-3 bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95 flex items-center gap-2">
                <Save size={18} /> Save Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { 
  Save, Loader2, BadgeIndianRupee, Calendar, 
  ArrowUpCircle, ArrowDownCircle, 
  User, Truck, Bird, Search, Edit2, Trash2, 
  List as ListIcon, FileText, AlertCircle, X
} from 'lucide-react';
import api from '../../services/api';

// --- Interfaces ---
export interface Category {
  Id: number;
  Name: string;
  IsIncome: boolean;
  IsActive: boolean;
}

export interface Transaction {
  Id: number;
  TransactionDate: string;
  Amount: number;
  CategoryId: number;
  Category?: { Name: string; IsIncome: boolean };
  Mode: number;
  Description: string;
  StaffId: number | null;
  Staff?: { Name: string };
  SupplierId: number | null;
  Supplier?: { Name: string };
  BatchId: number | null;
  Batch?: { Id: number; Breed: string };
}

interface SelectOption {
  value: number;
  label: string;
}

const FinancialLedger: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'entry' | 'list'>('entry');
  const [loading, setLoading] = useState(false);
  const [initialFetchLoading, setInitialFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  // Data Lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [staffOptions, setStaffOptions] = useState<SelectOption[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<SelectOption[]>([]);
  const [batchOptions, setBatchOptions] = useState<SelectOption[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    TransactionDate: new Date().toISOString().split('T')[0],
    Amount: 0,
    CategoryId: 0,
    Mode: 1,
    Description: '',
    StaffId: null as number | null,
    SupplierId: null as number | null,
    BatchId: null as number | null,
    IsIncome: false 
  });

  // Control States for Fields
  const [isStaffEnabled, setIsStaffEnabled] = useState(false);
  const [isSupplierEnabled, setIsSupplierEnabled] = useState(false);

  // Logic to Enable/Disable fields based on Category
  useEffect(() => {
    const selectedCat = categories.find(c => c.Id === formData.CategoryId);
    const catName = selectedCat?.Name || "";

    const staffMatch = ["Salary", "Advance", "Staff", "Labor"].some(kw => catName.includes(kw));
    const supplierMatch = ["Feed", "Medicine", "Chicks", "Construction", "Repairs", "Equipment", "Purchase", "Maintenance"].some(kw => catName.includes(kw));

    setIsStaffEnabled(staffMatch);
    setIsSupplierEnabled(supplierMatch);

    // Update Form Data based on rules
    if (!staffMatch && !editMode) setFormData(prev => ({ ...prev, StaffId: null }));
    if (!supplierMatch && !editMode) setFormData(prev => ({ ...prev, SupplierId: null }));
    
  }, [formData.CategoryId, categories, editMode]);

  // List States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const customSelectStyles = (isDisabled: boolean = false) => ({
    control: (base: any) => ({
      ...base,
      padding: '5px',
      borderRadius: '1rem',
      border: '2px solid #e2e8f0',
      backgroundColor: isDisabled ? '#f1f5f9' : '#ffffff',
      opacity: isDisabled ? 0.6 : 1,
      fontWeight: '600',
      boxShadow: 'none',
      '&:hover': { borderColor: isDisabled ? '#e2e8f0' : '#f97316' }
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#f97316' : state.isFocused ? '#fff7ed' : 'white',
      color: state.isSelected ? 'white' : '#475569',
      fontWeight: '600',
    })
  });

  const fetchData = async () => {
    try {
      setInitialFetchLoading(true);
      const [catRes, staffRes, suppRes, batchRes, transRes] = await Promise.all([
        api.get('/TransactionCategories'),
        api.get('/Staff'),
        api.get('/Suppliers'),
        api.get('/Flocks'),
        api.get('/FinancialTransactions')
      ]);

      setCategories(catRes.data || []);
      setStaffOptions(staffRes.data.map((s: any) => ({ value: s.Id, label: s.Name })));
      setSupplierOptions(suppRes.data.map((s: any) => ({ value: s.Id, label: s.Name })));
      setBatchOptions(batchRes.data.map((b: any) => ({ value: b.Id, label: `Batch #${b.Id} - ${b.Breed}` })));
      setTransactions(transRes.data || []);
    } catch (err) {
      setError("डेटा लोड करताना त्रुटी आली.");
    } finally {
      setInitialFetchLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setFormData({
      TransactionDate: new Date().toISOString().split('T')[0],
      Amount: 0,
      CategoryId: 0,
      Mode: 1,
      Description: '',
      StaffId: null,
      SupplierId: null,
      BatchId: null,
      IsIncome: false 
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.CategoryId === 0 || formData.Amount <= 0) {
      return alert("कृपया कॅटेगरी आणि रक्कम अचूक भरा!");
    }

    setLoading(true);
    try {
      const payload = { 
        ...formData, 
        TransactionDate: new Date(formData.TransactionDate).toISOString()
      };

      if (editMode && currentId) {
        // Updated payload include ID for PUT request
        await api.put(`/FinancialTransactions/${currentId}`, { ...payload, Id: currentId });
        alert("व्यवहार यशस्वीरीत्या अपडेट केला!");
      } else {
        await api.post('/FinancialTransactions', payload);
        alert("व्यवहार यशस्वीरीत्या जतन केला!");
      }
      
      resetForm();
      await fetchData();
      setActiveTab('list');
    } catch (err: any) {
      alert(err.response?.data?.Message || "व्यवहार जतन करताना त्रुटी आली.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t: Transaction) => {
    setFormData({
      TransactionDate: t.TransactionDate.split('T')[0],
      Amount: t.Amount,
      CategoryId: t.CategoryId,
      Mode: t.Mode,
      Description: t.Description || '',
      StaffId: t.StaffId,
      SupplierId: t.SupplierId,
      BatchId: t.BatchId,
      IsIncome: t.Category?.IsIncome ?? false
    });
    setEditMode(true);
    setCurrentId(t.Id);
    setActiveTab('entry');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("तुम्हाला हा व्यवहार कायमचा हटवायचा आहे का?")) return;
    try {
      await api.delete(`/FinancialTransactions/${id}`);
      setTransactions(prev => prev.filter(t => t.Id !== id));
      alert("व्यवहार डिलीट केला.");
    } catch (err) {
      alert("डिलीट करताना त्रुटी आली.");
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      t.Description?.toLowerCase().includes(searchStr) || 
      t.Category?.Name.toLowerCase().includes(searchStr) ||
      t.Staff?.Name.toLowerCase().includes(searchStr) ||
      t.Supplier?.Name.toLowerCase().includes(searchStr);

    const isIncomeTransaction = t.Category?.IsIncome === true;
    if (filterType === 'income') return matchesSearch && isIncomeTransaction;
    if (filterType === 'expense') return matchesSearch && !isIncomeTransaction;
    return matchesSearch;
  });

  if (initialFetchLoading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Loader2 className="animate-spin text-orange-600" size={48} />
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Records...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="text-slate-500 font-medium">फार्मचा दैनंदिन हिशोब</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={() => { setActiveTab('entry'); if(!editMode) resetForm(); }}
            className={`px-6 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'entry' ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
            <FileText size={16} className={activeTab === 'entry' ? 'text-orange-500' : ''} />
            {editMode ? 'Edit Entry' : 'New Entry'}
          </button>
          <button onClick={() => setActiveTab('list')}
            className={`px-6 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'list' ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
            <ListIcon size={16} className={activeTab === 'list' ? 'text-orange-500' : ''} />
            History
          </button>
        </div>
      </div>

      {activeTab === 'entry' ? (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Form Header */}
          <div className="p-8 bg-slate-900 text-white flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 p-3 rounded-2xl shadow-lg">
                <BadgeIndianRupee className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">{editMode ? 'Update Record' : 'Create Entry'}</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Transaction Details</p>
              </div>
            </div>
            
            <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700 w-full lg:w-auto">
              <button type="button" onClick={() => setFormData({ ...formData, IsIncome: false, CategoryId: 0 })}
                className={`flex-1 lg:flex-none px-10 py-3 rounded-lg font-bold text-[11px] uppercase transition-all ${!formData.IsIncome ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500'}`}>
                Expense (खर्च)
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, IsIncome: true, CategoryId: 0 })}
                className={`flex-1 lg:flex-none px-10 py-3 rounded-lg font-bold text-[11px] uppercase transition-all ${formData.IsIncome ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>
                Income (आवक)
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Column 1: Primary Info */}
              <div className="space-y-8">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" /> Primary Info
                </label>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="date" className="w-full pl-12 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-orange-500"
                        value={formData.TransactionDate} onChange={e => setFormData({...formData, TransactionDate: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Category</label>
                    <Select 
                      styles={customSelectStyles()} 
                      options={categories.filter(c => c.IsIncome === formData.IsIncome).map(c => ({ value: c.Id, label: c.Name }))}
                      value={formData.CategoryId ? { value: formData.CategoryId, label: categories.find(c => c.Id === formData.CategoryId)?.Name || '' } : null}
                      onChange={(opt: any) => setFormData({...formData, CategoryId: opt?.value || 0})}
                      placeholder="Select Category..." 
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-black uppercase mb-2 ml-1 ${formData.IsIncome ? 'text-emerald-600' : 'text-rose-600'}`}>Amount (₹)</label>
                    <input type="number" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-2xl focus:border-orange-500"
                      placeholder="0.00" value={formData.Amount || ''} onChange={e => setFormData({...formData, Amount: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              {/* Column 2: Linking */}
              <div className="space-y-8 bg-slate-50/50 p-8 rounded-3xl border border-slate-100 shadow-inner">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" /> Linking
                </label>
                <div className="space-y-6">
                  <div className={!isStaffEnabled ? "opacity-30 pointer-events-none" : ""}>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2"><User size={14}/> Staff</label>
                    <Select isClearable isDisabled={!isStaffEnabled} styles={customSelectStyles(!isStaffEnabled)} options={staffOptions}
                      value={staffOptions.find(o => o.value === formData.StaffId) || null}
                      onChange={(opt: any) => setFormData({...formData, StaffId: opt?.value || null})} />
                  </div>
                  <div className={!isSupplierEnabled ? "opacity-30 pointer-events-none" : ""}>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2"><Truck size={14}/> Supplier</label>
                    <Select isClearable isDisabled={!isSupplierEnabled} styles={customSelectStyles(!isSupplierEnabled)} options={supplierOptions}
                      value={supplierOptions.find(o => o.value === formData.SupplierId) || null}
                      onChange={(opt: any) => setFormData({...formData, SupplierId: opt?.value || null})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2"><Bird size={14}/> Batch</label>
                    <Select isClearable styles={customSelectStyles(false)} options={batchOptions}
                      value={batchOptions.find(o => o.value === formData.BatchId) || null}
                      onChange={(opt: any) => setFormData({...formData, BatchId: opt?.value || null})} />
                  </div>
                </div>
              </div>

              {/* Column 3: Mode & Notes */}
              <div className="space-y-8">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" /> Mode & Notes
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[ { id: 1, label: 'Cash' }, { id: 2, label: 'UPI' }, { id: 3, label: 'Bank' }, { id: 4, label: 'Cheque' } ].map(m => (
                    <button key={m.id} type="button" onClick={() => setFormData({...formData, Mode: m.id})}
                      className={`py-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${formData.Mode === m.id ? 'border-slate-900 bg-slate-900 text-white shadow-lg scale-105' : 'border-slate-100 bg-white text-slate-400'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Notes</label>
                  <textarea rows={4} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 outline-none font-semibold text-sm"
                    placeholder="Details here..." value={formData.Description} onChange={e => setFormData({...formData, Description: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Form Footer Buttons */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <AlertCircle size={16} />
                  <p className="font-bold text-[9px] uppercase tracking-wider italic">Make sure all entries match your physical ledger.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button type="button" onClick={resetForm} className="px-8 py-4 text-slate-400 font-black text-[11px] uppercase hover:text-rose-500 transition-colors">Discard</button>
                  <button type="submit" disabled={loading} className={`px-12 py-4 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 ${formData.IsIncome ? 'bg-emerald-600' : 'bg-rose-600'} hover:opacity-90 active:scale-95`}>
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {editMode ? 'Update Record' : 'Save Record'}
                  </button>
                </div>
            </div>
          </form>
        </div>
      ) : (
        /* --- LIST VIEW --- */
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
             <div className="relative w-full md:w-[400px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-sm shadow-inner"
                  placeholder="Search by category, description or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
             <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                {[ { id: 'all', label: 'All' }, { id: 'income', label: 'Incomes' }, { id: 'expense', label: 'Expenses' } ].map((t) => (
                  <button key={t.id} onClick={() => setFilterType(t.id as any)}
                    className={`px-6 py-2.5 rounded-lg font-black text-[10px] uppercase transition-all ${filterType === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    {t.label}
                  </button>
                ))}
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked To</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTransactions.map((t) => {
                    const isInc = t.Category?.IsIncome === true;
                    return (
                      <tr key={t.Id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${isInc ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {isInc ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 text-sm">{t.Category?.Name || 'Uncategorized'}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(t.TransactionDate).toLocaleDateString('en-IN')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-sm font-semibold text-slate-500 truncate max-w-[200px]">{t.Description || '-'}</td>
                        <td className="p-6">
                          <div className="flex flex-wrap gap-1.5">
                            {t.Staff && <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase flex items-center gap-1"><User size={10}/> {t.Staff.Name}</span>}
                            {t.Supplier && <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-[9px] font-black uppercase flex items-center gap-1"><Truck size={10}/> {t.Supplier.Name}</span>}
                            {t.BatchId && <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase flex items-center gap-1"><Bird size={10}/> #{t.BatchId}</span>}
                          </div>
                        </td>
                        <td className="p-6 text-right font-black text-lg">
                          <span className={isInc ? 'text-emerald-600' : 'text-slate-900'}>₹{t.Amount.toLocaleString('en-IN')}</span>
                        </td>
                        <td className="p-6 text-center">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => handleEdit(t)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(t.Id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredTransactions.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center">
                  <X className="text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No transactions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialLedger;
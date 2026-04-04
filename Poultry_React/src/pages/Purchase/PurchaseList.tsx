import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Calendar, 
  Loader2,
  ShoppingCart,
  RefreshCcw
} from 'lucide-react';

// Interfaces matching your .NET PascalCase Response
interface Supplier {
  Id: number;
  Name: string;
  Phone?: string;
}

interface PurchaseItem {
  PurchaseItemId: number;
  Quantity: number;
  PurchaseRate: number;
  Item: {
    Name: string;
    Unit: string;
  };
}

interface Purchase {
  PurchaseId: number;
  PurchaseNumber: string;
  SupplierInvoiceNumber: string;
  PurchaseDate: string;
  TotalAmount: number;
  PaymentMode: string;
  Notes: string;
  Supplier: Supplier;
  PurchaseItems: PurchaseItem[];
}

const PurchaseList: React.FC = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      // Ensure the endpoint matches your Swagger/Backend exactly
      const response = await api.get('/Purchase');
      
      if (response.data && Array.isArray(response.data)) {
        setPurchases(response.data);
      } else {
        setPurchases([]);
      }
    } catch (err: any) {
      console.error("API Error:", err);
      setError("डेटा लोड करताना त्रुटी आली. कृपया सर्व्हर कनेक्शन तपासा.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("तुम्हाला खात्री आहे की तुम्ही ही नोंद डिलीट करू इच्छिता?")) {
      try {
        await api.delete(`/Purchase/${id}`);
        setPurchases(prev => prev.filter(p => p.PurchaseId !== id));
      } catch (err) {
        alert("डिलीट करताना एरर आली.");
      }
    }
  };

  const filteredPurchases = purchases.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      p.PurchaseNumber?.toLowerCase().includes(searchLower) ||
      p.Supplier?.Name?.toLowerCase().includes(searchLower);
    
    const matchesDate = dateFilter ? p.PurchaseDate?.startsWith(dateFilter) : true;
    
    return matchesSearch && matchesDate;
  });

  const totalValue = filteredPurchases.reduce((sum, p) => sum + (p.TotalAmount || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6 font-sans min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <ShoppingCart className="text-orange-600" size={28} /> PURCHASE INVENTORY
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Stock Management</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={fetchPurchases}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => navigate('/purchase/create')}
            className="bg-slate-900 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl transition-all active:scale-95 uppercase tracking-widest"
          >
            <Plus size={18} /> Add Purchase
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Entries</p>
          <p className="text-3xl font-black text-slate-800">{filteredPurchases.length}</p>
        </div>
        <div className="bg-orange-600 p-6 rounded-[2rem] shadow-lg shadow-orange-100 text-white">
          <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-1">Total Amount</p>
          <p className="text-3xl font-black">₹{totalValue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Suppliers</p>
          <p className="text-3xl font-black text-slate-800">{new Set(filteredPurchases.map(p => p.Supplier?.Id)).size}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Bill No or Supplier Name..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-bold text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            type="date" 
            className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-bold text-sm transition-all"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-orange-600" size={40} />
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Fetching Records...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 text-red-600 rounded-[2rem] border border-red-100 text-center">
          <p className="font-black uppercase tracking-widest text-sm mb-2">Error Occurred</p>
          <p className="font-bold text-xs">{error}</p>
          <button onClick={fetchPurchases} className="mt-4 text-xs font-black underline uppercase">Try Again</button>
        </div>
      ) : (
        /* Table Section */
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Bill Details</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Supplier</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Date</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Amount</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPurchases.length > 0 ? (
                  filteredPurchases.map((p) => (
                    <tr key={p.PurchaseId} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-black text-slate-800 text-sm">{p.PurchaseNumber}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            Inv: {p.SupplierInvoiceNumber || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[10px] font-black text-orange-600 uppercase">
                            {p.Supplier?.Name?.substring(0, 2)}
                          </div>
                          <p className="font-bold text-slate-700 text-sm">{p.Supplier?.Name || 'Unknown Supplier'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                          {p.PurchaseDate ? new Date(p.PurchaseDate).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-black text-slate-800 text-sm">₹{p.TotalAmount?.toLocaleString('en-IN')}</p>
                        <p className="text-[9px] font-black text-orange-500 uppercase">{p.PaymentMode}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => navigate(`/purchase/edit/${p.PurchaseId}`)}
                            className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.PurchaseId)}
                            className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30">
                        <ShoppingCart size={60} className="text-slate-300 mb-4" />
                        <p className="font-black uppercase tracking-[0.2em] text-xs">कोणताही डेटा उपलब्ध नाही</p>
                      </div>
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

export default PurchaseList;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Search, Filter, Eye, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Purchase } from '../types';

const PurchaseList: React.FC = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await api.get('/Purchase');
        setPurchases(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  const filtered = purchases.filter(p => 
    p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center font-bold">Loading Purchase Ledger...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Purchase Ledger</h1>
          <p className="text-slate-400 font-medium mt-1">Manage supplier invoices and stock arrivals</p>
        </div>
        <button 
          onClick={() => navigate('/purchase/new')}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-3"
        >
          <Plus className="w-6 h-6" /> New Purchase Bill
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search by Bill No or Supplier..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-50 focus:border-emerald-500 outline-none bg-gray-50/50 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Bill Info</th>
              <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Supplier</th>
              <th className="px-8 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Items</th>
              <th className="px-8 py-6 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount</th>
              <th className="px-8 py-6 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((p) => (
              <tr key={p.purchaseId} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-black text-slate-900">{p.purchaseNumber}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase">{new Date(p.purchaseDate).toLocaleDateString()}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="font-bold text-slate-700">{p.supplier?.name || 'N/A'}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">{p.paymentMode}</span>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                    {p.purchaseItems?.length || 0}
                  </span>
                </td>
                <td className="px-8 py-6 text-right font-black text-slate-900 text-lg">
                  ₹{p.totalAmount.toLocaleString()}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-3 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-3 hover:bg-red-50 text-red-400 rounded-xl transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseList; // This ensures the default export for App.tsx
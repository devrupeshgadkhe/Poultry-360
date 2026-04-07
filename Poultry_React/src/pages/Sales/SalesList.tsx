import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Plus, Edit, Trash2, Search, Loader2, AlertCircle, 
  Filter, FileText, Calendar, User, IndianRupee, MoreHorizontal 
} from 'lucide-react';
import { format, isValid } from 'date-fns';

// --- Interfaces
interface SaleItem {
  Id: number;
  ItemType: number;
  Quantity: number;
  PricePerUnit: number;
  TotalPrice: number;
}

interface Sale {
  Id: number;
  CustomerId: number;
  Date: string;
  SubTotal: number;
  Discount: number;
  GrandTotal: number;
  ReceivedAmount: number;
  BalanceAmount: number;
  Status: number;
  PaymentMode: number;
  Notes: string;
  Customer?: {
    Id: number;
    Name: string;
    Phone: string;
    Address: string;
  };
  SaleItems?: SaleItem[];
}

const SalesList: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/Sales');
      const data = Array.isArray(response.data) ? response.data.filter((item: any) => item != null) : [];
      setSales(data);
    } catch (error) {
      setError('Sales लोड करताना एरर आली.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('ही पावती डिलीट करायची का?')) {
      try {
        await api.delete(`/Sales/${id}`);
        setSales(prev => prev.filter(s => s.Id !== id));
      } catch (error) {
        alert('Delete करताना एरर आली.');
      }
    }
  };

  const filteredSales = sales.filter(s => {
    if (!s) return false;
    const name = s.Customer?.Name?.toLowerCase() || '';
    const id = s.Id?.toString() || '';
    return name.includes(searchTerm.toLowerCase()) || id.includes(searchTerm.toLowerCase());
  });

  const safeNumber = (val: any) => (isNaN(Number(val)) ? 0 : Number(val));

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-orange-600" size={20} />
            Sales Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">Manage and review all your poultry sales transactions</p>
        </div>
        <button 
          onClick={() => navigate('/sales/new')}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded shadow-sm flex items-center gap-2 text-sm font-semibold transition-all"
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Sharp Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 border border-slate-200 shadow-sm overflow-hidden rounded-md">
        {[
          { label: 'Total Invoices', value: sales.length, color: 'text-slate-900' },
          { label: 'Sales Amount', value: `₹${sales.reduce((a, c) => a + safeNumber(c?.GrandTotal), 0).toLocaleString()}`, color: 'text-blue-600' },
          { label: 'Collection', value: `₹${sales.reduce((a, c) => a + safeNumber(c?.ReceivedAmount), 0).toLocaleString()}`, color: 'text-green-600' },
          { label: 'Pending', value: `₹${sales.reduce((a, c) => a + safeNumber(c?.BalanceAmount), 0).toLocaleString()}`, color: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by ID or customer name..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded focus:border-slate-500 outline-none text-sm bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Sharp Data Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-600 border-r border-slate-200 w-20 text-center uppercase text-[10px]">ID</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase text-[10px]">Date</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase text-[10px]">Customer Name</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase text-[10px] text-right">Total Amount</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase text-[10px] text-center">Payment Status</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length > 0 ? filteredSales.map(sale => {
                const isPaid = safeNumber(sale.BalanceAmount) <= 0;
                return (
                  <tr key={sale.Id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 border-r border-slate-100 text-center bg-slate-50/30 tracking-tight">#{sale.Id}</td>
                    <td className="px-4 py-3 text-slate-500 font-medium">
                      {sale.Date ? format(new Date(sale.Date.replace('T', ' ')), 'dd-MM-yyyy') : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{sale.Customer?.Name || 'Walk-in Customer'}</span>
                        <span className="text-[10px] text-slate-400">{sale.Customer?.Phone || 'Cash sale'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 underline decoration-slate-200 underline-offset-4">
                      ₹{safeNumber(sale.GrandTotal).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tighter ${
                          isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => navigate(`/sales/edit/${sale.Id}`)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(sale.Id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400 italic bg-white">
                    <AlertCircle className="mx-auto mb-2 opacity-20" size={32} />
                    No sales data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesList;
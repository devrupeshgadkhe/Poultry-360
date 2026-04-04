import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Edit, Trash2, Search, Loader2, AlertCircle } from 'lucide-react';
import { format, isValid } from 'date-fns';

// Interfaces
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
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
  }, []);

  // ✅ FIXED API CALL (NO GENERIC + SAFE PARSE)
  const fetchSales = async () => {
    try {
      setLoading(true);

      const response = await api.get('/Sales');

      console.log("✅ Sales API Response:", response.data);

      const data = Array.isArray(response.data) ? response.data : [];
      setSales(data);

    } catch (error) {
      console.error('❌ Sales Fetch Error:', error);
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

  // ✅ SAFE SEARCH
  const filteredSales = sales.filter(s => {
    const name = s.Customer?.Name?.toLowerCase() || '';
    const id = s.Id?.toString() || '';
    const term = searchTerm.toLowerCase();
    return name.includes(term) || id.includes(term);
  });

  // ✅ SAFE DATE
  const formatDateSafe = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr.replace('T', ' '));
    return isValid(d) ? format(d, 'dd-MM-yyyy hh:mm a') : "Invalid Date";
  };

  // ✅ SAFE NUMBER
  const safeNumber = (val: any) => Number(val) || 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-400 text-xs font-bold">Loading Sales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black">Sales Invoices</h1>

        <button 
          onClick={() => navigate('/sales/new')}
          className="bg-orange-600 text-white px-5 py-3 rounded-xl flex items-center gap-2"
        >
          <Plus size={16} /> New
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-xs text-gray-400">Total Sales</p>
          <p className="font-bold text-xl">{sales.length}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-xl">
          <p className="text-xs text-green-600">Collection</p>
          <p className="font-bold text-xl">
            ₹{sales.reduce((a, c) => a + safeNumber(c.ReceivedAmount), 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-xl">
          <p className="text-xs text-red-600">Pending</p>
          <p className="font-bold text-xl">
            ₹{sales.reduce((a, c) => a + safeNumber(c.BalanceAmount), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search..."
          className="pl-10 pr-4 py-2 w-full border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-3">Inv</th>
              <th>Date</th>
              <th>Customer</th>
              <th className="text-right">Amount</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredSales.length > 0 ? filteredSales.map(sale => (
              <tr key={sale.Id} className="border-t">
                <td className="p-3 font-bold">#{sale.Id}</td>

                <td>{formatDateSafe(sale.Date)}</td>

                <td>
                  {sale.Customer?.Name || 'Walk-in'}
                </td>

                <td className="text-right">
                  ₹{safeNumber(sale.GrandTotal).toLocaleString()}
                </td>

                <td>
                  {safeNumber(sale.BalanceAmount) <= 0 ? 'Paid' : 'Due'}
                </td>

                <td className="text-right">
                  <button onClick={() => navigate(`/sales/edit/${sale.Id}`)}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(sale.Id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="text-center p-10">
                  <AlertCircle className="mx-auto mb-2" />
                  No Data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesList;
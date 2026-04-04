import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  Loader2, 
  Layers,
  Warehouse,
  X,
  AlertCircle
} from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  purchasePrice: number;
  sellingPrice: number;
  lastUpdated: string;
  isActive: boolean;
  isFinishedGood: boolean;
  warehouseName?: string;
}

const InventoryList: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Inventory');
      const data = response.data.map((item: any) => ({
        id: item.Id,
        name: item.Name,
        category: item.Category,
        quantity: item.Quantity,
        unit: item.Unit,
        minThreshold: item.MinThreshold,
        purchasePrice: item.PurchasePrice,
        sellingPrice: item.SellingPrice,
        lastUpdated: item.LastUpdated,
        isActive: item.IsActive,
        isFinishedGood: item.IsFinishedGood,
        warehouseName: item.Warehouse?.Name || 'N/A'
      }));
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Functionality
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        setIsDeleting(id);
        await api.delete(`/Inventory/${id}`);
        // Update local state after successful deletion
        const updatedItems = items.filter(item => item.id !== id);
        setItems(updatedItems);
        setFilteredItems(updatedItems);
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete the item. Please try again.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Edit Functionality (Redirects to Edit Page)
  const handleEdit = (id: number) => {
    navigate(`/inventory/edit/${id}`);
  };

  useEffect(() => {
    const result = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    setFilteredItems(result);
  }, [searchTerm, categoryFilter, items]);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 font-sans">
            <Package className="text-blue-600" /> Inventory Stock
          </h1>
          <p className="text-sm text-gray-500 font-sans">Manage raw materials and finished goods</p>
        </div>
        <button 
          onClick={() => navigate('/inventory/add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 font-bold font-sans"
        >
          <Plus size={20} /> Add New Item
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase font-semibold font-sans">Total Items</p>
            <p className="text-2xl font-black text-gray-800 font-sans">{items.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase font-semibold font-sans">Low Stock Alert</p>
            <p className="text-2xl font-black text-amber-600 font-sans">
              {items.filter(i => i.quantity <= i.minThreshold).length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Warehouse size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase font-semibold font-sans">Finished Goods</p>
            <p className="text-2xl font-black text-emerald-600 font-sans">
              {items.filter(i => i.isFinishedGood).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search item name..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select 
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-gray-700 min-w-[150px] font-sans"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-gray-500 font-medium font-sans">Loading Inventory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4 border-b font-sans">Item Details</th>
                  <th className="p-4 border-b font-sans">Category</th>
                  <th className="p-4 border-b font-sans">Stock Level</th>
                  <th className="p-4 border-b font-sans">Price (Buy/Sell)</th>
                  <th className="p-4 border-b font-sans">Warehouse</th>
                  <th className="p-4 border-b text-right font-sans">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${item.isFinishedGood ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                            <Package size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors font-sans">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-400 font-sans">
                              Last Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider font-sans">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold font-sans ${item.quantity <= item.minThreshold ? 'text-red-600' : 'text-gray-700'}`}>
                              {item.quantity} {item.unit}
                            </span>
                            {item.quantity <= item.minThreshold && (
                              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold animate-pulse font-sans">
                                LOW STOCK
                              </span>
                            )}
                          </div>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.quantity <= item.minThreshold ? 'bg-red-500' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min((item.quantity / (item.minThreshold * 2)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-700 font-sans">Buy: ₹{item.purchasePrice}</div>
                        <div className="text-sm font-bold text-emerald-600 font-sans">Sell: ₹{item.sellingPrice}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium font-sans">
                          <Warehouse size={14} className="text-gray-400" />
                          {item.warehouseName}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(item.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                            title="Edit Item"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id, item.name)}
                            disabled={isDeleting === item.id}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200 disabled:opacity-50"
                            title="Delete Item"
                          >
                            {isDeleting === item.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <Package size={48} />
                        <p className="text-gray-500 italic font-sans">No inventory records found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;
import React, { useState, useEffect } from 'react';
import { Plus, Package, Activity, Trash2, Warehouse as WarehouseIcon } from 'lucide-react';
import api from '../services/api';

// Defined to match your backend Warehouse entity
interface Warehouse {
  Id: number;
  Name: string;
  Location: string;
}

interface InventoryItem {
  Id: number;           // Matches PascalCase backend
  Name: string;         // Matches PascalCase backend
  Category: string;     
  Quantity: number;     
  Unit: string;         
  MinThreshold: number; 
  WarehouseId: number | null; // Added to support selection logic
  Warehouse?: {         
    Name: string;
  };
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]); // UI state for dropdown
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // State variables updated with WarehouseId for the dropdown
  const [formData, setFormData] = useState({ 
    Name: '', 
    Category: 'Feed', 
    Quantity: 0, 
    Unit: 'kg', 
    MinThreshold: 100,
    WarehouseId: 0 // Default value
  });

  useEffect(() => {
    fetchInventory();
    fetchWarehouses();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get<InventoryItem[]>('/Inventory');
      setInventory(res.data || []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setInventory([]);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await api.get<Warehouse[]>('/Warehouses');
      setWarehouses(res.data || []);
      
      // If adding a new item, default to the first warehouse found
      if (!editingId && res.data && res.data.length > 0) {
        setFormData(prev => ({ ...prev, WarehouseId: res.data[0].Id }));
      }
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
    }
  };

  const openModal = () => {
    setEditingId(null);
    setFormData({ 
      Name: '', 
      Category: 'Feed', 
      Quantity: 0, 
      Unit: 'kg', 
      MinThreshold: 100,
      WarehouseId: warehouses.length > 0 ? warehouses[0].Id : 0 
    });
    setIsModalOpen(true);
  };

  const editItem = (item: InventoryItem) => {
    setEditingId(item.Id);
    setFormData({ 
      Name: item.Name, 
      Category: item.Category, 
      Quantity: item.Quantity, 
      Unit: item.Unit, 
      MinThreshold: item.MinThreshold,
      WarehouseId: item.WarehouseId || (warehouses.length > 0 ? warehouses[0].Id : 0)
    });
    setIsModalOpen(true);
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        Quantity: Number(formData.Quantity),
        MinThreshold: Number(formData.MinThreshold),
        WarehouseId: Number(formData.WarehouseId)
      };

      if (editingId) {
        await api.put(`/Inventory/${editingId}`, { Id: editingId, ...payload });
      } else {
        await api.post('/Inventory', payload);
      }
      
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error('Error saving inventory item:', err);
    }
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/Inventory/${id}`);
      fetchInventory();
    } catch (err) {
      console.error('Failed to delete inventory item:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inventory Management</h1>
          <p className="text-gray-500 text-sm">Real-time stock tracking for Poultry 360.</p>
        </div>
        <button 
          onClick={openModal}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus className="w-5 h-5" /> Add New Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => (
          <div key={item.Id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                {item.Category === 'Feed' ? <Package className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                item.Quantity <= item.MinThreshold ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {item.Quantity <= item.MinThreshold ? 'LOW STOCK' : 'IN STOCK'}
              </span>
            </div>
            
            <h4 className="text-xl font-bold mb-1 text-gray-900">{item.Name}</h4>
            <p className="text-gray-500 text-sm mb-4 font-medium uppercase tracking-wider">{item.Category}</p>
            
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-gray-900">{item.Quantity}</span>
              <span className="text-gray-400 font-bold">{item.Unit}</span>
            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${item.Quantity <= item.MinThreshold ? 'bg-red-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min((item.Quantity / (item.MinThreshold * 5)) * 100, 100)}%` }}
              ></div>
            </div>

            <div className="flex items-center gap-2 text-gray-400 text-xs mb-6 font-semibold">
              <WarehouseIcon className="w-4 h-4" />
              <span>{item.Warehouse?.Name || 'General Store'}</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => editItem(item)}
                className="flex-1 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm"
              >
                Edit Details
              </button>
              <button 
                onClick={() => deleteItem(item.Id)}
                className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl">
            <div className="p-8 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Update Stock Item' : 'Register New Item'}</h3>
            </div>
            <form onSubmit={saveItem} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Item Name</label>
                <input 
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  required 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Added Warehouse Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Storage Warehouse</label>
                <select 
                  value={formData.WarehouseId}
                  onChange={(e) => setFormData({ ...formData, WarehouseId: parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                >
                  {warehouses.map((w) => (
                    <option key={w.Id} value={w.Id}>{w.Name} ({w.Location})</option>
                  ))}
                  {warehouses.length === 0 && <option value="0">Loading warehouses...</option>}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Category</label>
                  <select 
                    value={formData.Category}
                    onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Feed">Feed</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Unit</label>
                  <input 
                    value={formData.Unit}
                    onChange={(e) => setFormData({ ...formData, Unit: e.target.value })}
                    required 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Stock Quantity</label>
                  <input 
                    type="number"
                    value={formData.Quantity}
                    onChange={(e) => setFormData({ ...formData, Quantity: parseFloat(e.target.value) })}
                    required 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Min. Threshold</label>
                  <input 
                    type="number"
                    value={formData.MinThreshold}
                    onChange={(e) => setFormData({ ...formData, MinThreshold: parseFloat(e.target.value) })}
                    required 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
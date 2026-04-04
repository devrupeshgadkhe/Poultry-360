import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle,
  Tag,
  Package,
  BadgeIndianRupee,
  RefreshCcw,
  Boxes
} from 'lucide-react';

interface WarehouseOption {
  id: number;
  name: string;
}

const EditInventoryItem: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minThreshold: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    isActive: true,
    isFinishedGood: false,
    warehouseId: 0
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setFetching(true);
        const [whRes, itemRes] = await Promise.all([
          api.get('/Warehouses'),
          api.get(`/Inventory/${id}`)
        ]);

        const whData = whRes.data.map((w: any) => ({
          id: w.id || w.Id,
          name: w.name || w.Name
        }));
        setWarehouses(whData);

        const item = itemRes.data;
        setFormData({
          name: item.name || item.Name || '',
          category: item.category || item.Category || '',
          quantity: item.quantity || item.Quantity || 0,
          unit: item.unit || item.Unit || '',
          minThreshold: item.minThreshold || item.MinThreshold || 0,
          purchasePrice: item.purchasePrice || item.PurchasePrice || 0,
          sellingPrice: item.sellingPrice || item.SellingPrice || 0,
          isActive: item.isActive ?? item.IsActive ?? true,
          isFinishedGood: item.isFinishedGood ?? item.IsFinishedGood ?? false,
          warehouseId: item.warehouseId || item.WarehouseId || 0
        });
      } catch (err: any) {
        setError("डेटा लोड करताना त्रुटी आली.");
      } finally {
        setFetching(false);
      }
    };
    fetchInitialData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      Id: parseInt(id!),
      Name: formData.name,
      Category: formData.category,
      Quantity: formData.quantity,
      Unit: formData.unit,
      MinThreshold: formData.minThreshold,
      PurchasePrice: formData.purchasePrice,
      SellingPrice: formData.sellingPrice,
      IsActive: formData.isActive,
      IsFinishedGood: formData.isFinishedGood,
      WarehouseId: formData.warehouseId === 0 ? null : formData.warehouseId
    };

    try {
      await api.put(`/Inventory/${id}`, payload);
      navigate('/inventory');
    } catch (err: any) {
      setError(err.response?.data?.message || "अपडेट करताना त्रुटी आली.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50/30">
      <Loader2 className="animate-spin text-orange-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 text-left font-sans bg-[#FFFBF7] min-h-screen">
      <div className="mb-6">
        <button onClick={() => navigate('/inventory')} className="flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-all font-bold text-xs uppercase tracking-widest mb-4 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Inventory
        </button>
        <div className="flex items-center gap-4">
          <div className="bg-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-200 text-white">
            <RefreshCcw size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Edit Inventory</h1>
            <p className="text-xs font-bold text-orange-600/70 uppercase tracking-widest">Update item: {formData.name}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-700 flex items-center gap-3 rounded-xl">
          <AlertCircle size={18} /> <p className="font-bold text-xs">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100">
            <h3 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
              <Tag size={16} /> Item Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Item Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Unit</label>
                <input type="text" name="unit" value={formData.unit} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100">
            <h3 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
              <BadgeIndianRupee size={16} /> Inventory Values
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Quantity</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Min Threshold</label>
                <input type="number" name="minThreshold" value={formData.minThreshold} onChange={handleChange} className="w-full p-2.5 bg-red-50/30 border border-red-100 rounded-xl outline-none font-bold text-sm text-red-600" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Buy Price</label>
                <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Sell Price</label>
                <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} className="w-full p-2.5 bg-emerald-50/30 border border-emerald-100 rounded-xl outline-none font-bold text-sm text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Status Control</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl border border-slate-700 cursor-pointer">
                <span className="text-xs font-bold uppercase tracking-wider">Finished Good?</span>
                <input type="checkbox" name="isFinishedGood" checked={formData.isFinishedGood} onChange={handleCheckboxChange} className="w-5 h-5 rounded accent-orange-500" />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl border border-slate-700 cursor-pointer">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Active</span>
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleCheckboxChange} className="w-5 h-5 rounded accent-emerald-500" />
              </label>
            </div>
            <div className="mt-8 space-y-3">
              <button type="submit" disabled={loading} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black shadow-lg shadow-orange-900/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 text-xs tracking-widest uppercase">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Update Item
              </button>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Internal Reference</p>
             <p className="text-lg font-black text-slate-300">#INV-ITEM-{id}</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditInventoryItem;
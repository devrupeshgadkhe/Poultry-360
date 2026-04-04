import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Zap, Beaker, Calculator, 
  Loader2, CheckCircle2, AlertCircle, TrendingUp, Scale,
  Layers, IndianRupee
} from 'lucide-react';
import api from '../../services/api';

/**
 * FeedPrecisionForm - Updated to read Nested InventoryItem from JSON
 */
const FeedPrecisionForm: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<any>({
    Id: 0,
    Name: '',
    TargetQuantity: 100,
    Unit: 'KG',
    FormationItems: []
  });

  const [salesPrice, setSalesPrice] = useState<number>(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Get recipes with includes (FormationItems and InventoryItem)
      const recipeRes = await api.get('/FoodFormation');
      setRecipes(recipeRes.data || []);
    } catch {
      setMessage({ type: 'error', text: 'Data synchronization failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeChange = async (recipeId: number) => {
    const selected = recipes.find(r => r.Id === recipeId || r.id === recipeId);
    if (selected) {
      setLoading(true);
      const items = selected.FormationItems || selected.formationItems || [];
      
      const itemsWithPrice = await Promise.all(
        items.map(async (item: any) => {
          try {
            const itemId = item.InventoryItemId || item.inventoryItemId;
            const priceRes = await api.get(`/FeedPrecision/average-price/${itemId}`);
            return { ...item, averagePrice: priceRes.data };
          } catch {
            return { ...item, averagePrice: 0 };
          }
        })
      );

      setFormData({
        Id: selected.Id || selected.id,
        Name: selected.Name || selected.name,
        TargetQuantity: selected.TargetQuantity || selected.targetQuantity || 100,
        Unit: selected.Unit || selected.unit || 'KG',
        FormationItems: itemsWithPrice
      });
      setLoading(false);
    }
  };

  // Calculations
  const totalPercentage = formData.FormationItems.reduce((sum: number, item: any) => 
    sum + (item.Percentage || item.percentage || 0), 0);
  
  const totalCost = formData.FormationItems.reduce((sum: number, item: any) => {
    const qty = (formData.TargetQuantity * (item.Percentage || item.percentage || 0)) / 100;
    return sum + (qty * (item.averagePrice || 0));
  }, 0);
  
  const costPerUnit = formData.TargetQuantity > 0 ? totalCost / formData.TargetQuantity : 0;

  const handleCheckout = async () => {
    if (totalPercentage !== 100) {
      setMessage({ type: 'error', text: 'Mixing must be exactly 100% accuracy!' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        Formation: formData,
        SalesPrice: salesPrice,
        IsSaveAsNew: false
      };
      await api.post('/FeedPrecision/checkout', payload);
      setMessage({ type: 'success', text: 'Production successful! Inventory updated.' });
      setTimeout(() => navigate('/feed-precision'), 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Server Error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading && recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-slate-50">
        <Loader2 className="animate-spin text-slate-900 mb-2" size={32} />
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Syncing Materials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 text-[11px]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/feed-precision')} className="p-1.5 hover:bg-slate-100 rounded transition-colors">
              <ArrowLeft size={16} />
            </button>
            <h1 className="font-black uppercase tracking-tight flex items-center gap-2">
              <Layers size={14} className="text-orange-600"/> Production Swap
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {message.text && (
              <div className={`px-3 py-1 rounded font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </div>
            )}
            <button 
              onClick={handleCheckout}
              disabled={saving || totalPercentage !== 100 || !formData.Name}
              className="bg-slate-900 hover:bg-orange-600 disabled:bg-slate-300 text-white px-4 py-1.5 rounded font-black transition-all flex items-center gap-2 uppercase tracking-wider"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
              Execute Batch
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 grid grid-cols-12 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-end gap-4">
            <div className="flex-1">
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block tracking-widest">Formula Name</label>
              <select 
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded font-bold outline-none"
                onChange={(e) => handleRecipeChange(Number(e.target.value))}
                value={formData.Id}
              >
                <option value="0">-- SELECT ACTIVE RECIPE --</option>
                {recipes.map(r => <option key={r.Id || r.id} value={r.Id || r.id}>{r.Name || r.name}</option>)}
              </select>
            </div>
            <div className="w-24">
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block tracking-widest">Batch Size</label>
              <input type="number" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded font-bold outline-none" value={formData.TargetQuantity} onChange={(e) => setFormData({...formData, TargetQuantity: Number(e.target.value)})}/>
            </div>
            <div className="w-32">
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block tracking-widest">Est. Sell Price</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input type="number" className="w-full h-9 pl-5 pr-2 bg-slate-50 border border-slate-200 rounded font-bold outline-none" value={salesPrice || ''} onChange={(e) => setSalesPrice(Number(e.target.value))}/>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                  <th className="px-4 py-2.5">Raw Material</th>
                  <th className="px-4 py-2.5 text-center">Inclusion %</th>
                  <th className="px-4 py-2.5 text-right">Net Weight</th>
                  <th className="px-4 py-2.5 text-right">Avg Cost</th>
                  <th className="px-4 py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {formData.FormationItems.map((item: any, idx: number) => {
                  // तुमच्या JSON नुसार नाव InventoryItem.Name मध्ये आहे
                  const materialName = item.InventoryItem?.Name || item.inventoryItem?.name || "Unknown Material";
                  const percentage = item.Percentage || item.percentage || 0;
                  const weight = (formData.TargetQuantity * percentage) / 100;
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-bold text-slate-700">{materialName}</td>
                      <td className="px-4 py-2.5 text-center font-black">{percentage}%</td>
                      <td className="px-4 py-2.5 text-right text-slate-500">{weight.toFixed(2)} {formData.Unit}</td>
                      <td className="px-4 py-2.5 text-right text-slate-400">₹{item.averagePrice?.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right font-black">₹{(weight * (item.averagePrice || 0)).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-lg border-l-4 border-orange-500 shadow-lg">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Financial Insight</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                <span className="text-slate-400">Production Cost</span>
                <span className="text-lg font-black font-mono">₹{totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-medium">Cost / {formData.Unit}</span>
                <span className="text-lg font-black text-green-400 font-mono">₹{costPerUnit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[9px] font-black text-slate-500 uppercase">Mixing Check</span>
                <span className={`font-black ${totalPercentage === 100 ? 'text-green-500' : 'text-red-500'}`}>{totalPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 border-b pb-2">
                  <span>Margin Projection</span>
                  <span className="text-blue-600 font-bold">{salesPrice > 0 ? (((salesPrice - costPerUnit) / salesPrice) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="p-2 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-700 leading-relaxed">
                  <span className="font-bold uppercase block mb-1 text-[8px]">ERP System Note:</span>
                  Stock deduction and finished good updates will be handled automatically upon execution.
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPrecisionForm;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Layers, Loader2, Database, Clock, 
  X, Eye, IndianRupee, ArrowUpRight,
  Calculator, Beaker
} from 'lucide-react';
import api from '../../services/api';

const FeedPrecisionList: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [details, setDetails] = useState<any>({
    itemsWithPrice: [],
    totalCostPerBatch: 0,
    costPerUnit: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recipeRes, invRes] = await Promise.all([
        api.get('/FeedPrecision'),
        api.get('/Inventory')
      ]);
      setRecipes(recipeRes.data || []);
      setInventory(invRes.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (recipe: any) => {
    const recipeId = recipe.id || recipe.Id;
    setModalLoading(true);
    setSelectedRecipe(recipe); 

    try {
      const res = await api.get(`/FeedPrecision/${recipeId}`);
      const fullRecipe = res.data;
      setSelectedRecipe(fullRecipe);

      const items = fullRecipe?.FormationItems || fullRecipe?.formationItems || [];
      const batchSize = fullRecipe?.TargetQuantity || fullRecipe?.targetQuantity || 100;
      
      const itemsWithPrice = await Promise.all(
        items.map(async (item: any) => {
          const itemId = item.InventoryItemId || item.inventoryItemId;
          try {
            const priceRes = await api.get(`/FeedPrecision/average-price/${itemId}`);
            const avgPrice = priceRes.data || 0;
            const percentage = item.Percentage || item.percentage || 0;
            
            const weight = (batchSize * percentage) / 100;
            const subTotal = weight * avgPrice;

            return {
              ...item,
              name: item.InventoryItem?.Name || item.inventoryItem?.name || "Raw Material",
              avgPrice: avgPrice,
              subTotal: subTotal,
              weight: weight
            };
          } catch {
            return { ...item, name: "Material Error", avgPrice: 0, subTotal: 0, weight: 0 };
          }
        })
      );

      const totalCost = itemsWithPrice.reduce((sum, i) => sum + i.subTotal, 0);
      
      setDetails({
        itemsWithPrice,
        totalCostPerBatch: totalCost,
        costPerUnit: batchSize > 0 ? totalCost / batchSize : 0
      });
    } catch (err) {
      console.error("Modal Data Fetch Error:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(r => 
    (r.Name || r.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Production Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 text-[11px]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-2 rounded-xl text-white">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="font-black uppercase tracking-tight text-sm">Feed Precision Matrix</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Recipe & Costing Intelligence</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/feed-precision/produce')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-black transition-all flex items-center gap-2 uppercase tracking-tighter shadow-lg shadow-indigo-100"
          >
            <Plus size={14} strokeWidth={3} /> Produce Feed
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6">
        {/* Search Bar */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search precision database..." 
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Main Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Formula Identity</th>
                <th className="px-6 py-4 text-center text-emerald-400">In-Stock</th>
                <th className="px-6 py-4 text-center text-amber-400">Composition</th>
                <th className="px-6 py-4 text-right">Last Synchronized</th>
                <th className="px-6 py-4 text-center w-20">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecipes.map((recipe) => {
                const rId = recipe.id || recipe.Id;
                // Inventory मॅचिंग (Naming Case Compatibility सह)
                const invMatch = inventory.find(i => 
                   (i.foodFormationId === rId || i.FoodFormationId === rId) || 
                   (i.name === recipe.name || i.Name === recipe.Name)
                );
                
                const itemsCount = (recipe.formationItems || recipe.FormationItems || []).length;
                
                // Date Formatting logic
                const syncDate = invMatch?.lastUpdated || invMatch?.LastUpdated;

                return (
                  <tr key={rId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-700 uppercase">{recipe.name || recipe.Name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-mono font-black border border-emerald-100">
                        {invMatch ? `${invMatch.quantity || invMatch.Quantity} ${invMatch.unit || invMatch.Unit}` : "0 UNITS"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-400 uppercase">
                      {itemsCount} Elements
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 font-mono italic">
                      {syncDate ? new Date(syncDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'NOT SYNCED'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => openDetails(recipe)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredRecipes.length === 0 && (
            <div className="py-12 text-center text-slate-400 uppercase font-black text-[10px]">No formulas found in precision database</div>
          )}
        </div>
      </div>

      {/* --- DETAILS MODAL --- */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <Beaker className="text-indigo-400" size={20} />
                <div>
                  <h3 className="font-black uppercase text-sm tracking-tight">{selectedRecipe?.name || selectedRecipe?.Name}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Formation Intelligence Details</p>
                </div>
              </div>
              <button onClick={() => setSelectedRecipe(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {modalLoading ? (
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="animate-spin text-indigo-600 mb-2" size={24} />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Recalculating Composition &<br/>Live Market Costing...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Target Batch Size</p>
                      <p className="text-xl font-black text-slate-800">
                        {selectedRecipe?.targetQuantity || selectedRecipe?.TargetQuantity} <span className="text-xs uppercase text-slate-400">{selectedRecipe?.unit || selectedRecipe?.Unit}</span>
                      </p>
                    </div>
                    <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-xl shadow-slate-200">
                      <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">Batch Production Cost</p>
                      <p className="text-xl font-black font-mono">₹{details.totalCostPerBatch.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                      <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Unit Net Cost</p>
                      <p className="text-xl font-black text-emerald-700 font-mono">₹{details.costPerUnit.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Composition Breakdown Table */}
                  <div className="mt-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Calculator size={14} className="text-indigo-500" /> Resource Composition & Allocation
                    </h4>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-3">Material Asset</th>
                            <th className="px-6 py-3 text-center">Inclusion %</th>
                            <th className="px-6 py-3 text-right">Net Weight</th>
                            <th className="px-6 py-3 text-right">Live Price</th>
                            <th className="px-6 py-3 text-right">Value Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {details.itemsWithPrice.map((item: any, i: number) => (
                            <tr key={i} className="text-[11px] group hover:bg-slate-50/50">
                              <td className="px-6 py-3 font-bold text-slate-700 uppercase group-hover:text-indigo-600 transition-colors">
                                {item.name}
                              </td>
                              <td className="px-6 py-3 text-center font-black text-slate-900 italic">
                                {item.percentage || item.Percentage}%
                              </td>
                              <td className="px-6 py-3 text-right font-bold text-slate-500">
                                {item.weight?.toFixed(2)} {selectedRecipe?.unit || selectedRecipe?.Unit}
                              </td>
                              <td className="px-6 py-3 text-right text-slate-400 font-mono">
                                ₹{item.avgPrice?.toFixed(2)}
                              </td>
                              <td className="px-6 py-3 text-right font-black text-slate-800 font-mono bg-slate-50/30">
                                ₹{item.subTotal?.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white">
                          <tr className="font-black text-[10px] uppercase">
                            <td className="px-6 py-4" colSpan={4}>Cumulative Formula Value</td>
                            <td className="px-6 py-4 text-right text-sm border-l border-slate-700">
                              ₹{details.totalCostPerBatch.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="px-10 py-3 bg-white border border-slate-200 rounded-xl font-black uppercase tracking-tighter text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPrecisionList;
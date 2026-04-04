import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { 
  Save, 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Trash2, 
  Search, 
  AlertCircle,
  FlaskConical,
  Percent
} from 'lucide-react';

// Interfaces matching .NET Backend PascalCase
interface InventoryItem {
  Id: number;
  Name: string;
  Unit: string;
}

interface FormationItem {
  Id?: number;
  FoodFormationId?: number;
  InventoryItemId: number;
  Percentage: number;
  ItemName?: string; // UI display साठी
}

const FoodFormationForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); 
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    Id: 0,
    Name: '',
    TargetQuantity: 0,
    Unit: 'kg',
    Description: '',
    IsActive: true
  });

  const [selectedItems, setSelectedItems] = useState<FormationItem[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setFetching(true);
      setError(null);
      
      // 1. प्रथम इन्व्हेन्टरी लोड करा (Names मॅपिंगसाठी आवश्यक)
      const invRes = await api.get('/Inventory');
      const inventoryData: InventoryItem[] = invRes.data;
      setInventory(inventoryData);

      // 2. जर Edit मोड असेल तर फॉर्मेशन डेटा लोड करा
      if (isEdit) {
        const formRes = await api.get(`/FoodFormation/${id}`);
        const data = formRes.data;
        
        // फॉर्म डेटा सेट करा
        setFormData({
          Id: data.Id,
          Name: data.Name,
          TargetQuantity: data.TargetQuantity,
          Unit: data.Unit,
          Description: data.Description || '',
          IsActive: data.IsActive
        });

        // FormationItems मॅप करा आणि इन्व्हेन्टरीमधून नाव मिळवा
        if (data.FormationItems && Array.isArray(data.FormationItems)) {
          const mappedItems = data.FormationItems.map((fi: any) => {
            const invItem = inventoryData.find((i: any) => i.Id === fi.InventoryItemId);
            return {
              Id: fi.Id,
              FoodFormationId: fi.FoodFormationId,
              InventoryItemId: fi.InventoryItemId,
              Percentage: fi.Percentage,
              ItemName: invItem ? invItem.Name : `Unknown Item (${fi.InventoryItemId})`
            };
          });
          setSelectedItems(mappedItems);
        }
      }
    } catch (err: any) {
      console.error("Data Fetch Error:", err);
      setError("डेटा लोड करणे अयशस्वी झाले. कृपया नेटवर्क कनेक्शन तपासा.");
    } finally {
      setFetching(false);
    }
  };

  const addItem = (item: InventoryItem) => {
    if (selectedItems.some(si => si.InventoryItemId === item.Id)) {
      setError("हा आयटम आधीच निवडलेला आहे.");
      return;
    }
    setSelectedItems([...selectedItems, {
      Id: 0, // नवीन आयटमसाठी ०
      FoodFormationId: formData.Id,
      InventoryItemId: item.Id,
      ItemName: item.Name,
      Percentage: 0
    }]);
    setSearchTerm('');
    setError(null);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
    setError(null);
  };

  const updatePercentage = (index: number, value: number) => {
    const updated = [...selectedItems];
    updated[index].Percentage = value;
    setSelectedItems(updated);
  };

  const calculateTotalPercentage = () => {
    const total = selectedItems.reduce((sum, item) => sum + (item.Percentage || 0), 0);
    return parseFloat(total.toFixed(2)); // Floating point precision साठी
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotalPercentage();
    
    if (total !== 100) {
      setError(`एकूण टक्केवारी १००% असणे आवश्यक आहे. सध्या ${total}% आहे.`);
      return;
    }

    if (!formData.Name) {
      setError("कृपया फॉर्मेशनचे नाव टाका.");
      return;
    }

    if (selectedItems.length === 0) {
      setError("कृपया किमान एक घटक (Ingredient) जोडा.");
      return;
    }

    setLoading(true);
    setError(null);

    // .NET Backend साठी PascalCase पेलोड
    const payload = {
      Id: formData.Id,
      Name: formData.Name,
      TargetQuantity: formData.TargetQuantity,
      Unit: formData.Unit,
      Description: formData.Description,
      IsActive: formData.IsActive,
      // Backend ला पाठवताना ItemName काढून पाठवावे लागते कारण ते DTO मध्ये नसते
      FormationItems: selectedItems.map(item => ({
        Id: item.Id || 0,
        FoodFormationId: formData.Id,
        InventoryItemId: item.InventoryItemId,
        Percentage: item.Percentage
      }))
    };

    try {
      if (isEdit) {
        await api.put(`/FoodFormation/${id}`, payload);
      } else {
        await api.post('/FoodFormation', payload);
      }
      navigate('/food-formations');
    } catch (err: any) {
      setError(err.response?.data?.message || "फॉर्मेशन सेव्ह करणे अयशस्वी झाले.");
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = searchTerm.length > 0 
    ? inventory.filter(i => i.Name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  if (fetching) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-orange-600" size={48} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Data...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/food-formations')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            {isEdit ? 'Edit Formation' : 'New Food Formation'}
          </h1>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 transition-all disabled:opacity-50 shadow-md uppercase text-xs"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {isEdit ? 'Update Changes' : 'Save Formation'}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Header Info Section */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 mb-1 block uppercase tracking-widest">Formation Name</label>
              <input 
                type="text"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="e.g. Starter Feed Mix"
                value={formData.Name}
                onChange={(e) => setFormData({...formData, Name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-1 block uppercase tracking-widest">Target Quantity</label>
              <input 
                type="number"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                value={formData.TargetQuantity}
                onChange={(e) => setFormData({...formData, TargetQuantity: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-1 block uppercase tracking-widest">Unit</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none appearance-none"
                value={formData.Unit}
                onChange={(e) => setFormData({...formData, Unit: e.target.value})}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="ton">Tons</option>
                <option value="bag">Bags</option>
              </select>
            </div>
          </section>

          {/* Ingredients Section */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search Inventory Ingredients..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                {filteredInventory.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-slate-200 mt-2 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                    {filteredInventory.map(item => (
                      <button 
                        key={item.Id} 
                        onClick={() => addItem(item)} 
                        className="w-full flex items-center justify-between p-4 hover:bg-orange-50 border-b border-slate-50 text-left transition-colors"
                      >
                        <span className="text-sm font-black text-slate-800 uppercase">{item.Name}</span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                          {item.Unit} <Plus size={16} className="text-orange-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-800 text-[10px] font-black text-white uppercase tracking-widest">
              <div className="col-span-8">Ingredient Name</div>
              <div className="col-span-3 text-center">Percentage (%)</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Selected Items List */}
            <div className="flex-1 overflow-y-auto">
              {selectedItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                  <FlaskConical size={48} className="mb-2" />
                  <p className="font-black uppercase text-xs">No Ingredients Added Yet</p>
                </div>
              ) : (
                selectedItems.map((item, index) => (
                  <div key={`${item.InventoryItemId}-${index}`} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-8">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.ItemName}</p>
                    </div>
                    <div className="col-span-3">
                      <div className="relative">
                        <input 
                          type="number"
                          step="0.01"
                          className="w-full bg-white border border-slate-200 rounded-lg pr-8 pl-3 py-2 text-center text-sm font-black text-orange-600 focus:ring-2 focus:ring-orange-500 outline-none"
                          value={item.Percentage}
                          onChange={(e) => updatePercentage(index, parseFloat(e.target.value) || 0)}
                        />
                        <Percent size={14} className="absolute right-3 top-3 text-slate-300" />
                      </div>
                    </div>
                    <div className="col-span-1 text-center">
                      <button onClick={() => removeItem(index)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Analysis */}
        <aside className="w-80 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Formula Analysis</h3>
            <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all ${calculateTotalPercentage() === 100 ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-4xl font-black ${calculateTotalPercentage() === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                  {calculateTotalPercentage()}%
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase mt-1">Total Mixed</span>
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Description</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold min-h-[120px] outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="Notes about this batch mixing process..."
                  value={formData.Description}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <input 
                  type="checkbox" 
                  id="isActive"
                  className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                  checked={formData.IsActive}
                  onChange={(e) => setFormData({...formData, IsActive: e.target.checked})}
                />
                <label htmlFor="isActive" className="text-xs font-black text-slate-600 uppercase cursor-pointer">Active Formation</label>
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 flex gap-3 items-start animate-pulse">
              <AlertCircle size={20} className="flex-shrink-0" />
              <p className="text-[10px] font-black uppercase leading-tight">{error}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default FoodFormationForm;
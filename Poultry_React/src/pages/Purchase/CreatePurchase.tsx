import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Save, 
  Trash2, 
  Plus, 
  ShoppingCart, 
  User, 
  FileText, 
  Calendar, 
  CreditCard,
  Loader2,
  Package,
  Search,
  ArrowLeft,
  AlertCircle,
  X,
  MinusCircle
} from 'lucide-react';

// Interfaces
interface Item {
  Id: number;
  Name: string;
  Category: string;
  PurchasePrice: number;
  Unit: string;
}

interface Supplier {
  Id: number;
  Name: string;
}

interface PurchaseItemPayload {
  ItemId: number;
  Quantity: number;
  PurchaseRate: number;
  ItemName?: string;
  Unit?: string;
}

const CreatePurchase: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [purchaseData, setPurchaseData] = useState({
    PurchaseNumber: `PUR-${Date.now().toString().slice(-6)}`,
    SupplierInvoiceNumber: '',
    SupplierId: 0,
    PurchaseDate: new Date().toISOString().split('T')[0],
    PaymentMode: 'Cash',
    Notes: '',
  });

  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemPayload[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setFetching(true);
      const [itemRes, suppRes] = await Promise.all([
        api.get('/Inventory'),
        api.get('/Suppliers')
      ]);
      
      const itemData = itemRes.data.map((i: any) => ({
        Id: i.Id || i.id,
        Name: i.Name || i.name,
        Category: i.Category || i.category,
        PurchasePrice: i.PurchasePrice || i.purchasePrice || 0,
        Unit: i.Unit || i.unit
      }));

      const suppData = suppRes.data.map((s: any) => ({
        Id: s.Id || s.id,
        Name: s.Name || s.name
      }));

      setItems(itemData);
      setSuppliers(suppData);
    } catch (err) {
      setError("डेटा लोड करताना त्रुटी आली.");
    } finally {
      setFetching(false);
    }
  };

  const addToCart = (item: Item) => {
    const existingIndex = purchaseItems.findIndex(i => i.ItemId === item.Id);
    if (existingIndex > -1) {
      const updated = [...purchaseItems];
      updated[existingIndex].Quantity += 1;
      setPurchaseItems(updated);
    } else {
      setPurchaseItems([{
        ItemId: item.Id,
        ItemName: item.Name,
        Unit: item.Unit,
        Quantity: 1,
        PurchaseRate: item.PurchasePrice
      }, ...purchaseItems]); // नवीन आयटम वर दिसावा म्हणून
    }
    setSearchTerm(''); // सर्च क्लिअर करण्यासाठी
  };

  const updateCartItem = (index: number, field: keyof PurchaseItemPayload, value: any) => {
    const updated = [...purchaseItems];
    updated[index] = { ...updated[index], [field]: value };
    setPurchaseItems(updated);
  };

  const removeFromCart = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => sum + (item.Quantity * item.PurchaseRate), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) return setError("किमान एक आयटम निवडा.");
    if (purchaseData.SupplierId === 0) return setError("सप्लायर निवडा.");

    setLoading(true);
    const payload = {
      ...purchaseData,
      PurchaseDate: new Date(purchaseData.PurchaseDate).toISOString(),
      TotalAmount: calculateTotal(),
      PurchaseItems: purchaseItems.map(item => ({
        ItemId: item.ItemId,
        Quantity: item.Quantity,
        PurchaseRate: item.PurchaseRate
      }))
    };

    try {
      await api.post('/purchase', payload);
      navigate('/purchases');
    } catch (err: any) {
      setError(err.response?.data?.message || "सेव्ह करताना त्रुटी आली.");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = searchTerm.length > 0 
    ? items.filter(i => i.Name.toLowerCase().includes(searchTerm.toLowerCase())) 
    : [];

  if (fetching) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {/* --- Top Header --- */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/purchases')} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Purchase Entry</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-4">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Payable</span>
            <span className="text-xl font-black text-blue-600">₹{calculateTotal().toLocaleString()}</span>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Transaction
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        {/* --- Left Panel: Details & Billing --- */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
          
          {/* Section 1: Supplier & Info */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-3 gap-6">
            <div className="col-span-1">
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Supplier Name</label>
              <select 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={purchaseData.SupplierId}
                onChange={(e) => setPurchaseData({...purchaseData, SupplierId: parseInt(e.target.value)})}
              >
                <option value={0}>Select Supplier</option>
                {suppliers.map(s => <option key={s.Id} value={s.Id}>{s.Name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Invoice Number</label>
              <input 
                type="text"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. INV-2024"
                value={purchaseData.SupplierInvoiceNumber}
                onChange={(e) => setPurchaseData({...purchaseData, SupplierInvoiceNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Payment Mode</label>
              <select 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={purchaseData.PaymentMode}
                onChange={(e) => setPurchaseData({...purchaseData, PaymentMode: e.target.value})}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay</option>
                <option value="Bank">Bank Transfer</option>
                <option value="Credit">Credit (Udhaari)</option>
              </select>
            </div>
          </section>

          {/* Section 2: Item Search & Table */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Scan barcode or type item name to search..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                {/* Search Results Dropdown */}
                {searchTerm.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-slate-200 mt-1 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                    {filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <button
                          key={item.Id}
                          onClick={() => addToCart(item)}
                          className="w-full flex items-center justify-between p-3 hover:bg-blue-50 border-b border-slate-50 text-left transition-colors"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-800">{item.Name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">{item.Category}</p>
                          </div>
                          <span className="text-sm font-bold text-blue-600">₹{item.PurchasePrice}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-sm italic">No items found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <div className="col-span-5">Product Details</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Unit Price (₹)</div>
              <div className="col-span-2 text-right">Subtotal</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Table Body (Cart Items) */}
            <div className="flex-1 overflow-y-auto">
              {purchaseItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
                  <Package size={48} className="mb-2" />
                  <p className="text-sm font-bold">Start adding items to build your purchase order</p>
                </div>
              ) : (
                purchaseItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-50 hover:bg-slate-50/50 group transition-colors">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Package size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate uppercase">{item.ItemName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.Unit}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <input 
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-center text-sm font-bold focus:border-blue-500 outline-none"
                        value={item.Quantity}
                        onChange={(e) => updateCartItem(index, 'Quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="col-span-2">
                      <input 
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-center text-sm font-bold text-blue-600 focus:border-blue-500 outline-none"
                        value={item.PurchaseRate}
                        onChange={(e) => updateCartItem(index, 'PurchaseRate', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="col-span-2 text-right">
                      <span className="text-sm font-black text-slate-800">
                        ₹{(item.Quantity * item.PurchaseRate).toLocaleString()}
                      </span>
                    </div>

                    <div className="col-span-1 text-center">
                      <button 
                        onClick={() => removeFromCart(index)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* --- Right Panel: Summary --- */}
        <aside className="w-80 flex flex-col gap-6">
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Order Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-800 font-bold">₹{calculateTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Tax (0%)</span>
                <span className="text-slate-800 font-bold">₹0</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                <span className="text-sm font-bold text-slate-800">Grand Total</span>
                <span className="text-lg font-black text-blue-600">₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Transaction Notes</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
                placeholder="Ex: Quality check passed, paid half advance..."
                value={purchaseData.Notes}
                onChange={(e) => setPurchaseData({...purchaseData, Notes: e.target.value})}
              />
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-red-600 animate-pulse">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="text-xs font-bold leading-tight">{error}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default CreatePurchase;
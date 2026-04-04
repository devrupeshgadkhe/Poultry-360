import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { 
  Save, 
  Trash2, 
  Loader2,
  Search,
  ArrowLeft,
  AlertCircle,
  Package
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
  PurchaseItemId?: number;
  ItemId: number;
  Quantity: number;
  PurchaseRate: number;
  ItemName?: string; 
  Unit?: string;     
}

const EditPurchase: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [purchaseData, setPurchaseData] = useState({
    PurchaseId: 0,
    PurchaseNumber: '',
    SupplierInvoiceNumber: '',
    SupplierId: 0,
    PurchaseDate: '',
    PaymentMode: 'Cash',
    Notes: '',
  });

  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemPayload[]>([]);

  useEffect(() => {
    if (id) {
      fetchInitialData();
    }
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setFetching(true);
      setError(null);
      
      const [itemRes, suppRes, purchaseRes] = await Promise.all([
        api.get('/Inventory'),
        api.get('/Suppliers'),
        api.get(`/Purchase/${id}`)
      ]);
      
      // 1. All Items List for searching
      const allItems = itemRes.data.map((i: any) => ({
        Id: i.Id ?? i.id,
        Name: i.Name ?? i.name,
        Category: i.Category ?? i.category,
        PurchasePrice: i.PurchasePrice ?? i.purchasePrice ?? 0,
        Unit: i.Unit ?? i.unit
      }));
      setItems(allItems);

      // 2. Supplier List
      setSuppliers(suppRes.data.map((s: any) => ({
        Id: s.Id ?? s.id,
        Name: s.Name ?? s.name
      })));

      // 3. Purchase Header
      const p = purchaseRes.data;
      setPurchaseData({
        PurchaseId: p.PurchaseId,
        PurchaseNumber: p.PurchaseNumber,
        SupplierInvoiceNumber: p.SupplierInvoiceNumber || '',
        SupplierId: p.SupplierId,
        PurchaseDate: p.PurchaseDate ? p.PurchaseDate.split('T')[0] : '',
        PaymentMode: p.PaymentMode || 'Cash',
        Notes: p.Notes || '',
      });

      // 4. Purchase Items Mapping with combined logic
      if (p.PurchaseItems && Array.isArray(p.PurchaseItems)) {
        const mappedItems = p.PurchaseItems.map((pi: any) => {
          const itemDetail = allItems.find((item: Item) => item.Id === pi.ItemId);
          return {
            PurchaseItemId: pi.PurchaseItemId,
            ItemId: pi.ItemId,
            ItemName: pi.Item?.Name || itemDetail?.Name || "Unknown Item", 
            Unit: pi.Item?.Unit || itemDetail?.Unit || "",
            Quantity: pi.Quantity || 0,
            PurchaseRate: pi.PurchaseRate || 0
          };
        });
        setPurchaseItems(mappedItems);
      }

    } catch (err: any) {
      console.error("Fetch Error:", err);
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
      }, ...purchaseItems]);
    }
    setSearchTerm('');
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
    if (purchaseItems.length === 0) return setError("कृपया किमान एक आयटम निवडा.");
    if (purchaseData.SupplierId === 0) return setError("कृपया सप्लायर निवडा.");
    
    setLoading(true);
    setError(null);

    const payload = {
      PurchaseId: Number(id),
      PurchaseNumber: purchaseData.PurchaseNumber,
      SupplierInvoiceNumber: purchaseData.SupplierInvoiceNumber,
      SupplierId: purchaseData.SupplierId,
      PurchaseDate: new Date(purchaseData.PurchaseDate).toISOString(),
      PaymentMode: purchaseData.PaymentMode,
      Notes: purchaseData.Notes,
      TotalAmount: calculateTotal(),
      PurchaseItems: purchaseItems.map(item => ({
        PurchaseItemId: item.PurchaseItemId || 0,
        PurchaseId: Number(id),
        ItemId: item.ItemId,
        Quantity: Number(item.Quantity),
        PurchaseRate: Number(item.PurchaseRate),
        ReturnedQuantity: 0 // Default for schema consistency
      }))
    };

    try {
      await api.put(`/Purchase/${id}`, payload);
      navigate('/purchases');
    } catch (err: any) {
      console.error("Update Error:", err.response?.data);
      setError(err.response?.data?.message || "अपडेट अयशस्वी झाले.");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = searchTerm.length > 0 
    ? items.filter(i => i.Name.toLowerCase().includes(searchTerm.toLowerCase())) 
    : [];

  if (fetching) return (
    <div className="flex items-center justify-center h-screen bg-white">
       <Loader2 className="animate-spin text-orange-600" size={40} />
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/purchases')} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">Edit Purchase</h1>
            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{purchaseData.PurchaseNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 font-black uppercase">Total</span>
            <span className="text-2xl font-black text-orange-600">₹{calculateTotal().toLocaleString()}</span>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 transition-all disabled:opacity-50 shadow-md uppercase text-xs"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Update
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
          
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase">Supplier</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500"
                value={purchaseData.SupplierId}
                onChange={(e) => setPurchaseData({...purchaseData, SupplierId: parseInt(e.target.value)})}
              >
                <option value={0}>Select Supplier</option>
                {suppliers.map(s => <option key={s.Id} value={s.Id}>{s.Name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase">Invoice #</label>
              <input 
                type="text"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500"
                value={purchaseData.SupplierInvoiceNumber}
                onChange={(e) => setPurchaseData({...purchaseData, SupplierInvoiceNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase">Payment Mode</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500"
                value={purchaseData.PaymentMode}
                onChange={(e) => setPurchaseData({...purchaseData, PaymentMode: e.target.value})}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank">Bank</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search products to add..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-slate-200 mt-2 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                    {filteredItems.map(item => (
                      <button key={item.Id} onClick={() => addToCart(item)} className="w-full flex items-center justify-between p-4 hover:bg-orange-50 border-b border-slate-50 text-left">
                        <div>
                          <p className="text-sm font-black text-slate-800 uppercase">{item.Name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{item.Unit}</p>
                        </div>
                        <span className="text-sm font-black text-orange-600">₹{item.PurchasePrice}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-800 text-[10px] font-black text-white uppercase tracking-widest">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Rate</div>
              <div className="col-span-2 text-right">Subtotal</div>
              <div className="col-span-1 text-center">X</div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {purchaseItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                  <Package size={48} className="mb-2" />
                  <p className="font-black uppercase">No Items</p>
                </div>
              ) : (
                purchaseItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-100 hover:bg-slate-50/50">
                    <div className="col-span-5">
                      <p className="text-sm font-black text-slate-800 uppercase leading-none mb-1">{item.ItemName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{item.Unit}</p>
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-center text-sm font-black"
                        value={item.Quantity}
                        onChange={(e) => updateCartItem(index, 'Quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-center text-sm font-black text-orange-600"
                        value={item.PurchaseRate}
                        onChange={(e) => updateCartItem(index, 'PurchaseRate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm font-black text-slate-800">₹{(item.Quantity * item.PurchaseRate).toLocaleString()}</span>
                    </div>
                    <div className="col-span-1 text-center">
                      <button onClick={() => removeFromCart(index)} className="p-2 text-slate-300 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="w-80 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500">Total Amount</span>
                <span className="text-xl font-black text-orange-600">₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-6">
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Notes</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold min-h-[100px] outline-none"
                value={purchaseData.Notes}
                onChange={(e) => setPurchaseData({...purchaseData, Notes: e.target.value})}
              />
            </div>
          </section>
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 flex gap-2 items-center">
              <AlertCircle size={18} />
              <p className="text-[10px] font-black uppercase">{error}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default EditPurchase;
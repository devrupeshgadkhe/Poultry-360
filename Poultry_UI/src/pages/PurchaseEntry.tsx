import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowLeft, 
  AlertCircle, 
  ShoppingCart, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  ChevronRight,
  PackageCheck,
  Calendar,
  User,
  CreditCard
} from 'lucide-react';
import api from '../services/api';
import { Supplier, InventoryItem } from '../types';

// Local interface for cart items to match backend 'PurchaseItem' schema
interface CartItem {
  ItemId: number;
  ItemName: string;
  Quantity: number;
  PurchaseRate: number;
  Unit: string;
}

const PurchaseEntry: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data lists
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  // Selection/Draft state for the "Add to Cart" form
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemSearch, setItemSearch] = useState('');
  const [showItemResults, setShowItemResults] = useState(false);
  const [draftQuantity, setDraftQuantity] = useState<number>(1);
  const [draftRate, setDraftRate] = useState<number>(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Header state
  const [supplierId, setSupplierId] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [supRes, invRes] = await Promise.all([
          api.get('/Suppliers'),
          api.get('/Inventory')
        ]);
        setSuppliers(supRes.data || []);
        setInventory(invRes.data || []);
      } catch (err: any) {
        if (err.response?.status === 401) navigate('/login');
        setError("Failed to load inventory or suppliers.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const selectInventoryItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setDraftRate(item.PurchasePrice || 0); 
    setDraftQuantity(1);
    setItemSearch(item.Name);
    setShowItemResults(false);
  };

  const addToCart = () => {
    if (!selectedItem) return;

    const newItem: CartItem = {
      ItemId: selectedItem.Id,
      ItemName: selectedItem.Name,
      Quantity: draftQuantity,
      PurchaseRate: draftRate,
      Unit: selectedItem.Unit
    };

    if (editingIndex !== null) {
      const updatedCart = [...cart];
      updatedCart[editingIndex] = newItem;
      setCart(updatedCart);
      setEditingIndex(null);
    } else {
      setCart([...cart, newItem]);
    }

    setSelectedItem(null);
    setItemSearch('');
    setDraftQuantity(1);
    setDraftRate(0);
  };

  const editCartItem = (index: number) => {
    const itemToEdit = cart[index];
    const originalItem = inventory.find(i => i.Id === itemToEdit.ItemId);
    if (originalItem) {
      setSelectedItem(originalItem);
      setDraftQuantity(itemToEdit.Quantity);
      setDraftRate(itemToEdit.PurchaseRate);
      setItemSearch(itemToEdit.ItemName);
      setEditingIndex(index);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.Quantity * item.PurchaseRate), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (supplierId === 0) return setError("Please select a supplier.");
    if (cart.length === 0) return setError("The cart is empty.");

    setLoading(true);
    try {
      const payload = {
        SupplierId: supplierId,
        PurchaseDate: purchaseDate,
        TotalAmount: totalAmount,
        Notes: notes,
        PurchaseItems: cart.map(item => ({
          ItemId: item.ItemId,
          Quantity: item.Quantity,
          PurchaseRate: item.PurchaseRate
        }))
      };

      await api.post('/Purchase', payload);
      navigate('/inventory'); 
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save purchase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
              <PackageCheck size={14} />
              Stock Management
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Purchase Entry</h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50/50 backdrop-blur-sm border border-red-100 text-red-600 p-5 rounded-2xl flex gap-4 items-center animate-in zoom-in-95">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-bold leading-tight">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          
          {/* Header Info Card */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <User size={12} className="text-emerald-500" /> Supplier Source
              </label>
              <select 
                className="w-full p-4 rounded-2xl bg-slate-50/50 border border-slate-100 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                value={supplierId}
                onChange={(e) => setSupplierId(Number(e.target.value))}
              >
                <option value={0}>Choose a supplier...</option>
                {suppliers.map(s => <option key={s.Id} value={s.Id}>{s.Name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <Calendar size={12} className="text-emerald-500" /> Transaction Date
              </label>
              <input 
                type="date"
                className="w-full p-4 rounded-2xl bg-slate-50/50 border border-slate-100 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
          </div>

          {/* Cart Interaction Card */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
            <div className="relative">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
                Item Lookup
              </label>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text"
                  placeholder="What are we stocking today?"
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={itemSearch}
                  onFocus={() => setShowItemResults(true)}
                  onChange={(e) => { setItemSearch(e.target.value); setShowItemResults(true); }}
                />
              </div>
              
              {showItemResults && itemSearch && (
                <div className="absolute z-50 w-full mt-3 bg-white/80 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-3xl max-h-64 overflow-y-auto animate-in fade-in zoom-in-95">
                  {inventory.filter(i => i.Name.toLowerCase().includes(itemSearch.toLowerCase())).map(item => (
                    <button 
                      key={item.Id} 
                      onClick={() => selectInventoryItem(item)} 
                      className="w-full text-left px-8 py-5 hover:bg-emerald-50/50 flex justify-between items-center border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900">{item.Name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Stock: {item.Stock} {item.Unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">₹{item.PurchasePrice}</span>
                        <ChevronRight className="text-slate-300 w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedItem && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-emerald-50/30 rounded-3xl border border-emerald-100/50 animate-in zoom-in-95 duration-300">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-emerald-600/70 tracking-widest ml-1">Quantity ({selectedItem.Unit})</label>
                  <input type="number" className="w-full p-4 rounded-xl bg-white border border-emerald-100 font-black text-slate-900 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={draftQuantity} onChange={(e) => setDraftQuantity(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-emerald-600/70 tracking-widest ml-1">Rate (₹)</label>
                  <input type="number" className="w-full p-4 rounded-xl bg-white border border-emerald-100 font-black text-slate-900 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={draftRate} onChange={(e) => setDraftRate(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="flex items-end">
                  <button onClick={addToCart} className="w-full h-[58px] bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95">
                    <PlusCircle className="w-5 h-5" /> {editingIndex !== null ? 'Update Item' : 'Add to Order'}
                  </button>
                </div>
              </div>
            )}

            {/* Modern Table List */}
            <div className="overflow-x-auto pt-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                    <th className="pb-6 px-4">Particulars</th>
                    <th className="pb-6">Quantity</th>
                    <th className="pb-6">Rate</th>
                    <th className="pb-6">Subtotal</th>
                    <th className="pb-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center opacity-20">
                           <ShoppingCart size={48} />
                           <p className="mt-4 font-bold uppercase tracking-widest text-xs">Your order is empty</p>
                        </div>
                      </td>
                    </tr>
                  ) : cart.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-6 px-4 font-black text-slate-900">{item.ItemName}</td>
                      <td className="py-6 text-sm font-bold text-slate-500">{item.Quantity} {item.Unit}</td>
                      <td className="py-6 text-sm font-bold text-slate-500">₹{item.PurchaseRate}</td>
                      <td className="py-6 font-black text-slate-900">₹{(item.Quantity * item.PurchaseRate).toLocaleString()}</td>
                      <td className="py-6">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => editCartItem(idx)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Floating Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white h-fit sticky top-10 shadow-2xl shadow-slate-200">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <ShoppingCart className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Checkout</h2>
            </div>
            
            <div className="space-y-6 border-t border-slate-800 pt-8">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Items</span>
                <span className="font-black text-lg">{cart.length}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Payable Amount</span>
                <div className="text-4xl font-black text-emerald-400 tracking-tighter">₹{totalAmount.toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-800 space-y-4">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Additional Notes</label>
               <textarea 
                 placeholder="Any special instructions..."
                 className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl text-sm p-5 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600 font-medium" 
                 rows={3} 
                 value={notes} 
                 onChange={(e) => setNotes(e.target.value)} 
               />
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading || cart.length === 0}
              className="w-full mt-10 bg-emerald-500 text-slate-900 py-5 rounded-2xl font-black text-lg hover:bg-emerald-400 transition-all disabled:bg-slate-800 disabled:text-slate-600 shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3"
            >
              <CreditCard size={20} />
              {loading ? "Processing..." : "Complete Order"}
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <PackageCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Stock Impact</p>
              <p className="text-sm font-bold text-slate-700">Inventory will update instantly after completion.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseEntry;
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { Save, Plus, Trash2, ArrowLeft, Calculator, IndianRupee, Layers } from 'lucide-react';

// --- Interfaces defined locally as per architecture ---
export enum ItemType { Egg = 1, Bird = 2, Inventory = 3 }
export enum PaymentMode { Cash = 1, Online = 2, BankTransfer = 3 }

export interface SaleItem {
  id: number;
  saleId: number;
  itemType: ItemType;
  eggInventoryId: number | null;
  flockId: number | null;
  inventoryItemId: number | null;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface Sale {
  id: number;
  customerId: number;
  date: string;
  subTotal: number;
  discount: number;
  grandTotal: number;
  receivedAmount: number;
  status: number;
  paymentMode: PaymentMode;
  notes: string;
  saleItems: SaleItem[];
}

const SalesForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [customers, setCustomers] = useState<any[]>([]);
  const [eggStocks, setEggStocks] = useState<any[]>([]);
  const [flocks, setFlocks] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [sale, setSale] = useState<Partial<Sale>>({
    customerId: 0,
    date: new Date().toISOString().split('T')[0],
    discount: 0,
    receivedAmount: 0,
    paymentMode: PaymentMode.Cash,
    status: 1,
    notes: '',
    saleItems: []
  });

  useEffect(() => {
    fetchMasterData();
    if (isEdit) fetchSale();
  }, [id]);

  const fetchMasterData = async () => {
    const [c, e, f, i] = await Promise.all([
      api.get('/Customers'), api.get('/EggInventory'),
      api.get('/Flocks'), api.get('/Inventory')
    ]);
    setCustomers(c.data); setEggStocks(e.data);
    setFlocks(f.data.filter((x: any) => x.isActive || isEdit));
    setInventoryItems(i.data);
  };

  const fetchSale = async () => {
    setLoading(true);
    try {
      const res = await api.get<Sale>(`/Sales/${id}`);
      setSale({ ...res.data, date: res.data.date.split('T')[0] });
    } finally { setLoading(false); }
  };

  const addItem = () => {
    const newItem: SaleItem = {
      id: 0, saleId: isEdit ? Number(id) : 0, itemType: ItemType.Egg,
      eggInventoryId: null, flockId: null, inventoryItemId: null,
      quantity: 1, pricePerUnit: 0, totalPrice: 0
    };
    setSale(p => ({ ...p, saleItems: [...(p.saleItems || []), newItem] }));
  };

  const updateItem = (index: number, fields: Partial<SaleItem>) => {
    const items = [...(sale.saleItems || [])];
    items[index] = { ...items[index], ...fields };
    setSale({ ...sale, saleItems: items });
  };

  const subTotal = sale.saleItems?.reduce((s, i) => s + (i.quantity * i.pricePerUnit), 0) || 0;
  const grandTotal = subTotal - (sale.discount || 0);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...sale, subTotal, grandTotal };
      isEdit ? await api.put(`/Sales/${id}`, payload) : await api.post('/Sales', payload);
      navigate('/sales');
    } catch (err) { alert('Error saving sale'); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/sales')} className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-100 transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">{isEdit ? 'Update Sale' : 'New Sale'}</h1>
            <p className="text-sm text-gray-500 font-medium">Invoice #{id || 'Draft'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={onSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer</label>
              <select 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                value={sale.customerId} onChange={e => setSale({ ...sale, customerId: Number(e.target.value) })} required
              >
                <option value="0">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Billing Date</label>
              <input 
                type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                value={sale.date} onChange={e => setSale({ ...sale, date: e.target.value })} required
              />
            </div>
          </div>

          {/* Items Table Card */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm uppercase tracking-widest"><Layers size={18} className="text-orange-500" /> Items List</h3>
              <button type="button" onClick={addItem} className="bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-orange-700 transition shadow-lg shadow-orange-100 flex items-center gap-2">
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="p-2 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-tighter border-b border-gray-50">
                    <th className="px-4 py-4">Type</th>
                    <th className="px-4 py-4">Product</th>
                    <th className="px-4 py-4 w-20">Qty</th>
                    <th className="px-4 py-4 w-24">Rate</th>
                    <th className="px-4 py-4 w-24 text-right">Total</th>
                    <th className="px-4 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sale.saleItems?.map((item, idx) => (
                    <tr key={idx} className="group">
                      <td className="px-2 py-4">
                        <select 
                          className="w-full bg-transparent border-none text-xs font-bold outline-none"
                          value={item.itemType} onChange={e => updateItem(idx, { itemType: Number(e.target.value), eggInventoryId: null, flockId: null, inventoryItemId: null })}
                        >
                          <option value={1}>Eggs</option><option value={2}>Birds</option><option value={3}>Inventory</option>
                        </select>
                      </td>
                      <td className="px-2 py-4">
                        <select 
                          className="w-full bg-transparent border-none text-xs font-bold outline-none text-orange-600"
                          value={item.eggInventoryId || item.flockId || item.inventoryItemId || ''}
                          onChange={e => {
                            const val = Number(e.target.value);
                            if(item.itemType === 1) updateItem(idx, { eggInventoryId: val });
                            else if(item.itemType === 2) updateItem(idx, { flockId: val });
                            else updateItem(idx, { inventoryItemId: val });
                          }} required
                        >
                          <option value="">Select Item</option>
                          {item.itemType === 1 && eggStocks.map(x => <option key={x.id} value={x.id}>{x.batchName || `Batch ${x.id}`}</option>)}
                          {item.itemType === 2 && flocks.map(x => <option key={x.id} value={x.id}>{x.breed} ({x.batchNumber})</option>)}
                          {item.itemType === 3 && inventoryItems.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-4">
                        <input type="number" className="w-full bg-gray-50 border-none rounded-lg p-2 text-xs font-bold outline-none" value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} />
                      </td>
                      <td className="px-2 py-4">
                        <input type="number" className="w-full bg-gray-50 border-none rounded-lg p-2 text-xs font-bold outline-none" value={item.pricePerUnit} onChange={e => updateItem(idx, { pricePerUnit: Number(e.target.value) })} />
                      </td>
                      <td className="px-2 py-4 text-right font-black text-xs text-gray-900">₹{(item.quantity * item.pricePerUnit).toLocaleString()}</td>
                      <td className="px-2 py-4 text-center">
                        <button type="button" onClick={() => { const items = [...(sale.saleItems || [])]; items.splice(idx, 1); setSale({...sale, saleItems: items}); }} className="text-red-300 hover:text-red-500"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Summary Card */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-6 sticky top-6">
            <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest flex items-center gap-2"><Calculator size={18} className="text-orange-500" /> Payment Summary</h3>
            <div className="space-y-4 border-b border-gray-50 pb-6">
              <div className="flex justify-between text-sm font-bold text-gray-500"><span>Subtotal</span><span className="text-gray-900">₹{subTotal.toLocaleString()}</span></div>
              <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                <span>Discount</span>
                <input type="number" className="w-20 bg-gray-50 border-none rounded-xl p-2 text-right text-xs font-black outline-none" value={sale.discount} onChange={e => setSale({ ...sale, discount: Number(e.target.value) })} />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-black text-gray-900">Grand Total</span>
                <span className="text-2xl font-black text-orange-600">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Received Amount</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={16} />
                  <input 
                    type="number" className="w-full bg-green-50 border-none rounded-2xl p-4 pl-10 text-sm font-black text-green-700 focus:ring-2 focus:ring-green-500 outline-none"
                    value={sale.receivedAmount} onChange={e => setSale({ ...sale, receivedAmount: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Mode</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={sale.paymentMode} onChange={e => setSale({ ...sale, paymentMode: Number(e.target.value) })}>
                  <option value={1}>Cash</option><option value={2}>Online</option><option value={3}>Bank Transfer</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-[24px] font-black text-sm transition-all active:scale-95 shadow-xl shadow-gray-200 flex items-center justify-center gap-3"
            >
              {loading ? 'Processing...' : <><Save size={20} /> {isEdit ? 'Update Invoice' : 'Confirm Sale'}</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SalesForm;
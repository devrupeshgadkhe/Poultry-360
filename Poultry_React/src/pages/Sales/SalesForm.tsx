import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { Save, Plus, Trash2, ArrowLeft, Calculator, Layers, AlertCircle, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Interfaces (Matching Backend PascalCase DTOs)
export enum ItemType { Egg = 1, Bird = 2, Inventory = 3 }
export enum PaymentMode { Cash = 1, Online = 2, BankTransfer = 3 }

export interface Customer { Id: number; Name: string; Phone: string; }
export interface EggInventory { Id: number; EggType: string; CurrentStock: number; }
export interface Flock { Id: number; Breed: string; BatchNumber: string; CurrentCount: number; IsActive: boolean; }
// ✅ FIX: "SellingPrice" column name updated here
export interface InventoryItem { Id: number; Name: string; Quantity: number; SellingPrice?: number; } 

export interface SaleItem {
  Id: number;
  SaleId: number;
  ItemType: ItemType;
  EggInventoryId: number | null;
  FlockId: number | null;
  InventoryItemId: number | null;
  Quantity: number; 
  PricePerUnit: number; 
  TotalPrice: number;
  uiQuantity: number; 
  IsTrayInput: boolean; 
}

export interface Sale {
  Id: number;
  CustomerId: number;
  Date: string;
  SubTotal: number;
  Discount: number;
  GrandTotal: number;
  ReceivedAmount: number;
  BalanceAmount?: number;
  Status: number;
  PaymentMode: PaymentMode;
  Notes: string;
  SaleItems: SaleItem[];
}

const SalesForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [eggStocks, setEggStocks] = useState<EggInventory[]>([]);
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [masterDataLoading, setMasterDataLoading] = useState(false);

  const [sale, setSale] = useState<Partial<Sale>>({
    CustomerId: 0,
    Date: new Date().toISOString().split('T')[0],
    Discount: 0,
    ReceivedAmount: 0,
    PaymentMode: PaymentMode.Cash,
    Status: 1,
    Notes: '',
    SaleItems: []
  });

  useEffect(() => {
    fetchMasterData();
    if (isEdit) fetchSale();
  }, [id]);

  const fetchMasterData = async () => {
    try {
      setMasterDataLoading(true);
      const [c, e, f, i] = await Promise.all([
        api.get('/Customers'), api.get('/EggInventory'),
        api.get('/Flocks'), api.get('/Inventory')
      ]);
      setCustomers(c.data || []);
      setEggStocks(e.data || []);
      setFlocks((f.data || []).filter((fl: any) => fl.IsActive));
      setInventoryItems(i.data || []);
    } catch (err) { setError('डेटा लोड करताना एरर आली.'); }
    finally { setMasterDataLoading(false); }
  };

  const fetchSale = async () => {
    try {
      setLoading(true);
      const res = await api.get<Sale>(`/Sales/${id}`);
      const formattedItems = res.data.SaleItems.map(item => ({
        ...item,
        uiQuantity: item.Quantity,
        IsTrayInput: false
      }));
      setSale({ ...res.data, Date: res.data.Date.split('T')[0], SaleItems: formattedItems });
    } catch (err) { setError('पावती लोड करता आली नाही.'); }
    finally { setLoading(false); }
  };

  // --- PDF Generation Logic ---
  const generatePDF = (saleData: any, invoiceId: any) => {
    const doc = new jsPDF();
    const customer = customers.find(c => c.Id === saleData.CustomerId);

    doc.setFontSize(22);
    doc.setTextColor(249, 115, 22);
    doc.text("POULTRY 360", 14, 20);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Premium Poultry Management ERP Solution", 14, 25);

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text(`INVOICE #: ${invoiceId || 'NEW'}`, 140, 20);
    doc.setFont(undefined, 'normal');
    doc.text(`Date: ${saleData.Date}`, 140, 26);
    doc.text(`Payment: ${PaymentMode[saleData.PaymentMode]}`, 140, 32);

    doc.setDrawColor(240);
    doc.line(14, 38, 196, 38);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("BILL TO:", 14, 45);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text(`${customer?.Name || 'General Customer'}`, 14, 51);
    doc.setFont(undefined, 'normal');
    doc.text(`Phone: ${customer?.Phone || 'N/A'}`, 14, 57);

    const tableData = (saleData.SaleItems || []).map((item: any) => {
      let name = "";
      if (item.ItemType === ItemType.Egg) name = "Eggs"; 
      else if (item.ItemType === ItemType.Bird) name = flocks.find(f => f.Id === item.FlockId)?.Breed || "Birds";
      else name = inventoryItems.find(i => i.Id === item.InventoryItemId)?.Name || "Item";

      return [
        name,
        `${item.Quantity} Units`,
        `Rs. ${item.PricePerUnit.toFixed(2)}`,
        `Rs. ${item.TotalPrice.toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY: 65,
      head: [['Description', 'Quantity', 'Rate', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 3: { halign: 'right' } }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Sub-Total:`, 140, finalY);
    doc.text(`Rs. ${saleData.SubTotal.toLocaleString()}`, 196, finalY, { align: 'right' });
    doc.text(`Discount:`, 140, finalY + 7);
    doc.text(`- Rs. ${saleData.Discount.toLocaleString()}`, 196, finalY + 7, { align: 'right' });
    doc.setDrawColor(200);
    doc.line(135, finalY + 11, 196, finalY + 11);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(249, 115, 22);
    doc.text(`Grand Total:`, 140, finalY + 18);
    doc.text(`Rs. ${saleData.GrandTotal.toLocaleString()}`, 196, finalY + 18, { align: 'right' });

    doc.save(`Invoice_${customer?.Name || 'Sale'}_${saleData.Date}.pdf`);
  };

  const addItem = () => {
    const newItem: SaleItem = {
      Id: 0, SaleId: isEdit ? Number(id) : 0,
      ItemType: ItemType.Egg, EggInventoryId: null, FlockId: null, InventoryItemId: null,
      Quantity: 0, uiQuantity: 0, PricePerUnit: 0, TotalPrice: 0, IsTrayInput: true
    };
    setSale(p => ({ ...p, SaleItems: [...(p.SaleItems || []), newItem] }));
  };

  const updateItem = (index: number, fields: Partial<SaleItem>) => {
    const items = [...(sale.SaleItems || [])];
    let itm = { ...items[index], ...fields };

    // ✅ FIX: Inventory निवडल्यावर SellingPrice आपोआप सेट करण्यासाठी
    if (fields.InventoryItemId) {
      const invProd = inventoryItems.find(i => i.Id === fields.InventoryItemId);
      if (invProd && invProd.SellingPrice) {
        itm.PricePerUnit = invProd.SellingPrice;
      }
    }

    // Tray and Eggs conversion logic
    if (itm.ItemType === ItemType.Egg && itm.IsTrayInput) {
        itm.Quantity = itm.uiQuantity * 30;
    } else {
        itm.Quantity = itm.uiQuantity;
    }

    itm.TotalPrice = itm.Quantity * itm.PricePerUnit;
    items[index] = itm;
    setSale({ ...sale, SaleItems: items });
  };

  const removeItem = (index: number) => {
    const items = [...(sale.SaleItems || [])];
    items.splice(index, 1);
    setSale({ ...sale, SaleItems: items });
  };

  const subTotal = sale.SaleItems?.reduce((s, i) => s + i.TotalPrice, 0) || 0;
  const grandTotal = subTotal - (sale.Discount || 0);
  const balanceAmount = grandTotal - (sale.ReceivedAmount || 0);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale.CustomerId) { setError('कृपया कस्टमर निवडा.'); return; }
    if (!sale.SaleItems?.length) { setError('कृपया किमान एक आयटम जोडा.'); return; }
    
    setLoading(true);
    try {
      const payload = { ...sale, SubTotal: subTotal, GrandTotal: grandTotal, BalanceAmount: balanceAmount };
      let response;
      if (isEdit) {
        response = await api.put(`/Sales/${id}`, payload);
      } else {
        response = await api.post('/Sales', payload);
      }
      generatePDF(payload, response.data?.Id || id);
      navigate('/sales');
    } catch (err: any) { 
      setError(err.response?.data?.Message || 'सेव्ह करताना एरर आली.'); 
    } finally { 
      setLoading(false); 
    }
  };

  if (masterDataLoading) return <div className="p-10 text-center font-bold">मास्टर डेटा लोड होत आहे...</div>;

  return (
    <div className="p-4 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-screen font-sans text-slate-900">
      <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/sales')} className="p-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-bold">{isEdit ? 'Update Sale' : 'New Sale'}</h1>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm font-bold"><AlertCircle size={18} /> {error}</div>}

      <form onSubmit={onSave} className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Customer</label>
              <select className="w-full border-b-2 border-slate-200 py-1.5 text-sm font-bold outline-none focus:border-orange-500" value={sale.CustomerId} onChange={e => setSale({...sale, CustomerId: Number(e.target.value)})}>
                <option value="0">Select Customer</option>
                {customers.map(c => <option key={c.Id} value={c.Id}>{c.Name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Billing Date</label>
              <input type="date" className="w-full border-b-2 border-slate-200 py-1.5 text-sm font-bold outline-none focus:border-orange-500" value={sale.Date} onChange={e => setSale({...sale, Date: e.target.value})} />
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-600 flex items-center gap-2"><Layers size={14}/> Items Details</h3>
              <button type="button" onClick={addItem} className="text-[11px] font-bold bg-orange-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-orange-700"><Plus size={14}/> Add Item</button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 border-b bg-slate-50/50">
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-center w-52">Quantity</th>
                  <th className="p-3 text-center w-32">Rate</th>
                  <th className="p-3 text-right w-32">Total</th>
                  <th className="p-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.SaleItems?.map((item, idx) => {
                    const currentEgg = eggStocks.find(e => e.Id === item.EggInventoryId);
                    return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3">
                            <select className="text-sm font-bold bg-transparent outline-none" value={item.ItemType} onChange={e => updateItem(idx, {ItemType: Number(e.target.value), EggInventoryId: null, FlockId: null, InventoryItemId: null, uiQuantity: 0})}>
                                <option value={ItemType.Egg}>Eggs</option>
                                <option value={ItemType.Bird}>Birds</option>
                                <option value={ItemType.Inventory}>Other Items</option>
                            </select>
                            </td>
                            <td className="p-3">
                            <select className="w-full text-sm font-bold text-orange-700 bg-transparent outline-none" value={item.EggInventoryId || item.FlockId || item.InventoryItemId || ''} onChange={e => {
                                const val = Number(e.target.value);
                                if(item.ItemType === ItemType.Egg) updateItem(idx, {EggInventoryId: val});
                                else if(item.ItemType === ItemType.Bird) updateItem(idx, {FlockId: val});
                                else updateItem(idx, {InventoryItemId: val});
                            }}>
                                <option value="">Choose Item</option>
                                {item.ItemType === ItemType.Egg && eggStocks.map(e => <option key={e.Id} value={e.Id}>{e.EggType}</option>)}
                                {item.ItemType === ItemType.Bird && flocks.map(f => <option key={f.Id} value={f.Id}>{f.Breed}</option>)}
                                {item.ItemType === ItemType.Inventory && inventoryItems.map(i => <option key={i.Id} value={i.Id}>{i.Name}</option>)}
                            </select>
                            {item.ItemType === ItemType.Egg && currentEgg && (
                                <div className="text-[10px] font-bold text-blue-600 mt-1">Available: {currentEgg.CurrentStock} Eggs</div>
                            )}
                            </td>
                            <td className="p-3">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full">
                                    <input type="number" className="w-full bg-white border-none rounded p-1.5 text-sm font-black text-center outline-none focus:ring-1 ring-orange-500" value={item.uiQuantity || ''} placeholder="0" onChange={e => updateItem(idx, { uiQuantity: Number(e.target.value) })} />
                                    {item.ItemType === ItemType.Egg && (
                                        <button type="button" onClick={() => updateItem(idx, { IsTrayInput: !item.IsTrayInput })} className={`text-[9px] font-black px-2 py-2 rounded transition-all shadow-sm ${item.IsTrayInput ? 'bg-orange-600 text-white' : 'bg-white text-slate-500'}`}>{item.IsTrayInput ? 'TRAYS' : 'EGGS'}</button>
                                    )}
                                </div>
                                {item.ItemType === ItemType.Egg && item.uiQuantity > 0 && (
                                    <span className="text-[9px] font-bold text-slate-400 mt-1">
                                        {item.IsTrayInput ? `(${item.Quantity} Eggs)` : `(${(item.uiQuantity / 30).toFixed(2)} Trays)`}
                                    </span>
                                )}
                            </div>
                            </td>
                            <td className="p-3"><input type="number" className="w-full bg-transparent text-sm font-black text-center outline-none border-b border-transparent focus:border-slate-300" value={item.PricePerUnit || ''} placeholder="0.00" onChange={e => updateItem(idx, {PricePerUnit: Number(e.target.value)})} /></td>
                            <td className="p-3 text-right text-sm font-black text-slate-700">₹{item.TotalPrice.toLocaleString()}</td>
                            <td className="p-3 text-center"><button type="button" onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button></td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl sticky top-4">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-slate-400 flex items-center gap-2"><Calculator size={14}/> Bill Summary</h3>
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between font-bold"><span>Sub-Total</span><span>₹{subTotal.toLocaleString()}</span></div>
              <div className="flex justify-between items-center font-bold"><span className="text-orange-400">Discount (₹)</span><input type="number" className="w-20 bg-slate-800 border-none rounded p-1 text-right text-orange-400 outline-none" value={sale.Discount} onChange={e => setSale({...sale, Discount: Number(e.target.value)})} /></div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-end"><span className="text-xs font-bold opacity-50 uppercase tracking-tighter">Grand Total</span><span className="text-3xl font-black text-orange-500">₹{grandTotal.toLocaleString()}</span></div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-4 mb-6">
              <div className="flex justify-between items-center"><label className="text-[10px] font-bold uppercase text-slate-400">Cash Received</label><input type="number" className="bg-transparent text-right text-xl font-black text-green-400 outline-none w-28" value={sale.ReceivedAmount} onChange={e => setSale({...sale, ReceivedAmount: Number(e.target.value)})} /></div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-700"><span className="text-[10px] font-bold uppercase text-red-400">Balance Amount</span><span className="text-lg font-black text-red-400">₹{balanceAmount.toLocaleString()}</span></div>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(m => (
                        <button key={m} type="button" onClick={() => setSale({...sale, PaymentMode: m})} className={`text-[10px] font-bold py-2 rounded border transition-all ${sale.PaymentMode === m ? 'bg-white text-black border-white' : 'border-slate-700 text-slate-400'}`}>{PaymentMode[m]}</button>
                    ))}
                </div>
                <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isEdit ? 'UPDATE & PRINT BILL' : 'SAVE & GENERATE BILL'}
                </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SalesForm;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bird, 
  Calendar, 
  Hash, 
  Save, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  CircleDollarSign 
} from 'lucide-react';
import api from '../../services/api';

const AddFlock: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    breed: '',
    initialCount: '',
    arrivalDate: new Date().toISOString().split('T')[0],
    perBirdPurchasePrice: '', 
    totalPurchasePrice: '',
    notes: ''
  });

  // Vice-versa calculation logic
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      const count = parseFloat(newData.initialCount) || 0;
      const perBird = parseFloat(newData.perBirdPurchasePrice) || 0;
      const total = parseFloat(newData.totalPurchasePrice) || 0;

      // १. जर Bird Count किंवा Per Bird Price बदलली, तर Total Calculate करा
      if (name === 'perBirdPurchasePrice' || name === 'initialCount') {
        if (count > 0) {
          newData.totalPurchasePrice = (count * perBird).toFixed(2);
        }
      } 
      // २. जर थेट Total Price बदलली, तर Per Bird Price Calculate करा
      else if (name === 'totalPurchasePrice') {
        if (count > 0) {
          newData.perBirdPurchasePrice = (total / count).toFixed(2);
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Mapping to .NET DTO (PascalCase)
      const payload = {
        Breed: formData.breed,
        InitialCount: parseInt(formData.initialCount),
        CurrentCount: parseInt(formData.initialCount),
        ArrivalDate: formData.arrivalDate,
        StartDate: formData.arrivalDate, // StartDate is required in your DB
        PerBirdPurchasePrice: parseFloat(formData.perBirdPurchasePrice) || 0,
        TotalPurchasePrice: parseFloat(formData.totalPurchasePrice) || 0,
        IsActive: true,
        Status: "Active",
        Notes: formData.notes
      };

      await api.post('/Flocks', payload);
      navigate('/flocks');
    } catch (err: any) {
      console.error("Add Flock Error:", err);
      setError(err.response?.data?.Message || "Failed to create flock batch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-left">
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/flocks')}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-bold"
        >
          <ArrowLeft size={20} /> Back to List
        </button>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Add New Batch</h1>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-orange-600 p-6 text-white flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Bird size={32} />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold uppercase tracking-tight">Flock Details</h2>
            <p className="text-orange-100 text-sm">Automated price calculation enabled</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3 font-sans">
              <AlertCircle size={20} />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Breed Name */}
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase ml-1">Breed Name</label>
              <div className="relative">
                <Bird className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="breed"
                  required
                  placeholder="e.g. Cobb 500"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold transition-all"
                  value={formData.breed}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Bird Count */}
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase ml-1">Bird Count</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  name="initialCount"
                  required
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold transition-all"
                  value={formData.initialCount}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Arrival Date */}
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase ml-1">Arrival Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  name="arrivalDate"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold transition-all"
                  value={formData.arrivalDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Cost Per Bird */}
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase ml-1 text-blue-600">Cost Per Bird (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  name="perBirdPurchasePrice"
                  required
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 border border-blue-100 bg-blue-50/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all text-blue-700"
                  value={formData.perBirdPurchasePrice}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Total Purchase Price */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-black text-emerald-700 uppercase ml-1">Total Batch Cost (₹)</label>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                <input
                  type="number"
                  step="0.01"
                  name="totalPurchasePrice"
                  required
                  placeholder="Total Amount"
                  className="w-full pl-10 pr-4 py-4 border-2 border-emerald-100 bg-emerald-50/30 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-xl text-emerald-700 transition-all"
                  value={formData.totalPurchasePrice}
                  onChange={handleChange}
                />
              </div>
              <p className="text-[10px] text-gray-400 ml-1 font-bold italic">* Automatic calculation based on bird count and price</p>
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm font-black text-gray-700 uppercase ml-1">Notes</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Supplier details or remarks..."
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none font-medium"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 uppercase tracking-widest"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Save size={20} /> Save Flock Batch
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFlock;
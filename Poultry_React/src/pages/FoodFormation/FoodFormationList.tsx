import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Plus, Search, Loader2, Edit2, Trash2, 
  FlaskConical, ChevronRight, Filter, Calendar, Activity, AlertCircle
} from 'lucide-react'; // येथे 'lucide-center' ऐवजी 'lucide-react' केले आहे

// API नुसार सुधारित इंटरफेसेस
interface InventoryItem {
  Id: number;
  Name: string;
  Category: string;
  Unit: string;
}

interface FormationItem {
  Id: number;
  FoodFormationId: number;
  InventoryItemId: number;
  Percentage: number;
  InventoryItem?: InventoryItem;
}

interface FoodFormation {
  Id: number;
  Name: string;
  TargetQuantity: number;
  Unit: string;
  Description: string;
  CreatedAt: string;
  IsActive: boolean;
  FormationItems: FormationItem[];
}

const FoodFormationList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formations, setFormations] = useState<FoodFormation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/FoodFormation');
      
      if (Array.isArray(response.data)) {
        setFormations(response.data);
      } else {
        setFormations([]);
      }
    } catch (err: any) {
      console.error("Error fetching formations:", err);
      if (err.response?.status === 401) {
        setError("तुमचे सत्र संपले आहे. कृपया पुन्हा लॉगिन करा.");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError("डेटा लोड करताना त्रुटी आली.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("तुम्हाला खात्री आहे की तुम्ही ही फॉर्मेशन डिलीट करू इच्छिता?")) return;
    
    try {
      await api.delete(`/FoodFormation/${id}`);
      setFormations(prev => prev.filter(f => f.Id !== id));
    } catch (error) {
      alert("डिलीट करणे अयशस्वी झाले.");
    }
  };

  const filteredFormations = formations.filter(f => {
    const name = f.Name || "";
    const desc = f.Description || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          desc.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : 
                          statusFilter === 'active' ? f.IsActive : !f.IsActive;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-orange-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Recipes...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-600 rounded-2xl text-white shadow-lg shadow-orange-100">
            <FlaskConical size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
              Food Formations
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recipe & Mixing Master</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/food-formations/add')}
          className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl active:scale-95 uppercase text-xs"
        >
          <Plus size={18} />
          New Formation
        </button>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
        <div className="max-w-7xl mx-auto">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Filters Area */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
            <div className="md:col-span-8 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Search by formula name..."
                className="w-full pl-14 pr-6 py-4 bg-white border border-transparent rounded-[1.5rem] text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:col-span-4 relative">
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                className="w-full pl-12 pr-6 py-4 bg-white border border-transparent rounded-[1.5rem] text-xs font-black uppercase outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFormations.map((formation) => (
              <div 
                key={formation.Id} 
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden group flex flex-col"
              >
                <div className="p-7 flex-1">
                  <div className="flex justify-between items-start mb-5">
                    <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${formation.IsActive ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                      {formation.IsActive ? '• Active' : '• Inactive'}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                      <button 
                        onClick={() => navigate(`/food-formations/edit/${formation.Id}`)}
                        className="p-2 bg-slate-50 hover:bg-orange-50 text-slate-400 hover:text-orange-600 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(formation.Id)}
                        className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-800 uppercase leading-tight mb-2 group-hover:text-orange-600 transition-colors">
                    {formation.Name}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mb-6 line-clamp-2 italic">
                    {formation.Description || "No specific instructions added."}
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 mb-6">
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</span>
                      <span className="text-sm font-black text-slate-700">{formation.TargetQuantity} {formation.Unit}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingredients</span>
                      <span className="text-sm font-black text-slate-700">{formation.FormationItems?.length || 0} Items</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase">
                        {new Date(formation.CreatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate(`/food-formations/edit/${formation.Id}`)}
                      className="flex items-center gap-1 text-[10px] font-black text-orange-600 uppercase group-hover:gap-2 transition-all"
                    >
                      Recipe Details <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-50">
                   <div 
                    className="h-full bg-orange-500 transition-all duration-1000" 
                    style={{ width: `${Math.min((formation.FormationItems?.length || 0) * 15, 100)}%` }}
                   ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredFormations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 opacity-30">
              <Activity size={80} className="mb-6 text-slate-300" />
              <p className="text-2xl font-black uppercase text-slate-400 tracking-tighter italic">No Formulas Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodFormationList;
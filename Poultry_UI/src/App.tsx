import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Bird, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  LogOut, 
  ClipboardList,
  ChevronRight,
  Bell,
  Search
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Page Imports
import Dashboard from './pages/Dashboard';
import Flocks from './pages/Flocks';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import DailyLogList from './pages/DailyLogList';
import DailyLogEntryPage from './pages/DailyLogEntry';
import PurchaseList from './pages/PurchaseList'; 
import PurchaseEntry from './pages/PurchaseEntry'; 

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const App: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === '/login') {
    return <Login />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Daily Logs', path: '/logs', icon: ClipboardList }, 
    { name: 'Flocks', path: '/flocks', icon: Bird },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Purchase', path: '/purchase', icon: ShoppingCart },
    { name: 'Reports', path: '/reports', icon: TrendingUp },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* SIDEBAR: Modern Minimalist */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "bg-white border-r border-slate-100 transition-all duration-300 ease-in-out flex flex-col z-50 shadow-sm",
          isHovered ? "w-64" : "w-20"
        )}
      >
        <div className="h-20 flex items-center px-6 shrink-0">
          <div className="w-10 h-10 bg-emerald-600/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
            <Bird className="text-emerald-600 w-6 h-6" />
          </div>
          {isHovered && (
            <span className="ml-3 font-black text-lg tracking-tight uppercase animate-in fade-in">
              Poultry<span className="text-emerald-600">360</span>
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 rounded-xl transition-all duration-200 group",
                  isHovered ? "px-4 py-3" : "p-3.5 justify-center",
                  isActive ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-emerald-600" : "text-slate-400")} />
                {isHovered && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button onClick={handleLogout} className={cn("flex items-center gap-4 w-full rounded-xl font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all", isHovered ? "px-4 py-3" : "p-3.5 justify-center")}>
            <LogOut className="w-5 h-5" />
            {isHovered && <span className="animate-in fade-in">Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* HEADER: Modern Canvas */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            ERP <ChevronRight size={12} /> <span className="text-slate-900">Platform</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input type="text" placeholder="Search..." className="bg-slate-50 border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-sm w-48 focus:w-64 transition-all outline-none" />
            </div>
            <button className="p-2.5 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded-xl border border-slate-100 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 leading-none">Admin</p>
                <p className="text-[10px] font-black text-emerald-600 tracking-tighter uppercase mt-1">Administrator</p>
              </div>
              <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-500 border border-slate-200">AD</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/flocks" element={<Flocks />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/logs" element={<DailyLogList />} />
              <Route path="/logs/new" element={<DailyLogEntryPage />} />
              <Route path="/logs/edit/:id" element={<DailyLogEntryPage />} />
              <Route path="/purchase" element={<PurchaseList />} />
              <Route path="/purchase/new" element={<PurchaseEntry />} />
              <Route path="/purchase/edit/:id" element={<PurchaseEntry />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
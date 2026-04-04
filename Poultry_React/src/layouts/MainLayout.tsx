import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Egg, 
  Stethoscope, 
  Truck, 
  BadgeDollarSign, 
  Settings,
  Plus,
  LogOut,
  Bell,
  ChevronRight,
  ClipboardList,
  ShoppingCart,
  FlaskConical,
  Zap,
  UserSquare2,
  ReceiptIndianRupee,
  BadgePercent // Sales साठी नवीन आयकॉन
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Sidebar Menu Items
  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Users size={18} />, label: 'Flock Management', path: '/flocks' },
    { icon: <ClipboardList size={18} />, label: 'Daily Logs', path: '/daily-logs' },
    
    // Sales Section - नवीन जोडलेले
    { icon: <BadgePercent size={18} />, label: 'Sales Invoices', path: '/sales' },
    
    { icon: <Package size={18} />, label: 'Inventory', path: '/inventory' },
    { icon: <UserSquare2 size={18} />, label: 'Staff Management', path: '/staff' },
    
    // Financial Transactions
    { icon: <ReceiptIndianRupee size={18} />, label: 'Finance Ledger', path: '/financial-transactions/new' },
    
    { icon: <FlaskConical size={18} />, label: 'Recipes (Formations)', path: '/food-formations' },
    { icon: <Zap size={18} />, label: 'Feed Production', path: '/feed-precision' },
    { icon: <ShoppingCart size={18} />, label: 'Purchases', path: '/purchases' }, 
    { icon: <Egg size={18} />, label: 'Egg Production', path: '/egg-production' },
    { icon: <Stethoscope size={18} />, label: 'Health & Vet', path: '/health' },
    { icon: <Truck size={18} />, label: 'Logistics', path: '/logistics' },
    { icon: <BadgeDollarSign size={18} />, label: 'Reports & Analytics', path: '/reports' },
    { icon: <Settings size={18} />, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    if (path === '/staff' && currentPath.startsWith('/staff')) return true;
    if (path === '/purchases' && currentPath.startsWith('/purchase')) return true;
    if (path === '/food-formations' && currentPath.startsWith('/food-formations')) return true;
    if (path === '/feed-precision' && currentPath.startsWith('/feed-precision')) return true;
    if (path === '/financial-transactions/new' && currentPath.startsWith('/financial-transactions')) return true;
    
    // Sales साठी ऍक्टिव्ह स्टेट चेक
    if (path === '/sales' && currentPath.startsWith('/sales')) return true;
    
    return currentPath === path;
  };

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10 shrink-0 overflow-hidden">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-50">
          <div className="text-orange-600 font-black text-2xl flex items-center gap-2 tracking-tighter cursor-pointer" onClick={() => navigate('/dashboard')}>
            <span className="bg-orange-100 p-1.5 rounded-xl text-xl shadow-inner">🐔</span>
            <span>Poultry 360</span>
          </div>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-6 py-3 transition-all mb-1 group ${
                  active 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 mx-4 rounded-xl' 
                    : 'text-slate-500 hover:bg-orange-50 hover:text-orange-600 mx-4 rounded-xl'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={active ? 'text-orange-400' : 'group-hover:scale-110 transition-transform'}>
                    {item.icon}
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider">{item.label}</span>
                </div>
                {active && <ChevronRight size={14} className="text-orange-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-6 py-3 w-full text-left rounded-xl text-red-500 hover:bg-red-100/50 text-[10px] transition-all font-black uppercase tracking-[0.2em]"
          >
            <LogOut size={18} />
            <span>Logout System</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-20">
          <div className="flex space-x-3">
            {/* Quick Action: New Sale - Sales साठी नवीन बटन */}
            <button 
              onClick={() => navigate('/sales/new')}
              className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-orange-700 transition-colors uppercase tracking-widest shadow-md"
            >
              <Plus size={14} />
              <span>New Sale</span>
            </button>

            <button 
              onClick={() => navigate('/financial-transactions/new')}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-700 transition-colors uppercase tracking-widest shadow-md"
            >
              <ReceiptIndianRupee size={14} />
              <span>Add Transaction</span>
            </button>
            
            <button 
              onClick={() => navigate('/purchase/create')}
              className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-slate-800 transition-colors uppercase tracking-widest shadow-md"
            >
              <ShoppingCart size={14} />
              <span>Quick Purchase</span>
            </button>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-3 text-[10px] border-r border-slate-200 pr-6 uppercase font-black tracking-widest">
              <span className="text-slate-400">User: <span className="text-slate-900">Admin</span></span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">Site: <span className="text-slate-900 italic font-medium uppercase tracking-normal">Maharashtra Site 01</span></span>
            </div>
            
            <div className="relative">
               <button className="text-slate-400 hover:text-orange-600 transition-colors p-2 bg-slate-50 rounded-full group">
                <Bell size={20} className="group-hover:animate-ring" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto bg-[#F1F5F9] p-4 md:p-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
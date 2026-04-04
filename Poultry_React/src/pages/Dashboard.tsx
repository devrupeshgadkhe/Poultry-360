import React from 'react';

const Dashboard = () => {
  const stats = [
    { label: 'Total Flocks', value: '24', progress: 75, color: 'bg-emerald-500' },
    { label: 'Total Birds', value: '1.2M', progress: 60, color: 'bg-emerald-500' },
    { label: 'Feed Inventory', value: '85%', progress: 85, color: 'bg-emerald-500' },
    { label: 'Mortality Rate', value: '0.12%', progress: 20, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
               <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
               <div className={`${stat.color} h-full`} style={{ width: `${stat.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-64 flex items-center justify-center">
           <p className="text-slate-400 italic text-sm">Production Metrics Chart (Placeholder)</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-64 flex items-center justify-center">
           <p className="text-slate-400 italic text-sm">Data Inventory Summary (Placeholder)</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
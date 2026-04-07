import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth & Layout
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';

// Dashboard & Flocks
import Dashboard from './pages/Dashboard';
import FlockList from './pages/Flocks/FlockList';
import AddFlock from './pages/Flocks/AddFlock';
import EditFlock from './pages/Flocks/EditFlock';
import FlockVaccinations from './pages/Flocks/FlockVaccinations';

// Daily Logs
import DailyLogList from './pages/DailyLogs/DailyLogList';
import AddDailyLog from './pages/DailyLogs/AddDailyLog';
import EditDailyLog from './pages/DailyLogs/EditDailyLog';

// Inventory
import InventoryList from './pages/Inventory/InventoryList';
import AddInventoryItem from './pages/Inventory/AddInventoryItem';
import EditInventoryItem from './pages/Inventory/EditInventoryItem';

// Staff Management
import StaffPage from './pages/Staff/Staff';

// Financial Transactions
import FinancialTransactionForm from './pages/FinancialTransactions/FinancialTransactionForm';

// Purchase (POS System)
import CreatePurchase from './pages/Purchase/CreatePurchase';
import PurchaseList from './pages/Purchase/PurchaseList';
import EditPurchase from './pages/Purchase/EditPurchase';

// Food Formation (Recipe Master)
import FoodFormationList from './pages/FoodFormation/FoodFormationList';
import FoodFormationForm from './pages/FoodFormation/FoodFormationForm';

// Feed Precision (Production Module)
import FeedPrecisionList from './pages/FeedPrecision/FeedPrecisionList';
import FeedPrecisionForm from './pages/FeedPrecision/FeedPrecisionForm';

// ✅ Sales Module (हे आधी नव्हते - MAIN FIX!)
import SalesList from './pages/Sales/SalesList';
import SalesForm from './pages/Sales/SalesForm';

/**
 * ✅ PrivateRoute - Token नसेल तर Login वर redirect करतो
 */
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

/**
 * Poultry 360 ERP - Main App Component
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Route --- */}
        <Route path="/login" element={<Login />} />

        {/* --- Dashboard --- */}
        <Route path="/dashboard" element={<PrivateRoute><MainLayout><Dashboard /></MainLayout></PrivateRoute>} />

        {/* --- Flocks Management --- */}
        <Route path="/flocks" element={<PrivateRoute><MainLayout><FlockList /></MainLayout></PrivateRoute>} />
        <Route path="/flocks/add" element={<PrivateRoute><MainLayout><AddFlock /></MainLayout></PrivateRoute>} />
        <Route path="/flocks/edit/:id" element={<PrivateRoute><MainLayout><EditFlock /></MainLayout></PrivateRoute>} />
        <Route path="/flocks/:flockId/vaccinations" element={<PrivateRoute><MainLayout><FlockVaccinations /></MainLayout></PrivateRoute>} />

        {/* --- Daily Logs --- */}
        <Route path="/daily-logs" element={<PrivateRoute><MainLayout><DailyLogList /></MainLayout></PrivateRoute>} />
        <Route path="/daily-logs/add" element={<PrivateRoute><MainLayout><AddDailyLog /></MainLayout></PrivateRoute>} />
        <Route path="/daily-logs/edit/:id" element={<PrivateRoute><MainLayout><EditDailyLog /></MainLayout></PrivateRoute>} />

        {/* --- Inventory Management --- */}
        <Route path="/inventory" element={<PrivateRoute><MainLayout><InventoryList /></MainLayout></PrivateRoute>} />
        <Route path="/inventory/add" element={<PrivateRoute><MainLayout><AddInventoryItem /></MainLayout></PrivateRoute>} />
        <Route path="/inventory/edit/:id" element={<PrivateRoute><MainLayout><EditInventoryItem /></MainLayout></PrivateRoute>} />

        {/* --- Staff Management --- */}
        <Route path="/staff" element={<PrivateRoute><MainLayout><StaffPage /></MainLayout></PrivateRoute>} />

        {/* --- Financial Transactions --- */}
        <Route path="/financial-transactions/new" element={<PrivateRoute><MainLayout><FinancialTransactionForm /></MainLayout></PrivateRoute>} />

        {/* --- Purchase POS Module --- */}
        <Route path="/purchases" element={<PrivateRoute><MainLayout><PurchaseList /></MainLayout></PrivateRoute>} />
        <Route path="/purchase/create" element={<PrivateRoute><MainLayout><CreatePurchase /></MainLayout></PrivateRoute>} />
        <Route path="/purchase/edit/:id" element={<PrivateRoute><MainLayout><EditPurchase /></MainLayout></PrivateRoute>} />

        {/* --- Food Formation (Recipe Master) --- */}
        <Route path="/food-formations" element={<PrivateRoute><MainLayout><FoodFormationList /></MainLayout></PrivateRoute>} />
        <Route path="/food-formations/add" element={<PrivateRoute><MainLayout><FoodFormationForm /></MainLayout></PrivateRoute>} />
        <Route path="/food-formations/edit/:id" element={<PrivateRoute><MainLayout><FoodFormationForm /></MainLayout></PrivateRoute>} />

        {/* --- Feed Precision (Production) --- */}
        <Route path="/feed-precision" element={<PrivateRoute><MainLayout><FeedPrecisionList /></MainLayout></PrivateRoute>} />
        <Route path="/feed-precision/new" element={<PrivateRoute><MainLayout><FeedPrecisionForm /></MainLayout></PrivateRoute>} />
        <Route path="/feed-precision/edit/:id" element={<PrivateRoute><MainLayout><FeedPrecisionForm /></MainLayout></PrivateRoute>} />

        {/* ✅ Sales Module - MISSING ROUTES ADDED */}
        <Route path="/sales" element={<PrivateRoute><MainLayout><SalesList /></MainLayout></PrivateRoute>} />
        <Route path="/sales/new" element={<PrivateRoute><MainLayout><SalesForm /></MainLayout></PrivateRoute>} />
        <Route path="/sales/edit/:id" element={<PrivateRoute><MainLayout><SalesForm /></MainLayout></PrivateRoute>} />

        {/* --- Default & Catch-all --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
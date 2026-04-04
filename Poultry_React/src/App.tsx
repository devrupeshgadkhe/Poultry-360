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

// Financial Transactions (नवीन जोडलेले)
import FinancialTransactionForm from './pages/FinancialTransactions/FinancialTransactionForm';
// टीप: जर तुमच्याकडे FinancialTransactionList पेज असेल तर त्याचे इम्पोर्ट खालीलप्रमाणे करा:
// import FinancialTransactionList from './pages/FinancialTransactions/FinancialTransactionList';

// Purchase (POS System)
import CreatePurchase from './pages/Purchase/CreatePurchase';
import PurchaseList from './pages/Purchase/PurchaseList';
import EditPurchase from './pages/Purchase/EditPurchase';

// --- Food Formation (Recipe Master) ---
import FoodFormationList from './pages/FoodFormation/FoodFormationList';
import FoodFormationForm from './pages/FoodFormation/FoodFormationForm'; 

// --- Feed Precision (Production Module) ---
import FeedPrecisionList from './pages/FeedPrecision/FeedPrecisionList';
import FeedPrecisionForm from './pages/FeedPrecision/FeedPrecisionForm';

/**
 * Poultry 360 ERP - Main App Component
 * Updated: 2026-03-26 (Added Staff & Financial Transaction Routes)
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Route --- */}
        <Route path="/login" element={<Login />} />
        
        {/* --- Protected Routes - Wrapped in MainLayout --- */}
        
        {/* Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          } 
        />
        
        {/* --- Flocks Management --- */}
        <Route path="/flocks" element={<MainLayout><FlockList /></MainLayout>} />
        <Route path="/flocks/add" element={<MainLayout><AddFlock /></MainLayout>} />
        <Route path="/flocks/edit/:id" element={<MainLayout><EditFlock /></MainLayout>} />
        <Route path="/flocks/:flockId/vaccinations" element={<MainLayout><FlockVaccinations /></MainLayout>} />

        {/* --- Daily Logs --- */}
        <Route path="/daily-logs" element={<MainLayout><DailyLogList /></MainLayout>} />
        <Route path="/daily-logs/add" element={<MainLayout><AddDailyLog /></MainLayout>} />
        <Route path="/daily-logs/edit/:id" element={<MainLayout><EditDailyLog /></MainLayout>} />

        {/* --- Inventory Management --- */}
        <Route path="/inventory" element={<MainLayout><InventoryList /></MainLayout>} />
        <Route path="/inventory/add" element={<MainLayout><AddInventoryItem /></MainLayout>} />
        <Route path="/inventory/edit/:id" element={<MainLayout><EditInventoryItem /></MainLayout>} />

        {/* --- Staff Management --- */}
        <Route path="/staff" element={<MainLayout><StaffPage /></MainLayout>} />

        {/* --- Financial Transactions Module --- */}
        {/* १. नवीन ट्रान्झॅक्शन फॉर्म */}
        <Route path="/financial-transactions/new" element={<MainLayout><FinancialTransactionForm /></MainLayout>} />
        
        {/* २. ट्रान्झॅक्शन लिस्ट (जर बनवली असेल तर खालील राऊट वापरा) */}
        {/* <Route path="/financial-transactions" element={<MainLayout><FinancialTransactionList /></MainLayout>} /> */}

        {/* --- Purchase POS Module --- */}
        <Route path="/purchases" element={<MainLayout><PurchaseList /></MainLayout>} />
        <Route path="/purchase/create" element={<MainLayout><CreatePurchase /></MainLayout>} />
        <Route path="/purchase/edit/:id" element={<MainLayout><EditPurchase /></MainLayout>} />

        {/* --- Food Formation (Recipe Master) --- */}
        <Route path="/food-formations" element={<MainLayout><FoodFormationList /></MainLayout>} />
        <Route path="/food-formations/add" element={<MainLayout><FoodFormationForm /></MainLayout>} />
        <Route path="/food-formations/edit/:id" element={<MainLayout><FoodFormationForm /></MainLayout>} />

        {/* --- Feed Precision (Production) --- */}
        <Route path="/feed-precision" element={<MainLayout><FeedPrecisionList /></MainLayout>} />
        <Route path="/feed-precision/new" element={<MainLayout><FeedPrecisionForm /></MainLayout>} />
        <Route path="/feed-precision/edit/:id" element={<MainLayout><FeedPrecisionForm /></MainLayout>} />

        {/* --- Default & Catch-all Redirects --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
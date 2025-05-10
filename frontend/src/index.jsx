import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { TransactionProvider } from './TransactionContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import Settings from './pages/Settings';
import ProfileSettings from './pages/ProfileSettings';
import PrivacySettings from './pages/PrivacySettings';
import PreferencesSettings from './pages/PreferencesSettings';
import AccountSettings from './pages/AccountSettings';
import NotificationsSettings from './pages/NotificationsSettings';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutUs from './pages/AboutUs';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ErrorBoundary>
      <AuthProvider>
        <TransactionProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/add-transaction"
              element={<ProtectedRoute><AddTransaction /></ProtectedRoute>}
            />
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/settings"
              element={<ProtectedRoute><Settings /></ProtectedRoute>}
            />
            <Route
              path="/settings/profile"
              element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>}
            />
            <Route
              path="/settings/privacy"
              element={<ProtectedRoute><PrivacySettings /></ProtectedRoute>}
            />
            <Route
              path="/settings/preferences"
              element={<ProtectedRoute><PreferencesSettings /></ProtectedRoute>}
            />
            <Route
              path="/settings/account"
              element={<ProtectedRoute><AccountSettings /></ProtectedRoute>}
            />
            <Route
              path="/settings/notifications"
              element={<ProtectedRoute><NotificationsSettings /></ProtectedRoute>}
            />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </TransactionProvider>
      </AuthProvider>
    </ErrorBoundary>
  </BrowserRouter>
);
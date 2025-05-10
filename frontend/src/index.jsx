import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { TransactionProvider } from './TransactionContext';
import { UserProvider } from './UserContext';
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

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <UserProvider>
        <TransactionProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-transaction" element={<AddTransaction />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/profile" element={<ProfileSettings />} />
            <Route path="/settings/privacy" element={<PrivacySettings />} />
            <Route path="/settings/preferences" element={<PreferencesSettings />} />
            <Route path="/settings/account" element={<AccountSettings />} />
            <Route path="/settings/notifications" element={<NotificationsSettings />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
          <Footer />
        </TransactionProvider>
      </UserProvider>
    </AuthProvider>
  </BrowserRouter>
);
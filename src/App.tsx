import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import TaskDetails from './pages/TaskDetails';
import Wallet from './pages/Wallet';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Notifications from './pages/Notifications';
import ExtraEarn from './pages/ExtraEarn';
import TrustPage from './pages/TrustPage';
import ContactPage from './pages/ContactPage';
import FeedbackPage from './pages/FeedbackPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center font-sans">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
};

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-50 transition-colors duration-300">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/trust" element={<TrustPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute><Navbar /><Notifications /></ProtectedRoute>
              } />
              <Route path="/marketplace" element={
                <ProtectedRoute><Navbar /><Marketplace /></ProtectedRoute>
              } />
              <Route path="/earn" element={
                <ProtectedRoute><Navbar /><ExtraEarn /></ProtectedRoute>
              } />
            <Route path="/tasks/:id" element={
              <ProtectedRoute><Navbar /><TaskDetails /></ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute><Navbar /><Wallet /></ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute><Navbar /><Chat /></ProtectedRoute>
            } />
            <Route path="/chat/:roomId" element={
              <ProtectedRoute><Navbar /><Chat /></ProtectedRoute>
            } />
            <Route path="/profile/:uid" element={
              <ProtectedRoute><Navbar /><Profile /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute><Navbar /><AdminPanel /></ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

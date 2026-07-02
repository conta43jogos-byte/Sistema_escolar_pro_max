import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider } from '@/lib/AuthContext';

// Componentes
import ScrollToTop from '@/components/ScrollToTop';
import AppLayout from '@/components/Layout/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

// Páginas de Autenticação
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Páginas Principais
import Dashboard from '@/pages/Dashboard';
import Classes from '@/pages/Classes';
import Rooms from '@/pages/Rooms';
import Schedule from '@/pages/Schedule';
import Subjects from '@/pages/Subjects';
import Reports from '@/pages/Reports';
import Teachers from '@/pages/Teachers';

function AppRoutes() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Páginas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/teachers" element={<Teachers />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClientInstance}>
        <AuthProvider>
          <ScrollToTop />
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
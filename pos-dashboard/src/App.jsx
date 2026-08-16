import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/Layout';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import PosTerminal from './pages/PosTerminal';
import Orders from './pages/Orders';
import MenuItems from './pages/MenuItems';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Accounts from './pages/Accounts';

function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'staff') return <Navigate to="/orders" replace />;
  return <Navigate to="/pos" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RoleHome />} />

      <Route path="/pos" element={
        <ProtectedRoute roles={['cashier', 'admin']}><PosTerminal /></ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute roles={['cashier', 'staff', 'admin']}><Orders /></ProtectedRoute>
      } />
      <Route path="/menu" element={
        <ProtectedRoute roles={['admin']}><MenuItems /></ProtectedRoute>
      } />
      <Route path="/categories" element={
        <ProtectedRoute roles={['admin']}><Categories /></ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>
      } />
      <Route path="/accounts" element={
        <ProtectedRoute roles={['admin']}><Accounts /></ProtectedRoute>
      } />

      <Route path="*" element={<RoleHome />} />
    </Routes>
  );
}

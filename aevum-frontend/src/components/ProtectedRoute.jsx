import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../App';

export default function ProtectedRoute({ children }) {
  const { auth } = useApp();
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
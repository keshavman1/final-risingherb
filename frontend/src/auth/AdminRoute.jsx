import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }){
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <div className="alert alert-danger">Access denied — admin only</div>;
  return children;
}

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';

const UserProtectedRoute = ({ children, requireActiveMember = false }) => {
  const { user, loading } = useUserAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default UserProtectedRoute;
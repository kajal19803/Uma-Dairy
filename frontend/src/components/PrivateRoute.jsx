import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole'); // role stored as string like "admin" or "user"

  if (!token) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userRole !== 'admin') {
    // Logged in but not admin trying to access admin route
    return <Navigate to="/" replace />; // ya koi "Unauthorized" page
  }

  return children;
};

export default PrivateRoute;




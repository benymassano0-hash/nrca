import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ user, children, requiredRole }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.user_type !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default PrivateRoute;

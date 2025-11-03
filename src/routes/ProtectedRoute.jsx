'use client';

import React from 'react';

const ProtectedRoute = ({ children, requiredRole }) => {
  // Allow access to all routes without authentication for now
  return <>{children}</>;
};

export default ProtectedRoute;

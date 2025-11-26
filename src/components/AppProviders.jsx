'use client';

import React, { useState } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const AppProviders = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000,
      },
    },
  }));

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default AppProviders;

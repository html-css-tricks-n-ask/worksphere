import React, { } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});





export const ReactQueryProvider = ({ children }) => {
  return (
    React.createElement(QueryClientProvider, { client: queryClient,}
      , children
    )
  );
};

export default ReactQueryProvider;

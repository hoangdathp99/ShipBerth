"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  
  const queryCache = new QueryCache();
  const queryClient = new QueryClient({
    queryCache
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

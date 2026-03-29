import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            30_000, // 30 s — avoids refetches during DnD interactions
      retry:                1,
      refetchOnWindowFocus: false,
    },
  },
});
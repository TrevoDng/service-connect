// src/hooks/useSseConnection.ts
//
// Mount this ONCE at the app root (inside the authenticated shell) to
// open the SSE connection and keep it alive across route changes.
// Unmounts cleanly on logout.

import { useEffect } from 'react';
import { useAuth } from '../account/context/AuthContext';
import { sseClient } from '../services/sse.service';

export function useSseConnection(): void {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      sseClient.disconnect();
      return;
    }
    sseClient.connect();
    // Do not disconnect on unmount — leave it alive across route changes.
  }, [isAuthenticated]);
}
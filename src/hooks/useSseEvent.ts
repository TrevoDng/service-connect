// src/hooks/useSseEvent.ts
//
// Subscribe to an SSE event for the lifetime of the component.
// Also ensures the singleton connection is alive while at least one
// subscriber is mounted.

import { useEffect, useRef } from 'react';
import { sseClient } from '../services/sse.service';

export function useSseEvent(
  event: string,
  handler: (data: unknown) => void
): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const unsubscribe = sseClient.on(event, (data) => handlerRef.current(data));
    return unsubscribe;
  }, [event]);
}
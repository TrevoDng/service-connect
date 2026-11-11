// src/services/sse.service.ts
//
// Singleton EventSource wrapper. One connection per browser tab,
// authenticated via ?token=. Auto-reconnects with backoff. Subscribers
// receive named events (support:ticket:new, support:message:new,
// support:ticket:updated).

import { getToken } from '../account/context/AuthContext';

type Listener = (data: unknown) => void;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class SseClient {
  private es: EventSource | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private reconnectAttempt = 0;
  private reconnectTimer: number | null = null;
  private currentToken: string | null = null;
  private stopped = false;

  connect(): void {
    const token = getToken();
    if (!token) {
      this.disconnect();
      return;
    }
    if (this.es && this.currentToken === token) return; // already open with this token

    this.disconnect(); // tear down any stale connection
    this.currentToken = token;
    this.stopped = false;

    const url = `${API_BASE_URL}/events?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    this.es = es;

    es.onopen = () => {
  const wasReconnect = this.reconnectAttempt > 0;
  this.reconnectAttempt = 0;

  if (wasReconnect) {
    const set = this.listeners.get('sse:reconnected');
    if (set) set.forEach((fn) => fn(null));
  }
};

    // Subscribe to each named event we care about
    this.bindNamedEvent(es, 'support:ticket:new');
    this.bindNamedEvent(es, 'support:message:new');
    this.bindNamedEvent(es, 'support:ticket:updated');
    this.bindNamedEvent(es, 'chat:message:new');         
    this.bindNamedEvent(es, 'chat:thread:read');      
    this.bindNamedEvent(es, 'notification:new');
    this.bindNamedEvent(es, 'booking:created');
    this.bindNamedEvent(es, 'booking:updated');
    this.bindNamedEvent(es, 'worksession:updated');
    this.bindNamedEvent(es, 'dispute:created');
    this.bindNamedEvent(es, 'dispute:updated');
    this.bindNamedEvent(es, 'review:updated');
    this.bindNamedEvent(es, 'user:updated');
    this.bindNamedEvent(es, 'registration:updated');  

    es.onerror = () => {
      // EventSource auto-reconnects on transient errors, but if the
      // connection is fully closed we should back off and retry ourselves.
      if (es.readyState === EventSource.CLOSED) {
        this.scheduleReconnect();
      }
    };
  }

  disconnect(): void {
    this.stopped = true;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.es) {
      this.es.close();
      this.es = null;
    }
    this.currentToken = null;
  }

  on(event: string, listener: Listener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  private bindNamedEvent(es: EventSource, event: string): void {
    es.addEventListener(event, (e: MessageEvent) => {
      let data: unknown = null;
      try {
        data = JSON.parse(e.data);
      } catch {
        data = e.data;
      }
      const set = this.listeners.get(event);
      if (set) set.forEach((fn) => fn(data));
    });
  }

  private scheduleReconnect(): void {
    if (this.stopped) return;
    if (this.reconnectTimer !== null) return;

    const base = Math.min(30_000, 1_000 * 2 ** this.reconnectAttempt);
    const jitter = Math.random() * 500;
    const delay = base + jitter;
    this.reconnectAttempt++;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
}

export const sseClient = new SseClient();
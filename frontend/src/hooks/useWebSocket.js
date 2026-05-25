import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5001';

export function useWebSocket() {
  const [prices, setPrices] = useState({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('WS connected');
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);

          if (msg.type === 'snapshot') {
            // Initial snapshot: { prices: { btcusdt: {...}, ... } }
            setPrices(prev => ({ ...prev, ...msg.prices }));
          } else if (msg.type === 'price_update') {
            // Real-time update: { symbol: 'btcusdt', data: {...} }
            setPrices(prev => ({
              ...prev,
              [msg.symbol]: msg.data
            }));
          }
        } catch (err) {}
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimeout.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (err) {
      reconnectTimeout.current = setTimeout(connect, 5000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { prices, connected };
}

import { useCallback, useEffect, useRef, useState } from 'react';
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}
export interface WebSocketHook {
  socket: WebSocket | null;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: WebSocketMessage) => void;
  reconnect: () => void;
  error: string | null;
}
export const useWebSocket = (
  url: string,
  options?: {
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    onMessage?: (message: WebSocketMessage) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
  }
): WebSocketHook => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const {
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options || {};
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    setConnectionStatus('connecting');
    setError(null);
    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;
      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        reconnectAttempts.current = 0;
        onConnect?.();
      };
      ws.onmessage = event => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (err) {
          setError('Invalid message format');
        }
      };
      ws.onclose = event => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        onDisconnect?.();
        // Auto-reconnect if not a clean close
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          reconnectAttempts.current++;
          //   `Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`
          // );
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionStatus('error');
          setError('Max reconnection attempts reached');
        }
      };
      ws.onerror = event => {
        setConnectionStatus('error');
        setError('Connection error');
        onError?.(event);
      };
      setSocket(ws);
    } catch (err) {
      setConnectionStatus('error');
      setError('Failed to create connection');
    }
  }, [
    url,
    reconnectInterval,
    maxReconnectAttempts,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  ]);
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close(1000, 'Manual disconnect');
      socketRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setSocket(null);
  }, []);
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify(message));
      } catch (err) {
        setError('Failed to send message');
      }
    } else {
      setError('Not connected');
    }
  }, []);
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    setTimeout(connect, 100);
  }, [disconnect, connect]);
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  return {
    socket,
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    reconnect,
    error,
  };
};

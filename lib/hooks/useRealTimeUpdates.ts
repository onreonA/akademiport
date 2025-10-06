import { useCallback, useRef } from 'react';

import { useWebSocket, WebSocketMessage } from './useWebSocket';
interface RealTimeUpdate {
  type:
    | 'project_update'
    | 'task_update'
    | 'comment_added'
    | 'file_uploaded'
    | 'notification';
  data: any;
  timestamp: number;
}
interface UseRealTimeUpdatesOptions {
  projectId?: string;
  userId?: string;
  onProjectUpdate?: (data: any) => void;
  onTaskUpdate?: (data: any) => void;
  onCommentAdded?: (data: any) => void;
  onFileUploaded?: (data: any) => void;
  onNotification?: (data: any) => void;
}
export const useRealTimeUpdates = (options: UseRealTimeUpdatesOptions = {}) => {
  const lastUpdateRef = useRef<number>(0);
  const {
    projectId,
    userId,
    onProjectUpdate,
    onTaskUpdate,
    onCommentAdded,
    onFileUploaded,
    onNotification,
  } = options;
  // WebSocket URL - gerçek projede bu URL backend'den gelecek
  const wsUrl =
    process.env.NODE_ENV === 'development'
      ? 'ws://localhost:3001/ws'
      : 'wss://your-domain.com/ws';
  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      const update = message as RealTimeUpdate;
      // Duplicate message check
      if (update.timestamp <= lastUpdateRef.current) {
        return;
      }
      lastUpdateRef.current = update.timestamp;
      // Filter by project ID if specified
      if (
        projectId &&
        update.data?.projectId &&
        update.data.projectId !== projectId
      ) {
        return;
      }
      // Filter by user ID if specified
      if (userId && update.data?.userId && update.data.userId !== userId) {
        return;
      }
      switch (update.type) {
        case 'project_update':
          handleProjectUpdate(update.data);
          onProjectUpdate?.(update.data);
          break;
        case 'task_update':
          handleTaskUpdate(update.data);
          onTaskUpdate?.(update.data);
          break;
        case 'comment_added':
          handleCommentAdded(update.data);
          onCommentAdded?.(update.data);
          break;
        case 'file_uploaded':
          handleFileUploaded(update.data);
          onFileUploaded?.(update.data);
          break;
        case 'notification':
          handleNotification(update.data);
          onNotification?.(update.data);
          break;
        default:
      }
    },
    [
      projectId,
      userId,
      onProjectUpdate,
      onTaskUpdate,
      onCommentAdded,
      onFileUploaded,
      onNotification,
    ]
  );
  const handleProjectUpdate = useCallback((data: any) => {
    // Toast bildirimi component seviyesinde yapılacak
  }, []);
  const handleTaskUpdate = useCallback((data: any) => {
    // Toast bildirimi component seviyesinde yapılacak
  }, []);
  const handleCommentAdded = useCallback((data: any) => {
    // Toast bildirimi component seviyesinde yapılacak
  }, []);
  const handleFileUploaded = useCallback((data: any) => {
    // Toast bildirimi component seviyesinde yapılacak
  }, []);
  const handleNotification = useCallback((data: any) => {
    // Toast bildirimi component seviyesinde yapılacak
  }, []);
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'tamamlandı';
      case 'in_progress':
        return 'devam ediyor';
      case 'pending':
        return 'beklemede';
      case 'cancelled':
        return 'iptal edildi';
      default:
        return status;
    }
  };
  const getNotificationType = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };
  const { isConnected, connectionStatus, sendMessage, reconnect, error } =
    useWebSocket(wsUrl, {
      onMessage: handleMessage,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
    });
  const sendUpdate = useCallback(
    (type: string, data: any) => {
      const message: WebSocketMessage = {
        type,
        data: {
          ...data,
          timestamp: Date.now(),
          userId,
          projectId,
        },
        timestamp: Date.now(),
      };
      sendMessage(message);
    },
    [sendMessage, userId, projectId]
  );
  return {
    isConnected,
    connectionStatus,
    error,
    reconnect,
    sendUpdate,
  };
};

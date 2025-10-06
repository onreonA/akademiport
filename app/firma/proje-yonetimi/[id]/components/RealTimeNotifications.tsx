'use client';
import { useCallback, useEffect, useState } from 'react';
import { RiWifiLine, RiWifiOffLine } from 'react-icons/ri';
interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task' | 'file' | 'project';
  isRead: boolean;
  createdAt: string;
  projectId?: string;
  taskId?: string;
  fileId?: string;
  userId?: string;
}
interface RealTimeNotificationsProps {
  projectId: string;
  onNotificationReceived: (notification: Notification) => void;
  onConnectionStatusChange: (connected: boolean) => void;
}
export default function RealTimeNotifications({
  projectId,
  onNotificationReceived,
  onConnectionStatusChange,
}: RealTimeNotificationsProps) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastPing, setLastPing] = useState<Date | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds
  const connectWebSocket = useCallback(() => {
    try {
      // Mock WebSocket URL - in production, this would be your actual WebSocket server
      const wsUrl = `ws://localhost:3000/ws/projects/${projectId}`;
      const websocket = new WebSocket(wsUrl);
      websocket.onopen = () => {
        setConnected(true);
        setReconnectAttempts(0);
        onConnectionStatusChange(true);
        // Send authentication if needed
        websocket.send(
          JSON.stringify({
            type: 'auth',
            projectId: projectId,
            timestamp: new Date().toISOString(),
          })
        );
      };
      websocket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'notification':
              const notification: Notification = {
                id: data.id || `notif_${Date.now()}`,
                title: data.title,
                content: data.content,
                type: data.notificationType || 'info',
                isRead: false,
                createdAt: data.createdAt || new Date().toISOString(),
                projectId: data.projectId,
                taskId: data.taskId,
                fileId: data.fileId,
                userId: data.userId,
              };
              onNotificationReceived(notification);
              break;
            case 'ping':
              setLastPing(new Date());
              websocket.send(JSON.stringify({ type: 'pong' }));
              break;
            case 'task_update':
              // Handle task updates
              onNotificationReceived({
                id: `task_${data.taskId}_${Date.now()}`,
                title: 'Görev Güncellendi',
                content: `"${data.taskTitle}" görevi ${data.status} durumuna geçti.`,
                type: 'task',
                isRead: false,
                createdAt: new Date().toISOString(),
                projectId: data.projectId,
                taskId: data.taskId,
              });
              break;
            case 'file_upload':
              // Handle file uploads
              onNotificationReceived({
                id: `file_${data.fileId}_${Date.now()}`,
                title: 'Yeni Dosya Yüklendi',
                content: `"${data.fileName}" dosyası projeye yüklendi.`,
                type: 'file',
                isRead: false,
                createdAt: new Date().toISOString(),
                projectId: data.projectId,
                fileId: data.fileId,
              });
              break;
            case 'comment_added':
              // Handle new comments
              onNotificationReceived({
                id: `comment_${data.commentId}_${Date.now()}`,
                title: 'Yeni Yorum',
                content: `${data.author} projeye yorum ekledi.`,
                type: 'info',
                isRead: false,
                createdAt: new Date().toISOString(),
                projectId: data.projectId,
              });
              break;
            default:
          }
        } catch (error) {}
      };
      websocket.onclose = event => {
        setConnected(false);
        onConnectionStatusChange(false);
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, reconnectDelay);
        }
      };
      websocket.onerror = error => {
        setConnected(false);
        onConnectionStatusChange(false);
      };
      setWs(websocket);
    } catch (error) {
      setConnected(false);
      onConnectionStatusChange(false);
    }
  }, [
    projectId,
    onNotificationReceived,
    onConnectionStatusChange,
    reconnectAttempts,
  ]);
  const disconnectWebSocket = useCallback(() => {
    if (ws) {
      ws.close(1000, 'Component unmounting');
      setWs(null);
    }
  }, [ws]);
  const sendMessage = useCallback(
    (message: any) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    },
    [ws]
  );
  // Connect on mount
  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);
  // Ping interval to keep connection alive
  useEffect(() => {
    if (connected && ws) {
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000); // Ping every 30 seconds
      return () => clearInterval(pingInterval);
    }
  }, [connected, ws]);
  // Mock real-time notifications for development
  useEffect(() => {
    if (connected) {
      const mockNotifications = [
        {
          id: `mock_${Date.now()}`,
          title: 'Proje Güncellendi',
          content: "Proje ilerlemesi %70'e ulaştı.",
          type: 'success',
          isRead: false,
          createdAt: new Date().toISOString(),
          projectId: projectId,
        },
      ];
      // Send mock notification after 5 seconds
      const timer = setTimeout(() => {
        mockNotifications.forEach(notification => {
          onNotificationReceived(notification as any);
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [connected, projectId, onNotificationReceived]);
  return (
    <div className='flex items-center space-x-2 text-sm'>
      <div className='flex items-center space-x-1'>
        {connected ? (
          <RiWifiLine className='h-4 w-4 text-green-500' />
        ) : (
          <RiWifiOffLine className='h-4 w-4 text-red-500' />
        )}
        <span className={connected ? 'text-green-600' : 'text-red-600'}>
          {connected ? 'Canlı Bağlantı' : 'Bağlantı Kesik'}
        </span>
      </div>
      {reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts && (
        <span className='text-yellow-600 text-xs'>
          Yeniden bağlanıyor... ({reconnectAttempts}/{maxReconnectAttempts})
        </span>
      )}
      {lastPing && (
        <span className='text-gray-500 text-xs'>
          Son ping: {lastPing.toLocaleTimeString('tr-TR')}
        </span>
      )}
    </div>
  );
}

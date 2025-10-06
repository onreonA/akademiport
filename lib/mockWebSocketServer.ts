// Mock WebSocket Server for development
// Bu dosya sadece development ortamında kullanılır
export class MockWebSocketServer {
  private static instance: MockWebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private intervalId: NodeJS.Timeout | null = null;
  private constructor() {
    this.startMockUpdates();
  }
  public static getInstance(): MockWebSocketServer {
    if (!MockWebSocketServer.instance) {
      MockWebSocketServer.instance = new MockWebSocketServer();
    }
    return MockWebSocketServer.instance;
  }
  public addClient(client: WebSocket) {
    this.clients.add(client);
  }
  public removeClient(client: WebSocket) {
    this.clients.delete(client);
  }
  public broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
  private startMockUpdates() {
    // Her 30 saniyede bir mock güncelleme gönder
    this.intervalId = setInterval(() => {
      this.sendMockUpdate();
    }, 30000);
  }
  private sendMockUpdate() {
    const updates = [
      {
        type: 'project_update',
        data: {
          projectId: '1',
          projectName: 'E-ticaret Platformu Geliştirme',
          changes: ['İlerleme güncellendi', 'Yeni görev eklendi'],
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      },
      {
        type: 'task_update',
        data: {
          projectId: '1',
          taskId: Math.floor(Math.random() * 3) + 1,
          taskName: 'Ana Sayfa Tasarımı',
          status: 'completed',
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      },
      {
        type: 'comment_added',
        data: {
          projectId: '1',
          authorName: 'Ahmet Yılmaz',
          comment: 'Proje ilerlemesi çok iyi gidiyor!',
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      },
      {
        type: 'file_uploaded',
        data: {
          projectId: '1',
          fileName: 'tasarim-v2.pdf',
          fileSize: '2.5 MB',
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      },
      {
        type: 'notification',
        data: {
          title: 'Proje Hatırlatması',
          message: 'Yarın proje toplantısı var!',
          type: 'info',
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      },
    ];
    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
    this.broadcast(randomUpdate);
  }
  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
// Mock WebSocket implementation
export class MockWebSocket {
  public readyState: number = WebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  constructor(public url: string) {
    // Simulate connection delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.onopen?.(new Event('open'));
      // Add to mock server
      const server = MockWebSocketServer.getInstance();
      server.addClient(this as any);
    }, 100);
  }
  public send(data: string) {}
  public close(code?: number, reason?: string) {
    this.readyState = WebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code, reason }));
    // Remove from mock server
    const server = MockWebSocketServer.getInstance();
    server.removeClient(this as any);
  }
}
// Development ortamında WebSocket'i mock ile değiştir
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalWebSocket = window.WebSocket;
  // Mock WebSocket'i gerçek WebSocket interface'i ile uyumlu hale getir
  (MockWebSocket as any).CONNECTING = 0;
  (MockWebSocket as any).OPEN = 1;
  (MockWebSocket as any).CLOSING = 2;
  (MockWebSocket as any).CLOSED = 3;
  window.WebSocket = MockWebSocket as any;
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    MockWebSocketServer.getInstance().stop();
  });
}

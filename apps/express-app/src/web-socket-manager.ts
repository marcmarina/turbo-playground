import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Client connected');
      this.clients.add(ws);

      ws.on('message', (message: string) => {
        console.log('Received:', message.toString());

        this.handleMessage(ws, message.toString());
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      this.sendToClient(ws, { type: 'welcome', data: 'Connected to server' });
    });
  }

  private handleMessage(ws: WebSocket, message: string) {
    try {
      const data = JSON.parse(message);

      // Handle different message types here or emit events
      console.log('Parsed message:', data);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  // Send to a specific client
  sendToClient(ws: WebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  // Broadcast to all connected clients
  broadcast(data: any, excludeClient?: WebSocket) {
    const message = JSON.stringify(data);
    this.clients.forEach((client) => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Send to specific clients matching a condition
  sendToMatching(predicate: (client: WebSocket) => boolean, data: any) {
    const message = JSON.stringify(data);
    this.clients.forEach((client) => {
      if (predicate(client) && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Get all connected clients
  getClients(): Set<WebSocket> {
    return this.clients;
  }

  // Get number of connected clients
  getClientCount(): number {
    return this.clients.size;
  }
}

export const webSocketManager = new WebSocketManager();

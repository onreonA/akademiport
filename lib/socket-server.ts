import { Server as NetServer } from 'http';

import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
export interface SocketServer extends SocketIOServer {}
export interface SocketWithIO {
  socket: {
    server: NetServer & {
      io: SocketServer;
    };
  };
}
export interface NextApiResponseWithSocket {
  socket: {
    server: NetServer & {
      io: SocketServer;
    };
  };
}
export const config = {
  api: {
    bodyParser: false,
  },
};
const SocketHandler = (req: SocketWithIO, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    (res as any).end();
    return;
  }
  const io = new SocketIOServer(res.socket.server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });
  res.socket.server.io = io;
  io.on('connection', socket => {
    // Join user to their company room
    socket.on('join-company', (companyId: string) => {
      socket.join(`company-${companyId}`);
    });
    // Join admin to admin room
    socket.on('join-admin', () => {
      socket.join('admin-room');
    });
    // Handle appointment status updates
    socket.on('appointment-updated', data => {
      const { companyId, appointmentId, status, consultantId } = data;
      // Notify company about appointment update
      if (companyId) {
        io.to(`company-${companyId}`).emit('appointment-status-changed', {
          appointmentId,
          status,
          consultantId,
          timestamp: new Date().toISOString(),
        });
      }
      // Notify admin about appointment update
      io.to('admin-room').emit('appointment-updated', {
        appointmentId,
        status,
        companyId,
        timestamp: new Date().toISOString(),
      });
    });
    // Handle new appointment creation
    socket.on('appointment-created', data => {
      const { companyId, appointmentId, title } = data;
      // Notify admin about new appointment
      io.to('admin-room').emit('new-appointment', {
        appointmentId,
        companyId,
        title,
        timestamp: new Date().toISOString(),
      });
    });
    // Handle consultant assignment
    socket.on('consultant-assigned', data => {
      const { companyId, appointmentId, consultantId, consultantName } = data;
      // Notify company about consultant assignment
      if (companyId) {
        io.to(`company-${companyId}`).emit('consultant-assigned', {
          appointmentId,
          consultantId,
          consultantName,
          timestamp: new Date().toISOString(),
        });
      }
    });
    // Handle disconnection
    socket.on('disconnect', () => {});
  });
  res.end();
};
export default SocketHandler;

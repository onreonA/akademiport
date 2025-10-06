'use client';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
interface UseSocketOptions {
  companyId?: string;
  isAdmin?: boolean;
  onAppointmentStatusChanged?: (data: any) => void;
  onConsultantAssigned?: (data: any) => void;
  onNewAppointment?: (data: any) => void;
  onAppointmentUpdated?: (data: any) => void;
}
export const useSocket = ({
  companyId,
  isAdmin = false,
  onAppointmentStatusChanged,
  onConsultantAssigned,
  onNewAppointment,
  onAppointmentUpdated,
}: UseSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    // Initialize socket connection
    const socket = io(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      {
        transports: ['websocket', 'polling'],
      }
    );
    socketRef.current = socket;
    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
    });
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    // Join appropriate room
    if (isAdmin) {
      socket.emit('join-admin');
    } else if (companyId) {
      socket.emit('join-company', companyId);
    }
    // Listen for appointment status changes
    socket.on('appointment-status-changed', data => {
      setLastMessage(data);
      onAppointmentStatusChanged?.(data);
    });
    // Listen for consultant assignments
    socket.on('consultant-assigned', data => {
      setLastMessage(data);
      onConsultantAssigned?.(data);
    });
    // Listen for new appointments (admin only)
    socket.on('new-appointment', data => {
      setLastMessage(data);
      onNewAppointment?.(data);
    });
    // Listen for appointment updates (admin only)
    socket.on('appointment-updated', data => {
      setLastMessage(data);
      onAppointmentUpdated?.(data);
    });
    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [
    companyId,
    isAdmin,
    onAppointmentStatusChanged,
    onConsultantAssigned,
    onNewAppointment,
    onAppointmentUpdated,
  ]);
  // Emit functions
  const emitAppointmentUpdated = (data: any) => {
    if (socketRef.current) {
      socketRef.current.emit('appointment-updated', data);
    }
  };
  const emitAppointmentCreated = (data: any) => {
    if (socketRef.current) {
      socketRef.current.emit('appointment-created', data);
    }
  };
  const emitConsultantAssigned = (data: any) => {
    if (socketRef.current) {
      socketRef.current.emit('consultant-assigned', data);
    }
  };
  return {
    isConnected,
    lastMessage,
    emitAppointmentUpdated,
    emitAppointmentCreated,
    emitConsultantAssigned,
  };
};

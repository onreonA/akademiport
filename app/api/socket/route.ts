import { NextRequest, NextResponse } from 'next/server';

import SocketHandler from '@/lib/socket-server';
export async function GET(req: NextRequest) {
  // This is a placeholder for the socket connection
  // The actual socket connection is handled by SocketHandler
  return NextResponse.json({ message: 'Socket endpoint' });
}
export async function POST(req: NextRequest) {
  // This is a placeholder for the socket connection
  // The actual socket connection is handled by SocketHandler
  return NextResponse.json({ message: 'Socket endpoint' });
}

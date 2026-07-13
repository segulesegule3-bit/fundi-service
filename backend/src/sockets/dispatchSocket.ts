import { Server, Socket } from 'socket.io';
import { GPSService } from '../services/gpsService';
import logger from '../config/logger';

export class DispatchSocket {
  private static ioServer: Server;
  private static userSockets = new Map<string, string>(); // Maps userId -> socketId

  /**
   * Initializes the GPS Dispatch Socket listener channel
   */
  public static init(io: Server) {
    DispatchSocket.ioServer = io;

    io.on('connection', (socket: Socket) => {
      // Authenticated User Connection hook
      socket.on('auth:connect', (data: { userId: string }) => {
        if (data.userId) {
          DispatchSocket.userSockets.set(data.userId, socket.id);
          logger.info(`[Socket connected] User ${data.userId} connected on socket ID: ${socket.id}`);
        }
      });

      // 1. Live GPS updates sent by Fundi mobile app
      socket.on('location:update', async (data: { fundiId: string; latitude: number; longitude: number }) => {
        const { fundiId, latitude, longitude } = data;
        if (!fundiId || !latitude || !longitude) return;

        // Run validation speed checker
        const accepted = await GPSService.updateLocation(fundiId, latitude, longitude);

        if (accepted) {
          // Broadcast live coordinates to tracking client listeners in the booking room
          io.to(`booking_tracking_${fundiId}`).emit('fundi:location:update', {
            fundiId,
            latitude,
            longitude,
            timestamp: Date.now(),
          });
        }
      });

      // 2. Client joins a job live tracking room
      socket.on('join_tracking_room', (data: { bookingId: string; fundiId: string }) => {
        if (data.bookingId && data.fundiId) {
          socket.join(`booking_tracking_${data.fundiId}`);
          logger.info(`[Socket Room] Socket ${socket.id} joined tracking room for Fundi ${data.fundiId}`);
        }
      });

      socket.on('disconnect', () => {
        // Purge reference upon connection drop
        for (const [userId, socketId] of DispatchSocket.userSockets.entries()) {
          if (socketId === socket.id) {
            DispatchSocket.userSockets.delete(userId);
            break;
          }
        }
      });
    });
  }

  /**
   * Pushes a real-time event packet directly to a specific user's connection
   */
  public static sendToUser(userId: string, event: string, payload: any): boolean {
    const socketId = DispatchSocket.userSockets.get(userId);
    if (socketId && DispatchSocket.ioServer) {
      DispatchSocket.ioServer.to(socketId).emit(event, payload);
      return true;
    }
    return false;
  }
}

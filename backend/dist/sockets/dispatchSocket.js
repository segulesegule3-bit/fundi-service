"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchSocket = void 0;
const gpsService_1 = require("../services/gpsService");
const logger_1 = __importDefault(require("../config/logger"));
class DispatchSocket {
    static ioServer;
    static userSockets = new Map(); // Maps userId -> socketId
    /**
     * Initializes the GPS Dispatch Socket listener channel
     */
    static init(io) {
        DispatchSocket.ioServer = io;
        io.on('connection', (socket) => {
            // Authenticated User Connection hook
            socket.on('auth:connect', (data) => {
                if (data.userId) {
                    DispatchSocket.userSockets.set(data.userId, socket.id);
                    logger_1.default.info(`[Socket connected] User ${data.userId} connected on socket ID: ${socket.id}`);
                }
            });
            // 1. Live GPS updates sent by Fundi mobile app
            socket.on('location:update', async (data) => {
                const { fundiId, latitude, longitude } = data;
                if (!fundiId || !latitude || !longitude)
                    return;
                // Run validation speed checker
                const accepted = await gpsService_1.GPSService.updateLocation(fundiId, latitude, longitude);
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
            socket.on('join_tracking_room', (data) => {
                if (data.bookingId && data.fundiId) {
                    socket.join(`booking_tracking_${data.fundiId}`);
                    logger_1.default.info(`[Socket Room] Socket ${socket.id} joined tracking room for Fundi ${data.fundiId}`);
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
    static sendToUser(userId, event, payload) {
        const socketId = DispatchSocket.userSockets.get(userId);
        if (socketId && DispatchSocket.ioServer) {
            DispatchSocket.ioServer.to(socketId).emit(event, payload);
            return true;
        }
        return false;
    }
}
exports.DispatchSocket = DispatchSocket;

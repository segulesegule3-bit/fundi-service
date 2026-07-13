import { Server, Socket } from 'socket.io';
import { db } from '../db';
import { AuthService } from '../services/authService';

interface UserLocation {
  latitude: number;
  longitude: number;
  bookingId: string;
}

// In-memory cache to track last location and timestamp of online fundis: userId -> { lat, lng, time }
const lastKnownLocations = new Map<string, { lat: number; lng: number; time: number }>();

export class ChatSocket {
  // Map to hold online users and their socket IDs: userId -> socketId
  private static activeConnections = new Map<string, string>();

  public static init(io: Server): void {
    io.on('connection', (socket: Socket) => {
      let currentUserId: string | null = null;

      console.log(`[WebSocket] New client connected: ${socket.id}`);

      // 1. Authenticate / Register User Session using JWT
      socket.on('authenticate', async (data: { token: string }) => {
        const { token } = data;
        const decoded = AuthService.verifyToken(token);
        
        if (!decoded) {
          socket.emit('error', { message: 'Authentication failed: Invalid JWT token' });
          socket.disconnect(true);
          return;
        }

        currentUserId = decoded.id;
        this.activeConnections.set(decoded.id, socket.id);

        console.log(`[WebSocket] User authenticated: ${decoded.id} (${decoded.fullName})`);

        // Update online status in database
        await db.query(
          `UPDATE fundi_profiles SET online_status = true, last_seen = NOW() WHERE user_id = $1`,
          [decoded.id]
        );

        // Broadcast online status to everyone
        socket.broadcast.emit('user_status_changed', { userId: decoded.id, status: 'online' });
      });

      // 2. Joining Chat Room
      socket.on('join_chat', (data: { chatId: string }) => {
        const { chatId } = data;
        socket.join(chatId);
        console.log(`[WebSocket] Socket ${socket.id} joined chat room: ${chatId}`);
      });

      // 3. Typings Indicators
      socket.on('typing', (data: { chatId: string; userId: string; isTyping: boolean }) => {
        socket.to(data.chatId).emit('typing', data);
      });

      // 4. Send Message event
      socket.on('send_message', async (data: {
        chatId: string;
        senderId: string;
        receiverId: string;
        text?: string;
        attachmentUrl?: string;
        attachmentType?: string;
        latitude?: number;
        longitude?: number;
      }) => {
        const { chatId, senderId, receiverId, text, attachmentUrl, attachmentType, latitude, longitude } = data;

        // Verify WebSocket connection state matches sender ID
        if (currentUserId !== senderId) {
          socket.emit('error', { message: 'Access Denied: Connection identity mismatch' });
          return;
        }

        try {
          // Save message to database
          const messageRes = await db.query(
            `INSERT INTO messages (chat_id, sender_id, text, attachment_url, attachment_type, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [chatId, senderId, text || null, attachmentUrl || null, attachmentType || null, latitude || null, longitude || null]
          );

          const savedMessage = messageRes.rows[0];

          // Update last message in chat summary
          await db.query(
            `UPDATE chats SET last_message = $1, last_message_at = NOW() WHERE id = $2`,
            [text || `[Attachment: ${attachmentType}]`, chatId]
          );

          // Broadcast to the chat room
          io.to(chatId).emit('new_message', savedMessage);

          // Also trigger push notification or alert if the receiver is not in the room
          const receiverSocketId = this.activeConnections.get(receiverId);
          if (!receiverSocketId) {
            console.log(`[WebSocket] Recipient ${receiverId} offline. Trigger push notification for message.`);
          }
        } catch (error) {
          console.error('[WebSocket] Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // 5. Read Receipt
      socket.on('mark_read', async (data: { messageIds: string[]; chatId: string; userId: string }) => {
        const { messageIds, chatId, userId } = data;
        if (currentUserId !== userId) return;

        try {
          await db.query(
            `UPDATE messages SET is_read = true, read_at = NOW() 
             WHERE id = ANY($1) AND sender_id != $2`,
            [messageIds, userId]
          );
          io.to(chatId).emit('messages_read', { messageIds, readerId: userId });
        } catch (error) {
          console.error('[WebSocket] Error marking messages read:', error);
        }
      });

      // 6. Live Location Sharing (GPS Tracking for Fundis On The Way)
      socket.on('share_location', async (data: UserLocation) => {
        const { latitude, longitude, bookingId } = data;
        if (!currentUserId) return;

        // Impossible Movement Detector (GPS Location Spoofing Protection)
        const now = Date.now();
        const prev = lastKnownLocations.get(currentUserId);

        if (prev) {
          // Haversine formula to compute distance in km
          const R = 6371;
          const dLat = (latitude - prev.lat) * Math.PI / 180;
          const dLon = (longitude - prev.lng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(prev.lat * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distanceKm = R * c;

          const timeDiffHrs = (now - prev.time) / (1000 * 60 * 60);

          if (timeDiffHrs > 0) {
            const speedKmh = distanceKm / timeDiffHrs;

            // Reject if speed exceeds 150 km/h for movements > 500 meters (spoof filter)
            if (speedKmh > 150 && distanceKm > 0.5) {
              console.warn(`[GPS Spoof Alert] User ${currentUserId} moved ${distanceKm.toFixed(2)} km in ${(timeDiffHrs * 60).toFixed(1)} mins (${speedKmh.toFixed(1)} km/h)`);
              socket.emit('error', { message: 'GPS spoofing detected: Movement is physically impossible' });
              return;
            }
          }
        }

        // Cache current location
        lastKnownLocations.set(currentUserId, { lat: latitude, lng: longitude, time: now });

        console.log(`[GPS Tracking] Booking ${bookingId} location: [${latitude}, ${longitude}] from Fundi ${currentUserId}`);

        // Update Fundi location in database
        const pointGeo = `SRID=4326;POINT(${longitude} ${latitude})`;
        await db.query(
          `UPDATE fundi_profiles 
           SET gps_location = ST_GeomFromEWKT($1), last_seen = NOW() 
           WHERE user_id = $2`,
          [pointGeo, currentUserId]
        );

        // Broadcast coordinates to everyone tracking this booking
        io.to(`track_${bookingId}`).emit('location_update', {
          bookingId,
          latitude,
          longitude,
          timestamp: new Date()
        });
      });

      // Join tracking room
      socket.on('track_booking', (data: { bookingId: string }) => {
        socket.join(`track_${data.bookingId}`);
        console.log(`[WebSocket] Customer joined tracking room for booking: ${data.bookingId}`);
      });

      // Leave tracking room
      socket.on('untrack_booking', (data: { bookingId: string }) => {
        socket.leave(`track_${data.bookingId}`);
        console.log(`[WebSocket] Customer left tracking room for booking: ${data.bookingId}`);
      });

      // 7. Disconnection Clean Up
      socket.on('disconnect', async () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
        if (currentUserId) {
          this.activeConnections.delete(currentUserId);
          lastKnownLocations.delete(currentUserId); // Clean cache

          // Update online status in database
          await db.query(
            `UPDATE fundi_profiles SET online_status = false, last_seen = NOW() WHERE user_id = $1`,
            [currentUserId]
          );

          // Broadcast offline status
          socket.broadcast.emit('user_status_changed', { userId: currentUserId, status: 'offline' });
        }
      });
    });
  }

  /**
   * Check if a specific user is currently online
   */
  public static isUserOnline(userId: string): boolean {
    return this.activeConnections.has(userId);
  }
}

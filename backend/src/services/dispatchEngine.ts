import prisma from '../config/prisma';
import logger from '../config/logger';
import { GPSService } from './gpsService';
import { AIService } from './aiService';
import { DispatchSocket } from '../sockets/dispatchSocket';
import { BookingStatus } from '@prisma/client';

export class DispatchEngine {
  private static activeDispatches = new Map<string, NodeJS.Timeout>();

  /**
   * Dispatches a booking job request in incremental radius waves
   */
  public static async dispatchBooking(bookingId: string, waveAttempt: number = 1): Promise<void> {
    const radiusSteps = [1, 3, 5, 10]; // Radii: 1km, 3km, 5km, 10km
    if (waveAttempt > radiusSteps.length) {
      logger.info(`[Dispatch Engine] No available fundi accepted booking #${bookingId} after expanding to 10km.`);
      // Update Booking status to CANCELLED/UNASSIGNED
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.REJECTED },
      });
      return;
    }

    const currentRadius = radiusSteps[waveAttempt - 1];
    logger.info(`[Dispatch Engine] Initiating wave #${waveAttempt} for booking #${bookingId} within ${currentRadius}km`);

    // 1. Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true },
    });

    if (!booking || booking.status !== BookingStatus.PENDING) {
      return; // Booking already accepted or deleted
    }

    // Mock customer coordinate lookup (Mikocheni location center)
    const clientLat = -6.7823;
    const clientLng = 39.2612;

    // 2. Search for nearby online fundis
    const nearbyFundis = await GPSService.findNearbyFundis(clientLat, clientLng, currentRadius);

    if (nearbyFundis.length === 0) {
      // No fundis found: immediately jump to next wave
      logger.info(`[Dispatch Engine] No online fundis within ${currentRadius}km. Expanding radius...`);
      await DispatchEngine.dispatchBooking(bookingId, waveAttempt + 1);
      return;
    }

    // Sort by AI Match Score instead of purely distance!
    const scoredFundis = nearbyFundis.map(fundi => {
      const matchScore = AIService.calculateMatchScore(fundi.fundiId, clientLat, clientLng, parseFloat(fundi.rating || '4.0'));
      return { ...fundi, matchScore };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Filter top 5 scored candidates
    const candidates = scoredFundis.slice(0, 5);

    for (const candidate of candidates) {
      // Log invitation in JobDispatchQueue
      await prisma.jobDispatchQueue.create({
        data: {
          jobId: bookingId,
          fundiId: candidate.fundiId,
          status: 'SENT',
          attemptNumber: waveAttempt,
        },
      });

      // Emit new job WebSocket event to Fundi's private client room
      DispatchSocket.sendToUser(candidate.fundiId, 'job:new', {
        bookingId,
        description: booking.description,
        servicePrice: booking.servicePrice,
        customerName: booking.customer.id, // ID reference
        distance: candidate.distance,
      });
    }

    // 3. Set a 30-second wave timeout for this dispatch attempt
    const timeout = setTimeout(async () => {
      const refreshedBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      // If still pending, expand radius to next wave
      if (refreshedBooking && refreshedBooking.status === BookingStatus.PENDING) {
        logger.info(`[Dispatch Engine] Wave #${waveAttempt} timeout for booking #${bookingId}. Expanding radius...`);
        await DispatchEngine.dispatchBooking(bookingId, waveAttempt + 1);
      }
    }, 30000);

    DispatchEngine.activeDispatches.set(bookingId, timeout);
  }

  /**
   * Cancels active timeouts when a fundi accepts the job
   */
  public static clearDispatch(bookingId: string) {
    const timeout = DispatchEngine.activeDispatches.get(bookingId);
    if (timeout) {
      clearTimeout(timeout);
      DispatchEngine.activeDispatches.delete(bookingId);
    }
  }
}

import { Request, Response } from 'express';
import { GPSService } from '../services/gpsService';
import { DispatchEngine } from '../services/dispatchEngine';
import { DispatchSocket } from '../sockets/dispatchSocket';
import prisma from '../config/prisma';
import { BookingStatus } from '@prisma/client';

export class DispatchController {
  /**
   * Update current fundi location via REST fallback
   */
  public static async updateLocation(req: Request, res: Response): Promise<void> {
    const { fundiId, latitude, longitude } = req.body;

    if (!fundiId || !latitude || !longitude) {
      res.status(400).json({ success: false, message: 'Missing coordinates parameter values' });
      return;
    }

    const accepted = await GPSService.updateLocation(fundiId, parseFloat(latitude), parseFloat(longitude));

    if (!accepted) {
      res.status(400).json({
        success: false,
        message: 'Location update rejected: Invalid coordinate jump speed',
      });
      return;
    }

    res.status(200).json({ success: true, message: 'Location updated successfully' });
  }

  /**
   * Find nearby online fundis
   */
  public static async findNearby(req: Request, res: Response): Promise<void> {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      res.status(400).json({ success: false, message: 'Coordinates are required to query nearby' });
      return;
    }

    try {
      const fundis = await GPSService.findNearbyFundis(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseFloat((radius as string) || '5')
      );

      res.status(200).json({
        success: true,
        message: 'Nearby fundis found',
        data: { fundis },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Dispatches a booking job request
   */
  public static async dispatchJob(req: Request, res: Response): Promise<void> {
    const { bookingId } = req.body;

    if (!bookingId) {
      res.status(400).json({ success: false, message: 'Booking ID is required' });
      return;
    }

    try {
      // Trigger dispatch wave scheduler
      await DispatchEngine.dispatchBooking(bookingId);
      res.status(200).json({ success: true, message: 'Smart dispatch initiated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Accepts a dispatched booking job
   */
  public static async acceptJob(req: Request, res: Response): Promise<void> {
    const { bookingId, fundiId } = req.body;

    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking || booking.status !== BookingStatus.PENDING) {
        res.status(400).json({
          success: false,
          message: 'Accept failed: Booking already accepted or cancelled',
        });
        return;
      }

      // 1. Assign Fundi and update status to ACCEPTED
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          fundiId,
          status: BookingStatus.ACCEPTED,
        },
      });

      // 2. Clear background dispatch wave timeouts
      DispatchEngine.clearDispatch(bookingId);

      // 3. Notify dispatcher customer client of acceptance
      const customerUserId = await prisma.customerProfile.findUnique({
        where: { id: booking.customerId },
      });
      if (customerUserId) {
        DispatchSocket.sendToUser(customerUserId.userId, 'job:assigned', {
          bookingId,
          fundiId,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Job accepted and assigned successfully',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Rejects an incoming booking request invitation
   */
  public static async rejectJob(req: Request, res: Response): Promise<void> {
    const { bookingId, fundiId } = req.body;

    try {
      await prisma.jobDispatchQueue.updateMany({
        where: { jobId: bookingId, fundiId },
        data: { status: 'REJECTED' },
      });

      res.status(200).json({ success: true, message: 'Job invitation rejected' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

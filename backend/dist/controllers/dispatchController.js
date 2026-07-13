"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchController = void 0;
const gpsService_1 = require("../services/gpsService");
const dispatchEngine_1 = require("../services/dispatchEngine");
const dispatchSocket_1 = require("../sockets/dispatchSocket");
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
class DispatchController {
    /**
     * Update current fundi location via REST fallback
     */
    static async updateLocation(req, res) {
        const { fundiId, latitude, longitude } = req.body;
        if (!fundiId || !latitude || !longitude) {
            res.status(400).json({ success: false, message: 'Missing coordinates parameter values' });
            return;
        }
        const accepted = await gpsService_1.GPSService.updateLocation(fundiId, parseFloat(latitude), parseFloat(longitude));
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
    static async findNearby(req, res) {
        const { latitude, longitude, radius } = req.query;
        if (!latitude || !longitude) {
            res.status(400).json({ success: false, message: 'Coordinates are required to query nearby' });
            return;
        }
        try {
            const fundis = await gpsService_1.GPSService.findNearbyFundis(parseFloat(latitude), parseFloat(longitude), parseFloat(radius || '5'));
            res.status(200).json({
                success: true,
                message: 'Nearby fundis found',
                data: { fundis },
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Dispatches a booking job request
     */
    static async dispatchJob(req, res) {
        const { bookingId } = req.body;
        if (!bookingId) {
            res.status(400).json({ success: false, message: 'Booking ID is required' });
            return;
        }
        try {
            // Trigger dispatch wave scheduler
            await dispatchEngine_1.DispatchEngine.dispatchBooking(bookingId);
            res.status(200).json({ success: true, message: 'Smart dispatch initiated successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Accepts a dispatched booking job
     */
    static async acceptJob(req, res) {
        const { bookingId, fundiId } = req.body;
        try {
            const booking = await prisma_1.default.booking.findUnique({
                where: { id: bookingId },
            });
            if (!booking || booking.status !== client_1.BookingStatus.PENDING) {
                res.status(400).json({
                    success: false,
                    message: 'Accept failed: Booking already accepted or cancelled',
                });
                return;
            }
            // 1. Assign Fundi and update status to ACCEPTED
            await prisma_1.default.booking.update({
                where: { id: bookingId },
                data: {
                    fundiId,
                    status: client_1.BookingStatus.ACCEPTED,
                },
            });
            // 2. Clear background dispatch wave timeouts
            dispatchEngine_1.DispatchEngine.clearDispatch(bookingId);
            // 3. Notify dispatcher customer client of acceptance
            const customerUserId = await prisma_1.default.customerProfile.findUnique({
                where: { id: booking.customerId },
            });
            if (customerUserId) {
                dispatchSocket_1.DispatchSocket.sendToUser(customerUserId.userId, 'job:assigned', {
                    bookingId,
                    fundiId,
                });
            }
            res.status(200).json({
                success: true,
                message: 'Job accepted and assigned successfully',
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Rejects an incoming booking request invitation
     */
    static async rejectJob(req, res) {
        const { bookingId, fundiId } = req.body;
        try {
            await prisma_1.default.jobDispatchQueue.updateMany({
                where: { jobId: bookingId, fundiId },
                data: { status: 'REJECTED' },
            });
            res.status(200).json({ success: true, message: 'Job invitation rejected' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.DispatchController = DispatchController;

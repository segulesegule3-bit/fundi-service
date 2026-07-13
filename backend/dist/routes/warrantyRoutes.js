"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warrantyRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const authMiddleware_1 = require("../middlewares/authMiddleware");
exports.warrantyRouter = (0, express_1.Router)();
/**
 * @route POST /api/warranties/claims
 * @desc File a warranty claim on a booking
 */
exports.warrantyRouter.post('/claims', authMiddleware_1.authenticateJWT, async (req, res) => {
    const { bookingId, description, photosUrls } = req.body;
    const userId = req.user?.id;
    if (!bookingId || !description) {
        res.status(400).json({ error: 'bookingId and description are required' });
        return;
    }
    try {
        // 1. Resolve warranty of booking
        const warrantyRes = await db_1.db.query('SELECT * FROM warranties WHERE booking_id = $1', [bookingId]);
        if (warrantyRes.rowCount === 0) {
            res.status(404).json({ error: 'No active warranty exists for this booking' });
            return;
        }
        const warranty = warrantyRes.rows[0];
        // Check expiry
        const now = new Date();
        const expiry = new Date(warranty.expiry_date);
        if (now > expiry) {
            res.status(400).json({ error: 'Warranty has expired' });
            return;
        }
        // 2. Insert claim
        const claimRes = await db_1.db.query(`INSERT INTO warranty_claims (warranty_id, description, status, photos_urls)
       VALUES ($1, $2, 'PENDING', $3) RETURNING *`, [warranty.id, description, photosUrls || '{}']);
        const claim = claimRes.rows[0];
        // Send notifications to Fundi
        const bookingRes = await db_1.db.query('SELECT fundi_id, service_price FROM bookings WHERE id = $1', [bookingId]);
        if (bookingRes.rowCount !== null && bookingRes.rowCount > 0) {
            const fundiId = bookingRes.rows[0].fundi_id;
            await db_1.db.query(`INSERT INTO notifications (user_id, title, body, type)
         VALUES ($1, 'Dai la Udhamini (Warranty Claim)', 'Mteja amewasilisha dai la udhamini kwa kazi uliyokamilisha.', 'in_app')`, [fundiId]);
        }
        res.status(201).json({ message: 'Warranty claim submitted successfully', claim });
    }
    catch (error) {
        console.error('Error submitting claim:', error);
        res.status(500).json({ error: 'Failed to submit warranty claim' });
    }
});
/**
 * @route GET /api/warranties/:id/certificate
 * @desc Get warranty information with metadata
 */
exports.warrantyRouter.get('/:id/certificate', authMiddleware_1.authenticateJWT, async (req, res) => {
    const { id } = req.params;
    try {
        const warrantyRes = await db_1.db.query(`SELECT w.*, b.description as booking_description, 
              u.full_name as customer_name, f.full_name as fundi_name
       FROM warranties w
       JOIN bookings b ON w.booking_id = b.id
       JOIN users u ON b.customer_id = u.id
       JOIN users f ON b.fundi_id = f.id
       WHERE w.id = $1`, [id]);
        if (warrantyRes.rowCount === 0) {
            res.status(404).json({ error: 'Warranty not found' });
            return;
        }
        res.status(200).json(warrantyRes.rows[0]);
    }
    catch (error) {
        console.error('Error loading warranty info:', error);
        res.status(500).json({ error: 'Failed to load warranty certificate' });
    }
});
/**
 * @route GET /api/warranties/:id/download-pdf
 * @desc Download certificate as PDF
 */
exports.warrantyRouter.get('/:id/download-pdf', async (req, res) => {
    const { id } = req.params;
    try {
        const warrantyRes = await db_1.db.query(`SELECT w.*, b.description as booking_description, 
              u.full_name as customer_name, f.full_name as fundi_name
       FROM warranties w
       JOIN bookings b ON w.booking_id = b.id
       JOIN users u ON b.customer_id = u.id
       JOIN users f ON b.fundi_id = f.id
       WHERE w.id = $1`, [id]);
        if (warrantyRes.rowCount === 0) {
            res.status(404).json({ error: 'Warranty not found' });
            return;
        }
        const w = warrantyRes.rows[0];
        // Generate formatted text document resembling PDF structure
        const output = `
============================================================
           HATI YA UDHAMINI (WARRANTY CERTIFICATE)          
============================================================
Namba ya Udhamini: ${w.warranty_number}
Kitambulisho cha Booking: ${w.booking_id}
============================================================

Jina la Mteja: ${w.customer_name}
Jina la Fundi: ${w.fundi_name}
Kazi Iliyofanyika: ${w.booking_description}

Muda wa Udhamini: ${w.duration}
Tarehe ya Kuanza: ${new Date(w.start_date).toLocaleDateString()}
Tarehe ya Kumalizika: ${new Date(w.expiry_date).toLocaleDateString()}

============================================================
Kuhakiki Hati hii, tembelea kiungo hiki:
${w.qr_code_data}
============================================================
   Asante kwa kutumia Mfumo wa Mafundi Salama wa Tanzania   
============================================================
    `;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=warranty-certificate-${w.warranty_number}.txt`);
        res.status(200).send(output);
    }
    catch (error) {
        console.error('Error downloading certificate PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF download' });
    }
});
/**
 * @route PATCH /api/warranties/claims/:claimId/status
 * @desc Update claim status by Fundi
 */
exports.warrantyRouter.patch('/claims/:claimId/status', authMiddleware_1.authenticateJWT, async (req, res) => {
    const { claimId } = req.params;
    const { status } = req.body; // ACCEPTED or REJECTED
    const userId = req.user?.id;
    if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
        res.status(400).json({ error: 'Valid status (ACCEPTED or REJECTED) is required' });
        return;
    }
    try {
        // Check if the caller is the assigned Fundi
        const claimRes = await db_1.db.query(`SELECT wc.*, b.fundi_id 
       FROM warranty_claims wc
       JOIN warranties w ON wc.warranty_id = w.id
       JOIN bookings b ON w.booking_id = b.id
       WHERE wc.id = $1`, [claimId]);
        if (claimRes.rowCount === 0) {
            res.status(404).json({ error: 'Warranty claim not found' });
            return;
        }
        const claim = claimRes.rows[0];
        if (claim.fundi_id !== userId) {
            res.status(403).json({ error: 'Access Denied: Only the assigned Fundi can update claim status' });
            return;
        }
        // Update status
        await db_1.db.query(`UPDATE warranty_claims SET status = $1, updated_at = NOW() WHERE id = $2`, [status, claimId]);
        res.status(200).json({ message: `Claim status updated to ${status}` });
    }
    catch (error) {
        console.error('Error updating claim status:', error);
        res.status(500).json({ error: 'Failed to update claim status' });
    }
});

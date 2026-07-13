"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const walletService_1 = require("../services/walletService");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
exports.bookingRouter = (0, express_1.Router)();
/**
 * @route POST /api/bookings/create
 * @desc Create a new booking request
 */
exports.bookingRouter.post('/create', authMiddleware_1.authenticateJWT, (0, validationMiddleware_1.validateBody)(validationMiddleware_1.bookingCreateSchema), async (req, res) => {
    const { customerId, fundiId, professionId, date, time, address, description, photosUrls, servicePrice, isEmergency, customerBudget, paymentOption, corporateId } = req.body;
    try {
        // Prevent creating bookings on behalf of someone else
        if (req.user?.id !== customerId && req.user?.role !== 'super_admin') {
            res.status(403).json({ error: 'Access Denied: Cannot create bookings on behalf of another user' });
            return;
        }
        if (!customerId || !fundiId || !professionId || !date || !time || !address) {
            res.status(400).json({ error: 'Missing required booking fields' });
            return;
        }
        // Resolve starting price and inspection fee
        const fprofRes = await db_1.db.query(`SELECT starting_price, inspection_fee 
       FROM fundi_professions 
       WHERE "fundiId" = $1 AND "professionId" = $2`, [fundiId, professionId]);
        let startingPrice = 0;
        let inspectionFee = 0;
        if (fprofRes.rowCount !== null && fprofRes.rowCount > 0) {
            startingPrice = parseFloat(fprofRes.rows[0].starting_price || '0');
            inspectionFee = parseFloat(fprofRes.rows[0].inspection_fee || '0');
        }
        else {
            const fprofProfile = await db_1.db.query('SELECT starting_price, inspection_fee FROM fundi_profiles WHERE user_id = $1', [fundiId]);
            if (fprofProfile.rowCount !== null && fprofProfile.rowCount > 0) {
                startingPrice = parseFloat(fprofProfile.rows[0].starting_price || '0');
                inspectionFee = parseFloat(fprofProfile.rows[0].inspection_fee || '0');
            }
        }
        // Resolve profession/category name for AI estimation
        const profRes = await db_1.db.query('SELECT name_en FROM professions WHERE id = $1', [professionId]);
        const categoryName = (profRes.rowCount !== null && profRes.rowCount > 0) ? profRes.rows[0].name_en : 'general';
        // Get AI pricing estimation
        const { AIService } = require('../services/aiService');
        const aiEstimate = AIService.estimatePrice(categoryName, isEmergency ? 'emergency' : 'normal');
        const finalServicePrice = servicePrice || customerBudget || startingPrice || 0;
        const paymentOptionValue = paymentOption || 'online';
        const corporateIdValue = corporateId || null;
        // Insert booking in pending status
        const bookingRes = await db_1.db.query(`INSERT INTO bookings (
        customer_id, fundi_id, profession_id, date, time, address, description, photos_urls, 
        service_price, is_emergency, status, starting_price, inspection_fee, customer_budget, 
        ai_estimated_min, ai_estimated_max, payment_option, corporate_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`, [
            customerId, fundiId, professionId, date, time, address, description || '',
            photosUrls || '{}', finalServicePrice, isEmergency || false, startingPrice, inspectionFee,
            customerBudget || null, aiEstimate.minPrice, aiEstimate.maxPrice, paymentOptionValue, corporateIdValue
        ]);
        const booking = bookingRes.rows[0];
        res.status(201).json({ message: 'Booking created successfully', booking });
    }
    catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});
/**
 * @route PATCH /api/bookings/:bookingId/status
 * @desc Update the status of a booking (handles Escrow locks and payouts)
 */
exports.bookingRouter.patch('/:bookingId/status', authMiddleware_1.authenticateJWT, async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body; // accepted, rejected, on_the_way, started, completed, cancelled
    try {
        // 1. Fetch current booking details
        const bookingRes = await db_1.db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
        if (bookingRes.rowCount === 0) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        const booking = bookingRes.rows[0];
        const previousStatus = booking.status;
        // Check ownership permissions
        const isCustomer = req.user?.id === booking.customer_id;
        const isFundi = req.user?.id === booking.fundi_id;
        const isAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
        if (!isCustomer && !isFundi && !isAdmin) {
            res.status(403).json({ error: 'Access Denied: You are not authorized to update this booking' });
            return;
        }
        // Role-specific transition rules
        if (status === 'accepted' || status === 'price_confirmed' || status === 'rejected' || status === 'on_the_way' || status === 'started') {
            if (!isFundi && !isAdmin) {
                res.status(403).json({ error: `Access Denied: Only the assigned Fundi can mark status as ${status}` });
                return;
            }
        }
        if (status === 'cancelled') {
            if (!isCustomer && !isAdmin) {
                res.status(403).json({ error: 'Access Denied: Only the customer can cancel the booking' });
                return;
            }
        }
        if (previousStatus === 'completed' || previousStatus === 'cancelled' || previousStatus === 'rejected') {
            res.status(400).json({ error: 'Cannot change status of a finalized booking' });
            return;
        }
        await db_1.db.transaction(async (client) => {
            // 2. Perform Escrow holds or releases based on state transitions if payment is online
            if (booking.payment_option !== 'offline') {
                if (status === 'accepted' || status === 'price_confirmed') {
                    // Hold customer funds in Escrow
                    await walletService_1.WalletService.holdEscrow(booking.customer_id, parseFloat(booking.service_price), bookingId);
                }
                else if (status === 'rejected' || status === 'cancelled') {
                    // If funds were already held, refund them
                    if (previousStatus !== 'pending') {
                        await walletService_1.WalletService.refundEscrow(bookingId);
                    }
                }
                else if (status === 'completed') {
                    await walletService_1.WalletService.releaseEscrow(bookingId);
                }
            }
            if (status === 'completed') {
                // Update Fundi profile completed jobs count
                const fpUpdate = await client.query(`UPDATE fundi_profiles SET completed_jobs = completed_jobs + 1 WHERE user_id = $1 RETURNING id`, [booking.fundi_id]);
                // Generate warranty if applicable
                const warrantyPeriod = booking.warranty_period || 'No Warranty';
                if (warrantyPeriod !== 'No Warranty' && warrantyPeriod !== '') {
                    let durationDays = 30;
                    if (warrantyPeriod.includes('7'))
                        durationDays = 7;
                    else if (warrantyPeriod.includes('14'))
                        durationDays = 14;
                    else if (warrantyPeriod.includes('30'))
                        durationDays = 30;
                    else if (warrantyPeriod.includes('60'))
                        durationDays = 60;
                    else if (warrantyPeriod.includes('90'))
                        durationDays = 90;
                    else if (warrantyPeriod.includes('6 Months') || warrantyPeriod.includes('6 months'))
                        durationDays = 180;
                    else if (warrantyPeriod.includes('1 Year') || warrantyPeriod.includes('1 year'))
                        durationDays = 365;
                    const startDate = new Date();
                    const expiryDate = new Date();
                    expiryDate.setDate(startDate.getDate() + durationDays);
                    const warrantyNumber = 'WAR-' + Math.floor(100000 + Math.random() * 900000);
                    const qrCodeData = `https://fundiservice.tz/verify-warranty/${warrantyNumber}`;
                    await client.query(`INSERT INTO warranties (booking_id, warranty_number, duration, start_date, expiry_date, qr_code_data)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (booking_id) DO NOTHING`, [bookingId, warrantyNumber, warrantyPeriod, startDate, expiryDate, qrCodeData]);
                }
                // Recalculate Trust Score
                if (fpUpdate.rowCount !== null && fpUpdate.rowCount > 0) {
                    const { TrustSafetyService } = require('../services/trustSafetyService');
                    TrustSafetyService.recalculateTrustScore(fpUpdate.rows[0].id).catch(console.error);
                }
            }
            // Update Booking status
            await client.query(`UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2`, [status, bookingId]);
        });
        res.status(200).json({ message: `Booking status updated to ${status}` });
    }
    catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Status update failed' });
    }
});
/**
 * @route POST /api/bookings/:bookingId/review
 * @desc Submit a review and rating for a completed booking
 */
exports.bookingRouter.post('/:bookingId/review', authMiddleware_1.authenticateJWT, async (req, res) => {
    const { bookingId } = req.params;
    const { customerId, rating, comment, photosUrls, videoUrl, beforePhotosUrls, afterPhotosUrls, projectCost, completionDate } = req.body;
    try {
        if (req.user?.id !== customerId && req.user?.role !== 'super_admin') {
            res.status(403).json({ error: 'Access Denied: You cannot submit a review for another customer' });
            return;
        }
        if (!customerId || !rating) {
            res.status(400).json({ error: 'Customer ID and rating are required' });
            return;
        }
        // 1. Verify booking completion status
        const bookingRes = await db_1.db.query('SELECT fundi_id, status FROM bookings WHERE id = $1', [bookingId]);
        if (bookingRes.rowCount === 0) {
            res.status(404).json({ error: 'Booking record not found' });
            return;
        }
        const booking = bookingRes.rows[0];
        if (booking.status !== 'completed') {
            res.status(400).json({ error: 'Reviews are only allowed for completed services' });
            return;
        }
        // 2. AI Fake Review Detection
        // Check if the customer has made duplicate ratings/reviews on same fundi recently
        const recentReviews = await db_1.db.query(`SELECT count(*) FROM reviews 
       WHERE customer_id = $1 AND fundi_id = $2 AND created_at > NOW() - INTERVAL '10 minutes'`, [customerId, booking.fundi_id]);
        let isFake = false;
        let fakeProbability = 0.00;
        if (parseInt(recentReviews.rows[0].count) > 0) {
            isFake = true;
            fakeProbability = 95.00; // Suspect spamming activity
        }
        if (comment && comment.length < 5 && rating === 5) {
            // Very short comment with high ratings could indicate automated spam
            fakeProbability = 45.00;
        }
        // 3. Save Review in Transaction and Update Fundi Ratings
        await db_1.db.transaction(async (client) => {
            await client.query(`INSERT INTO reviews (
          booking_id, customer_id, fundi_id, rating, comment, photos_urls, video_url, is_fake, fake_probability,
          before_photos_urls, after_photos_urls, project_cost, completion_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`, [
                bookingId,
                customerId,
                booking.fundi_id,
                rating,
                comment || '',
                photosUrls || '{}',
                videoUrl || null,
                isFake,
                fakeProbability,
                beforePhotosUrls || '{}',
                afterPhotosUrls || '{}',
                projectCost || null,
                completionDate || null
            ]);
            // Re-calculate averages for Fundi profile
            const averageRes = await client.query(`SELECT AVG(rating)::decimal(3,2) as avg_rating, COUNT(*) as count 
         FROM reviews WHERE fundi_id = $1 AND is_fake = false`, [booking.fundi_id]);
            const { avg_rating, count } = averageRes.rows[0];
            await client.query(`UPDATE fundi_profiles 
         SET average_rating = $1, total_reviews = $2 
         WHERE user_id = $3`, [avg_rating || 0.00, count || 0, booking.fundi_id]);
            // Add loyalty points to customer for completing review
            await client.query(`UPDATE users SET loyalty_points = loyalty_points + 10 WHERE id = $1`, [customerId]);
        });
        res.status(201).json({
            message: 'Review submitted successfully',
            isFlaggedAsSpam: isFake
        });
    }
    catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ error: 'Review submission transaction failed' });
    }
});
/**
 * @route POST /api/bookings/:bookingId/quote
 * @desc Fundi submits a quotation for a pending booking request
 */
exports.bookingRouter.post('/:bookingId/quote', authMiddleware_1.authenticateJWT, async (req, res) => {
    const { bookingId } = req.params;
    const { price, arrivalTime, completionTime, notes, warrantyPeriod } = req.body;
    try {
        if (!price || !arrivalTime || !completionTime) {
            res.status(400).json({ error: 'Price, arrivalTime, and completionTime are required' });
            return;
        }
        // Verify booking
        const bookingRes = await db_1.db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
        if (bookingRes.rowCount === 0) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        const booking = bookingRes.rows[0];
        // Update quotation details
        await db_1.db.query(`UPDATE bookings 
       SET fundi_quote_price = $1, fundi_quote_arrival = $2, fundi_quote_completion = $3, 
           fundi_quote_notes = $4, negotiation_status = 'quoted', last_negotiated_by = 'fundi',
           last_negotiation_price = $1, service_price = $1, warranty_period = $5
       WHERE id = $6`, [price, arrivalTime, completionTime, notes || '', warrantyPeriod || 'No Warranty', bookingId]);
        // Send negotiation update to chat room
        try {
            const chatUser1 = booking.customer_id;
            const chatUser2 = booking.fundi_id;
            const [p1, p2] = chatUser1 < chatUser2 ? [chatUser1, chatUser2] : [chatUser2, chatUser1];
            let chatRes = await db_1.db.query('SELECT id FROM chats WHERE participant_one_id = $1 AND participant_two_id = $2', [p1, p2]);
            let chatId;
            if (chatRes.rowCount !== null && chatRes.rowCount > 0) {
                chatId = chatRes.rows[0].id;
            }
            else {
                const newChat = await db_1.db.query('INSERT INTO chats (participant_one_id, participant_two_id, last_message, last_message_at) VALUES ($1, $2, $3, NOW()) RETURNING id', [p1, p2, 'Negotiation started']);
                chatId = newChat.rows[0].id;
            }
            const msgText = `[QUOTATION] Fundi ametuma nukuu: TZS ${parseFloat(price).toLocaleString()}. Masaa ya kuwasili: ${arrivalTime}. Muda wa kazi: ${completionTime}. Vidokezo: ${notes || 'Hakuna'}`;
            await db_1.db.query('INSERT INTO messages (chat_id, sender_id, text) VALUES ($1, $2, $3)', [chatId, booking.fundi_id, msgText]);
            await db_1.db.query('UPDATE chats SET last_message = $1, last_message_at = NOW() WHERE id = $2', [msgText, chatId]);
        }
        catch (chatErr) {
            console.error('Failed to append quotation message to chat room:', chatErr);
        }
        res.status(200).json({ message: 'Quotation submitted successfully' });
    }
    catch (error) {
        console.error('Error submitting quote:', error);
        res.status(500).json({ error: 'Failed to submit quote' });
    }
});
/**
 * @route POST /api/bookings/:bookingId/negotiate
 * @desc Customer or Fundi proposes a counter offer
 */
exports.bookingRouter.post('/:bookingId/negotiate', authMiddleware_1.authenticateJWT, async (req, res) => {
    const { bookingId } = req.params;
    const { counterPrice, notes, counterBy } = req.body; // counterBy is 'customer' or 'fundi'
    try {
        if (!counterPrice || !counterBy) {
            res.status(400).json({ error: 'counterPrice and counterBy are required' });
            return;
        }
        // Verify booking
        const bookingRes = await db_1.db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
        if (bookingRes.rowCount === 0) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        const booking = bookingRes.rows[0];
        const negotiationStatus = counterBy === 'customer' ? 'countered_by_customer' : 'countered_by_fundi';
        // Update counter offer details
        await db_1.db.query(`UPDATE bookings 
       SET negotiation_status = $1, last_negotiated_by = $2, last_negotiation_price = $3,
           service_price = $3
       WHERE id = $4`, [negotiationStatus, counterBy, counterPrice, bookingId]);
        // Send counter offer update to chat room
        try {
            const chatUser1 = booking.customer_id;
            const chatUser2 = booking.fundi_id;
            const [p1, p2] = chatUser1 < chatUser2 ? [chatUser1, chatUser2] : [chatUser2, chatUser1];
            let chatRes = await db_1.db.query('SELECT id FROM chats WHERE participant_one_id = $1 AND participant_two_id = $2', [p1, p2]);
            let chatId;
            if (chatRes.rowCount !== null && chatRes.rowCount > 0) {
                chatId = chatRes.rows[0].id;
            }
            else {
                const newChat = await db_1.db.query('INSERT INTO chats (participant_one_id, participant_two_id, last_message, last_message_at) VALUES ($1, $2, $3, NOW()) RETURNING id', [p1, p2, 'Negotiation started']);
                chatId = newChat.rows[0].id;
            }
            const senderId = counterBy === 'customer' ? booking.customer_id : booking.fundi_id;
            const partyName = counterBy === 'customer' ? 'Mteja' : 'Fundi';
            const msgText = `[NEGOTIATION] ${partyName} amependekeza bei mbadala: TZS ${parseFloat(counterPrice).toLocaleString()}. Vidokezo: ${notes || 'Hakuna'}`;
            await db_1.db.query('INSERT INTO messages (chat_id, sender_id, text) VALUES ($1, $2, $3)', [chatId, senderId, msgText]);
            await db_1.db.query('UPDATE chats SET last_message = $1, last_message_at = NOW() WHERE id = $2', [msgText, chatId]);
        }
        catch (chatErr) {
            console.error('Failed to append negotiation message to chat room:', chatErr);
        }
        res.status(200).json({ message: 'Counter offer proposed successfully' });
    }
    catch (error) {
        console.error('Error negotiating quote:', error);
        res.status(500).json({ error: 'Failed to propose counter offer' });
    }
});
/**
 * @route POST /api/bookings/:bookingId/accept-quote
 * @desc Accepts the quotation/counter offer, locks funds in escrow, and moves status to PRICE_CONFIRMED
 */
exports.bookingRouter.post('/:bookingId/accept-quote', authMiddleware_1.authenticateJWT, async (req, res) => {
    const { bookingId } = req.params;
    try {
        const bookingRes = await db_1.db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
        if (bookingRes.rowCount === 0) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        const booking = bookingRes.rows[0];
        const agreedPrice = parseFloat(booking.last_negotiation_price || booking.fundi_quote_price || booking.service_price);
        if (!agreedPrice || agreedPrice <= 0) {
            res.status(400).json({ error: 'No quotation has been submitted or agreed upon' });
            return;
        }
        await db_1.db.transaction(async (client) => {
            // 1. Update booking fields
            await client.query(`UPDATE bookings 
         SET negotiation_status = 'agreed', final_agreed_price = $1, service_price = $1, 
             status = 'price_confirmed', updated_at = NOW()
         WHERE id = $2`, [agreedPrice, bookingId]);
            // 2. Lock money in Escrow if payment is online
            if (booking.payment_option !== 'offline') {
                await walletService_1.WalletService.holdEscrow(booking.customer_id, agreedPrice, bookingId);
            }
        });
        // Send agreement update to chat
        try {
            const chatUser1 = booking.customer_id;
            const chatUser2 = booking.fundi_id;
            const [p1, p2] = chatUser1 < chatUser2 ? [chatUser1, chatUser2] : [chatUser2, chatUser1];
            let chatRes = await db_1.db.query('SELECT id FROM chats WHERE participant_one_id = $1 AND participant_two_id = $2', [p1, p2]);
            if (chatRes.rowCount !== null && chatRes.rowCount > 0) {
                const chatId = chatRes.rows[0].id;
                const isOffline = booking.payment_option === 'offline';
                const msgText = isOffline
                    ? `[PRICE_CONFIRMED] Bei imekubaliwa: TZS ${agreedPrice.toLocaleString()}. Malipo yatafanyika moja kwa moja kwa Fundi baada ya kazi kukamilika.`
                    : `[PRICE_CONFIRMED] Bei imekubaliwa: TZS ${agreedPrice.toLocaleString()}. Malipo yamewekwa kwenye Escrow. Kazi imeanza!`;
                await db_1.db.query('INSERT INTO messages (chat_id, sender_id, text) VALUES ($1, $2, $3)', [chatId, booking.customer_id, msgText]);
                await db_1.db.query('UPDATE chats SET last_message = $1, last_message_at = NOW() WHERE id = $2', [msgText, chatId]);
            }
        }
        catch (chatErr) {
            console.error('Failed to append agreement message to chat:', chatErr);
        }
        res.status(200).json({ message: 'Quotation accepted, pricing confirmed and locked in escrow' });
    }
    catch (error) {
        console.error('Error accepting quote:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Acceptance failed' });
    }
});
/**
 * @route POST /api/bookings/:bookingId/reject-quote
 * @desc Rejects the quotation/counter offer and cancels the booking request
 */
exports.bookingRouter.post('/:bookingId/reject-quote', authMiddleware_1.authenticateJWT, async (req, res) => {
    const { bookingId } = req.params;
    try {
        const bookingRes = await db_1.db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
        if (bookingRes.rowCount === 0) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        const booking = bookingRes.rows[0];
        await db_1.db.query(`UPDATE bookings 
       SET negotiation_status = 'rejected', status = 'rejected', updated_at = NOW()
       WHERE id = $1`, [bookingId]);
        // Send rejection message to chat
        try {
            const chatUser1 = booking.customer_id;
            const chatUser2 = booking.fundi_id;
            const [p1, p2] = chatUser1 < chatUser2 ? [chatUser1, chatUser2] : [chatUser2, chatUser1];
            let chatRes = await db_1.db.query('SELECT id FROM chats WHERE participant_one_id = $1 AND participant_two_id = $2', [p1, p2]);
            if (chatRes.rowCount !== null && chatRes.rowCount > 0) {
                const chatId = chatRes.rows[0].id;
                const msgText = `[REJECTED] Ombi la nukuu ya bei limekataliwa.`;
                await db_1.db.query('INSERT INTO messages (chat_id, sender_id, text) VALUES ($1, $2, $3)', [chatId, booking.customer_id, msgText]);
                await db_1.db.query('UPDATE chats SET last_message = $1, last_message_at = NOW() WHERE id = $2', [msgText, chatId]);
            }
        }
        catch (chatErr) {
            console.error('Failed to append rejection message to chat:', chatErr);
        }
        res.status(200).json({ message: 'Quotation rejected and cancelled' });
    }
    catch (error) {
        console.error('Error rejecting quote:', error);
        res.status(500).json({ error: 'Failed to reject quote' });
    }
});

import { Router, Request, Response } from 'express';
import { db } from '../db';

export const quoteRouter = Router();

/**
 * @route POST /api/quotes/request
 * @desc Create a new quote request (Job Post)
 */
quoteRouter.post('/request', async (req: Request, res: Response): Promise<void> => {
  const {
    customerId,
    professionId,
    title,
    description,
    budgetMin,
    budgetMax,
    photosUrls,
    regionId,
    districtId,
    wardId,
    villageId
  } = req.body;

  try {
    if (!customerId || !professionId || !title || !description) {
       res.status(400).json({ error: 'Missing required fields for quote request' });
       return;
    }

    const result = await db.query(
      `INSERT INTO job_posts (
        customer_id, profession_id, title, description, photos_urls, 
        budget_min, budget_max, region_id, district_id, ward_id, village_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        customerId,
        professionId,
        title,
        description,
        photosUrls || '{}',
        budgetMin || null,
        budgetMax || null,
        regionId || null,
        districtId || null,
        wardId || null,
        villageId || null
      ]
    );

    res.status(201).json({
      message: 'Quote request created successfully',
      quoteRequest: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating quote request:', error);
    res.status(500).json({ error: 'Failed to create quote request' });
  }
});

/**
 * @route GET /api/quotes/customer/:customerId
 * @desc Retrieve all quote requests and their bids for a customer
 */
quoteRouter.get('/customer/:customerId', async (req: Request, res: Response): Promise<void> => {
  const { customerId } = req.params;

  try {
    const requestsRes = await db.query(
      `SELECT jp.*, p.name_en as profession_name_en, p.name_sw as profession_name_sw
       FROM job_posts jp
       JOIN professions p ON jp.profession_id = p.id
       WHERE jp.customer_id = $1
       ORDER BY jp.created_at DESC`,
      [customerId]
    );

    const requests = requestsRes.rows;

    // Load bids for each request
    for (const reqObj of requests) {
      const bidsRes = await db.query(
        `SELECT jb.*, u.full_name as fundi_name, u.profile_picture_url as fundi_picture,
                fp.average_rating as fundi_rating, fp.verified_badge as fundi_verified
         FROM job_bids jb
         JOIN users u ON jb.fundi_id = u.id
         JOIN fundi_profiles fp ON u.id = fp.user_id
         WHERE jb.job_post_id = $1
         ORDER BY jb.created_at DESC`,
        [reqObj.id]
      );
      reqObj.bids = bidsRes.rows;
    }

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching customer quote requests:', error);
    res.status(500).json({ error: 'Failed to fetch quote requests' });
  }
});

/**
 * @route GET /api/quotes/fundi/:fundiId
 * @desc Retrieve active quote requests matching Fundi's profession
 */
quoteRouter.get('/fundi/:fundiId', async (req: Request, res: Response): Promise<void> => {
  const { fundiId } = req.params;

  try {
    // 1. Get fundi profession
    const fundiRes = await db.query(
      'SELECT profession_id FROM fundi_profiles WHERE user_id = $1',
      [fundiId]
    );

    if (fundiRes.rowCount === 0) {
       res.status(404).json({ error: 'Fundi profile not found' });
       return;
    }

    const { profession_id } = fundiRes.rows[0];

    // 2. Fetch active requests for that profession
    const requestsRes = await db.query(
      `SELECT jp.*, u.full_name as customer_name, u.profile_picture_url as customer_picture
       FROM job_posts jp
       JOIN users u ON jp.customer_id = u.id
       WHERE jp.profession_id = $1 AND jp.is_active = true
       ORDER BY jp.created_at DESC`,
      [profession_id]
    );

    const requests = requestsRes.rows;

    // Check if the fundi has already bid on each request
    for (const reqObj of requests) {
      const bidRes = await db.query(
        'SELECT * FROM job_bids WHERE job_post_id = $1 AND fundi_id = $2',
        [reqObj.id, fundiId]
      );
      reqObj.myBid = (bidRes.rowCount !== null && bidRes.rowCount > 0) ? bidRes.rows[0] : null;
    }

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching fundi quote requests:', error);
    res.status(500).json({ error: 'Failed to fetch quote board' });
  }
});

/**
 * @route POST /api/quotes/bid
 * @desc Fundi submits a bid / quotation for a job post
 */
quoteRouter.post('/bid', async (req: Request, res: Response): Promise<void> => {
  const {
    jobPostId,
    fundiId,
    quotationAmount,
    estimatedDuration,
    coverLetter,
    warrantyPeriod,
    materialsIncluded,
    completionTime,
    notes
  } = req.body;

  try {
    if (!jobPostId || !fundiId || !quotationAmount) {
       res.status(400).json({ error: 'jobPostId, fundiId, and quotationAmount are required' });
       return;
    }

    // Check if bid already exists
    const checkRes = await db.query(
      'SELECT id FROM job_bids WHERE job_post_id = $1 AND fundi_id = $2',
      [jobPostId, fundiId]
    );

    let result;
    if (checkRes.rowCount !== null && checkRes.rowCount > 0) {
      // Update existing bid
      result = await db.query(
        `UPDATE job_bids 
         SET quotation_amount = $1, estimated_duration = $2, cover_letter = $3,
             warranty_period = $4, materials_included = $5, completion_time = $6, notes = $7
         WHERE job_post_id = $8 AND fundi_id = $9 RETURNING *`,
        [
          quotationAmount,
          estimatedDuration || '3 hours',
          coverLetter || '',
          warrantyPeriod || '30 Days',
          materialsIncluded || false,
          completionTime || estimatedDuration || '3 hours',
          notes || '',
          jobPostId,
          fundiId
        ]
      );
    } else {
      // Insert new bid
      result = await db.query(
        `INSERT INTO job_bids (
          job_post_id, fundi_id, quotation_amount, estimated_duration, cover_letter,
          warranty_period, materials_included, completion_time, notes
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          jobPostId,
          fundiId,
          quotationAmount,
          estimatedDuration || '3 hours',
          coverLetter || '',
          warrantyPeriod || '30 Days',
          materialsIncluded || false,
          completionTime || estimatedDuration || '3 hours',
          notes || ''
        ]
      );
    }

    res.status(201).json({
      message: 'Bid submitted successfully',
      bid: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting bid:', error);
    res.status(500).json({ error: 'Failed to submit bid' });
  }
});

/**
 * @route PATCH /api/quotes/bid/:bidId/accept
 * @desc Accept a quotation: creates booking and rejects other bids
 */
quoteRouter.patch('/bid/:bidId/accept', async (req: Request, res: Response): Promise<void> => {
  const { bidId } = req.params;

  try {
    // 1. Get bid info
    const bidRes = await db.query(
      `SELECT jb.*, jp.customer_id, jp.profession_id, jp.description as job_desc 
       FROM job_bids jb
       JOIN job_posts jp ON jb.job_post_id = jp.id
       WHERE jb.id = $1`,
      [bidId]
    );

    if (bidRes.rowCount === 0) {
       res.status(404).json({ error: 'Bid not found' });
       return;
    }

    const bid = bidRes.rows[0];

    // 2. Perform acceptance in transaction
    const booking = await db.transaction(async (client) => {
      // Mark this bid as accepted
      await client.query(
        `UPDATE job_bids SET status = 'accepted' WHERE id = $1`,
        [bidId]
      );

      // Mark other bids for this post as rejected
      await client.query(
        `UPDATE job_bids SET status = 'rejected' WHERE job_post_id = $1 AND id != $2`,
        [bid.job_post_id, bidId]
      );

      // Close the request post
      await client.query(
        `UPDATE job_posts SET is_active = false WHERE id = $1`,
        [bid.job_post_id]
      );

      // Create booking from quote details
      const bookingRes = await client.query(
        `INSERT INTO bookings (
          customer_id, fundi_id, profession_id, date, time, address, description, service_price, status
         ) VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_TIME, 'Quote Job Location', $4, $5, 'accepted') RETURNING *`,
        [
          bid.customer_id,
          bid.fundi_id,
          bid.profession_id,
          `Accepted Quote Request: ${bid.job_desc}\nNotes: ${bid.notes || ''}`,
          bid.quotation_amount
        ]
      );

      return bookingRes.rows[0];
    });

    res.status(200).json({
      message: 'Bid accepted, booking initialized',
      booking
    });
  } catch (error) {
    console.error('Error accepting bid:', error);
    res.status(500).json({ error: 'Failed to accept bid' });
  }
});

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { RecommendationService } from '../services/recommendationService';

export const fundiRouter = Router();

/**
 * @route GET /api/fundis/professions
 * @desc Get list of all available professions
 */
fundiRouter.get('/professions', async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT * FROM professions WHERE is_active = true ORDER BY name_sw ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching professions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /api/fundis/search
 * @desc Search and filter Fundis
 */
fundiRouter.get('/search', async (req: Request, res: Response): Promise<void> => {
  const {
    professionId,
    regionId,
    districtId,
    wardId,
    villageId,
    minRating,
    verified,
    online,
    sortBy, // 'rating' | 'experience' | 'distance'
    latitude,
    longitude,
    radiusKm = '15'
  } = req.query;

  try {
    let sql = `
      SELECT 
        u.id, 
        u.full_name, 
        u.profile_picture_url, 
        p.name_en as profession_name,
        p.name_sw as profession_name_sw,
        fp.average_rating, 
        fp.completed_jobs, 
        COALESCE(fp.starting_price, fp.hourly_rate) as starting_price, 
        fp.verified_badge, 
        fp.online_status, 
        fp.experience_years,
        fp.bio,
        ST_X(fp.gps_location::geometry) as longitude,
        ST_Y(fp.gps_location::geometry) as latitude
      FROM fundi_profiles fp
      JOIN users u ON fp.user_id = u.id
      JOIN professions p ON fp.profession_id = p.id
      WHERE u.status = 'active'
    `;

    const params: unknown[] = [];

    if (professionId) {
      params.push(professionId);
      sql += ` AND fp.profession_id = $${params.length}`;
    }
    if (regionId) {
      params.push(parseInt(regionId as string));
      sql += ` AND fp.region_id = $${params.length}`;
    }
    if (districtId) {
      params.push(parseInt(districtId as string));
      sql += ` AND fp.district_id = $${params.length}`;
    }
    if (wardId) {
      params.push(parseInt(wardId as string));
      sql += ` AND fp.ward_id = $${params.length}`;
    }
    if (villageId) {
      params.push(parseInt(villageId as string));
      sql += ` AND fp.village_id = $${params.length}`;
    }
    if (minRating) {
      params.push(parseFloat(minRating as string));
      sql += ` AND fp.average_rating >= $${params.length}`;
    }
    if (verified === 'true') {
      sql += ` AND fp.verified_badge = true`;
    }
    if (online === 'true') {
      sql += ` AND fp.online_status = true`;
    }

    const result = await db.query(sql, params);
    let fundis = result.rows;

    // Filter by distance if lat/lng coordinates are provided
    if (latitude && longitude) {
      const customerLat = parseFloat(latitude as string);
      const customerLng = parseFloat(longitude as string);
      const limitRadius = parseFloat(radiusKm as string);

      fundis = fundis.map(fundi => {
        const fundiLat = parseFloat(fundi.latitude);
        const fundiLng = parseFloat(fundi.longitude);
        
        let distance = 99999;
        if (!isNaN(fundiLat) && !isNaN(fundiLng)) {
          // Haversine formula
          const R = 6371;
          const dLat = (fundiLat - customerLat) * Math.PI / 180;
          const dLon = (fundiLng - customerLng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(customerLat * Math.PI / 180) * Math.cos(fundiLat * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distance = R * c;
        }

        return { ...fundi, distanceKm: parseFloat(distance.toFixed(2)) };
      });

      // Filter by radius
      fundis = fundis.filter(f => f.distanceKm <= limitRadius);
    }

    // Sort search results
    if (sortBy === 'rating') {
      fundis.sort((a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating));
    } else if (sortBy === 'experience') {
      fundis.sort((a, b) => b.experience_years - a.experience_years);
    } else if (sortBy === 'distance' && latitude && longitude) {
      fundis.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    res.status(200).json(fundis);
  } catch (error) {
    console.error('Error searching fundis:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * @route GET /api/fundis/recommend
 * @desc AI Smart Recommendation Engine API
 */
fundiRouter.get('/recommend', async (req: Request, res: Response): Promise<void> => {
  const { professionId, latitude, longitude, radius = '20', limit = '5' } = req.query;

  try {
    if (!professionId || !latitude || !longitude) {
       res.status(400).json({ error: 'professionId, latitude, and longitude are required' });
       return;
    }

    const recommendations = await RecommendationService.recommendFundis({
      professionId: professionId as string,
      latitude: parseFloat(latitude as string),
      longitude: parseFloat(longitude as string),
      maxDistanceKm: parseFloat(radius as string),
      limit: parseInt(limit as string)
    });

    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Recommendation calculations failed' });
  }
});

/**
 * @route GET /api/fundis/profile/:userId
 * @desc Get detailed profile of a single Fundi
 */
fundiRouter.get('/profile/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    const profileRes = await db.query(
      `SELECT 
        u.id, u.full_name, u.email, u.phone_number, u.profile_picture_url, u.status,
        p.name_en as profession_name, p.name_sw as profession_name_sw,
        fp.bio, fp.skills, fp.experience_years, COALESCE(fp.starting_price, fp.hourly_rate) as starting_price,
        r.name as region_name, d.name as district_name, w.name as ward_name, v.name as village_name,
        fp.working_days, fp.working_hours_start, fp.working_hours_end, fp.online_status, fp.verified_badge,
        fp.average_rating, fp.total_reviews, fp.completed_jobs, fp.average_response_time, fp.subscription_plan,
        ST_X(fp.gps_location::geometry) as longitude, ST_Y(fp.gps_location::geometry) as latitude
       FROM users u
       JOIN fundi_profiles fp ON u.id = fp.user_id
       JOIN professions p ON fp.profession_id = p.id
       LEFT JOIN regions r ON fp.region_id = r.id
       LEFT JOIN districts d ON fp.district_id = d.id
       LEFT JOIN wards w ON fp.ward_id = w.id
       LEFT JOIN villages v ON fp.village_id = v.id
       WHERE u.id = $1`,
      [userId]
    );

    if (profileRes.rowCount === 0) {
       res.status(404).json({ error: 'Fundi profile not found' });
       return;
    }

    // Get reviews for this Fundi
    const reviewsRes = await db.query(
      `SELECT r.id, r.rating, r.comment, r.photos_urls, r.video_url, r.created_at,
              u.full_name as customer_name, u.profile_picture_url as customer_picture
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       WHERE r.fundi_id = $1 AND r.is_fake = false
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      profile: profileRes.rows[0],
      reviews: reviewsRes.rows
    });
  } catch (error) {
    console.error('Error fetching fundi profile:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

/**
 * @route POST /api/fundis/subscribe
 * @desc Purchase/renew a subscription package
 */
fundiRouter.post('/subscribe', async (req: Request, res: Response): Promise<void> => {
  const { fundiId, packageTier, paymentRef } = req.body;

  try {
    const pkgRes = await db.query('SELECT * FROM subscription_packages WHERE tier = $1', [packageTier]);
    if (pkgRes.rowCount === 0) {
       res.status(400).json({ error: 'Invalid subscription package tier' });
       return;
    }

    const pkg = pkgRes.rows[0];
    const durationDays = pkg.duration_days;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    await db.transaction(async (client) => {
      // Create Subscription Log
      await client.query(
        `INSERT INTO fundi_subscriptions (fundi_id, package_id, start_date, end_date, payment_reference)
         VALUES ($1, $2, $3, $4, $5)`,
        [fundiId, pkg.id, startDate, endDate, paymentRef]
      );

      // Update Fundi Profile Sub Type
      await client.query(
        `UPDATE fundi_profiles 
         SET subscription_plan = $1, subscription_expires_at = $2 
         WHERE user_id = $3`,
        [packageTier, endDate, fundiId]
      );
    });

    res.status(200).json({
      message: `Successfully subscribed to ${packageTier} tier`,
      expiresAt: endDate
    });
  } catch (error) {
    console.error('Subscription failed:', error);
    res.status(500).json({ error: 'Subscription booking transaction failed' });
  }
});

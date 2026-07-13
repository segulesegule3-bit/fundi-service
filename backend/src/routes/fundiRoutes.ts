import { Router, Request, Response } from 'express';
import { db } from '../db';
import { RecommendationService } from '../services/recommendationService';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { NIDAService } from '../services/nidaService';
import { SecurityService } from '../services/securityService';
import { 
  profileUpdateSchema, 
  certificateSchema, 
  educationSchema, 
  licenseSchema, 
  portfolioItemSchema 
} from '../validators/profileValidator';
import fs from 'fs';
import path from 'path';

export const fundiRouter = Router();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

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
 * @route POST /api/fundis/upload
 * @desc Secure file upload endpoint (Base64-based) with virus scan, extension verification, and encryption
 */
fundiRouter.post('/upload', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const { fileName, fileData } = req.body; // fileData is base64 string

  try {
    if (!fileName || !fileData) {
      res.status(400).json({ error: 'fileName and fileData (Base64) are required' });
      return;
    }

    const fileBuffer = Buffer.from(fileData, 'base64');
    
    // 1. File size limit validation (5MB)
    if (fileBuffer.length > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'File size exceeds the 5MB limit' });
      return;
    }

    // 2. Validate declared extension matches magic bytes signature
    const ext = path.extname(fileName);
    let mimeType: string;
    try {
      mimeType = SecurityService.validateMagicBytes(fileBuffer, ext);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
      return;
    }

    // 3. Virus scanning signature/heuristics checks
    const isClean = await SecurityService.scanFileForViruses(fileBuffer);
    if (!isClean) {
      res.status(400).json({ error: 'Security Threat: File rejected by virus scan engine' });
      return;
    }

    // 4. Save to local upload directory
    const uniqueFileName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFileName);
    fs.writeFileSync(filePath, fileBuffer);

    // 5. Encrypt local path/URL for database storage security
    const savedPath = `/uploads/${uniqueFileName}`;
    const encryptedPath = SecurityService.encrypt(savedPath);

    res.status(201).json({
      message: 'File uploaded and validated successfully',
      mimeType,
      fileKey: encryptedPath
    });
  } catch (error: any) {
    console.error('Upload failed:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

/**
 * @route GET /api/fundis/search
 * @desc Search and filter Fundis using upgraded professional profile filters
 */
fundiRouter.get('/search', async (req: Request, res: Response): Promise<void> => {
  const {
    professionId,
    primaryOnly,
    regionId,
    districtId,
    wardId,
    minRating,
    minExperience,
    maxExperience,
    skillLevel, // 'Beginner' | 'Intermediate' | 'Professional' | 'Expert' | 'Master'
    minPrice,
    maxPrice,
    emergencyService,
    vetaCertified,
    topRated,
    premiumFundi,
    language, // 'Swahili' | 'English' etc.
    verified, // general verified_badge
    online,
    latitude,
    longitude,
    radiusKm = '15',
    sortBy, // 'rating' | 'experience' | 'distance' | 'price'
    keyword,
    warranty
  } = req.query;

  try {
    let sql = `
      SELECT 
        u.id, 
        u.full_name, 
        u.profile_picture_url, 
        string_agg(CASE WHEN fprof."isPrimary" = true THEN p.name_en ELSE NULL END, '') as primary_profession_en,
        string_agg(CASE WHEN fprof."isPrimary" = true THEN p.name_sw ELSE NULL END, '') as primary_profession_sw,
        string_agg(CASE WHEN fprof."isPrimary" = false THEN p.name_en ELSE NULL END, ', ') as secondary_professions_en,
        string_agg(CASE WHEN fprof."isPrimary" = false THEN p.name_sw ELSE NULL END, ', ') as secondary_professions_sw,
        string_agg(p.name_en, ', ') as profession_name,
        string_agg(p.name_sw, ', ') as profession_name_sw,
        bool_or(fprof."isPrimary") as search_match_is_primary,
        fp.average_rating, 
        fp.completed_jobs, 
        COALESCE(target_fprof.starting_price, fp.hourly_rate) as starting_price, 
        fp.verified_badge, 
        fp.online_status, 
        COALESCE(target_fprof.experience_years, fp.experience_years) as experience_years,
        target_fprof.skill_level as skill_level,
        fp.bio,
        fp.veta_certified,
        fp.top_rated,
        fp.premium_fundi,
        fp.emergency_service_enabled,
        ST_X(fp.gps_location::geometry) as longitude,
        ST_Y(fp.gps_location::geometry) as latitude
      FROM fundi_profiles fp
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN fundi_professions fprof ON fp.user_id = fprof."fundiId"
      LEFT JOIN professions p ON fprof."professionId" = p.id
      -- Join to capture target profession specifics if filtered
      LEFT JOIN fundi_professions target_fprof ON fp.user_id = target_fprof."fundiId" 
        ${professionId ? `AND target_fprof."professionId" = $1` : ''}
      WHERE u.status = 'active'
    `;

    const params: unknown[] = [];
    if (professionId) {
      params.push(professionId);
      sql += ` AND fprof."professionId" = $1`;
    }

    if (primaryOnly === 'true') {
      sql += ` AND fprof."isPrimary" = true`;
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
    if (minRating) {
      params.push(parseFloat(minRating as string));
      sql += ` AND fp.average_rating >= $${params.length}`;
    }
    if (minPrice) {
      params.push(parseFloat(minPrice as string));
      sql += ` AND COALESCE(target_fprof.starting_price, fp.starting_price, fp.hourly_rate) >= $${params.length}`;
    }
    if (maxPrice) {
      params.push(parseFloat(maxPrice as string));
      sql += ` AND COALESCE(target_fprof.starting_price, fp.starting_price, fp.hourly_rate) <= $${params.length}`;
    }
    if (minExperience) {
      params.push(parseInt(minExperience as string));
      sql += ` AND COALESCE(target_fprof.experience_years, fp.experience_years) >= $${params.length}`;
    }
    if (maxExperience) {
      params.push(parseInt(maxExperience as string));
      sql += ` AND COALESCE(target_fprof.experience_years, fp.experience_years) <= $${params.length}`;
    }
    if (skillLevel) {
      params.push(skillLevel);
      sql += ` AND COALESCE(target_fprof.skill_level, 'Beginner') = $${params.length}`;
    }
    if (emergencyService === 'true') {
      sql += ` AND fp.emergency_service_enabled = true`;
    }
    if (vetaCertified === 'true') {
      sql += ` AND fp.veta_certified = true`;
    }
    if (topRated === 'true') {
      sql += ` AND fp.top_rated = true`;
    }
    if (premiumFundi === 'true') {
      sql += ` AND fp.premium_fundi = true`;
    }
    if (verified === 'true') {
      sql += ` AND fp.verified_badge = true`;
    }
    if (online === 'true') {
      sql += ` AND fp.online_status = true`;
    }
    if (language) {
      params.push(language);
      sql += ` AND $${params.length} = ANY(fp.languages_spoken)`;
    }
    if (keyword) {
      params.push(`%${keyword}%`);
      sql += ` AND (u.full_name ILIKE $${params.length} OR fp.bio ILIKE $${params.length} OR p.name_en ILIKE $${params.length} OR p.name_sw ILIKE $${params.length} OR $${params.length} = ANY(fp.skills))`;
    }
    if (warranty === 'true' || warranty === 'yes') {
      sql += ` AND fp.service_warranty IS NOT NULL AND fp.service_warranty != 'No Warranty' AND fp.service_warranty != ''`;
    }

    sql += ` GROUP BY u.id, fp.user_id, target_fprof.starting_price, target_fprof.experience_years, target_fprof.skill_level`;

    const result = await db.query(sql, params);
    let fundis = result.rows;

    // Filter by distance if coordinates exist
    if (latitude && longitude) {
      const customerLat = parseFloat(latitude as string);
      const customerLng = parseFloat(longitude as string);
      const limitRadius = parseFloat(radiusKm as string);

      fundis = fundis.map(fundi => {
        const fundiLat = parseFloat(fundi.latitude);
        const fundiLng = parseFloat(fundi.longitude);
        
        let distance = 99999;
        if (!isNaN(fundiLat) && !isNaN(fundiLng)) {
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

      fundis = fundis.filter(f => f.distanceKm <= limitRadius);
    }

    // Sort matching fundis
    fundis.sort((a, b) => {
      if (sortBy === 'rating') {
        const diff = parseFloat(b.average_rating || '0') - parseFloat(a.average_rating || '0');
        if (Math.abs(diff) > 0.01) return diff;
      } else if (sortBy === 'experience') {
        const diff = (b.experience_years || 0) - (a.experience_years || 0);
        if (diff !== 0) return diff;
      } else if (sortBy === 'price') {
        const diff = parseFloat(a.starting_price || a.hourly_rate || '0') - parseFloat(b.starting_price || b.hourly_rate || '0');
        if (Math.abs(diff) > 0.01) return diff;
      } else if (sortBy === 'distance' && latitude && longitude) {
        const diff = (a.distanceKm || 999) - (b.distanceKm || 999);
        if (Math.abs(diff) > 0.1) return diff;
      }
      
      const aPrimary = a.search_match_is_primary === true || a.search_match_is_primary === 'true';
      const bPrimary = b.search_match_is_primary === true || b.search_match_is_primary === 'true';
      if (aPrimary && !bPrimary) return -1;
      if (!aPrimary && bPrimary) return 1;
      
      return 0;
    });

    res.status(200).json(fundis);
  } catch (error) {
    console.error('Error searching fundis:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * @route GET /api/fundis/recommend
 * @desc AI Recommendation engine
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
 * @desc Get upgraded detailed profile with normalized lists
 */
fundiRouter.get('/profile/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    // 1. Fetch profile core details
    const profileRes = await db.query(
      `SELECT 
        u.id, u.full_name, u.email, u.phone_number, u.profile_picture_url, u.status,
        string_agg(CASE WHEN fprof."isPrimary" = true THEN p.name_en ELSE NULL END, '') as primary_profession_en,
        string_agg(CASE WHEN fprof."isPrimary" = true THEN p.name_sw ELSE NULL END, '') as primary_profession_sw,
        string_agg(CASE WHEN fprof."isPrimary" = false THEN p.name_en ELSE NULL END, ', ') as secondary_professions_en,
        string_agg(CASE WHEN fprof."isPrimary" = false THEN p.name_sw ELSE NULL END, ', ') as secondary_professions_sw,
        string_agg(p.name_en, ', ') as profession_name, 
        string_agg(p.name_sw, ', ') as profession_name_sw,
        fp.bio, fp.skills, fp.experience_years, COALESCE(fp.starting_price, fp.hourly_rate) as starting_price,
        r.name as region_name, d.name as district_name, w.name as ward_name, v.name as village_name,
        fp.working_days, fp.working_hours_start, fp.working_hours_end, fp.online_status, fp.verified_badge,
        fp.average_rating, fp.total_reviews, fp.completed_jobs, fp.average_response_time, fp.subscription_plan,
        fp.service_warranty, fp.vacation_dates, fp.emergency_availability, fp.on_site_service, fp.remote_service,
        -- Upgraded fields
        fp.service_area_type, fp.service_area_radius, fp.languages_spoken,
        fp.emergency_service_enabled, fp.vacation_mode, fp.vacation_start, fp.vacation_end,
        fp.lunch_break_start, fp.lunch_break_end, fp.identity_verified, fp.profession_verified,
        fp.certificate_verified, fp.veta_certified, fp.premium_fundi, fp.top_rated, fp.background_checked,
        fp.last_active_at,
        ST_X(fp.gps_location::geometry) as longitude, ST_Y(fp.gps_location::geometry) as latitude
       FROM users u
       JOIN fundi_profiles fp ON u.id = fp.user_id
       LEFT JOIN fundi_professions fprof ON fp.user_id = fprof."fundiId"
       LEFT JOIN professions p ON fprof."professionId" = p.id
       LEFT JOIN regions r ON fp.region_id = r.id
       LEFT JOIN districts d ON fp.district_id = d.id
       LEFT JOIN wards w ON fp.ward_id = w.id
       LEFT JOIN villages v ON fp.village_id = v.id
       WHERE u.id = $1
       GROUP BY u.id, fp.user_id, r.id, d.id, w.id, v.id`,
      [userId]
    );

    if (profileRes.rowCount === 0) {
       res.status(404).json({ error: 'Fundi profile not found' });
       return;
    }

    // 2. Fetch specific professions list
    const professionsRes = await db.query(
      `SELECT fp.*, p.name_en, p.name_sw 
       FROM fundi_professions fp 
       JOIN professions p ON fp."professionId" = p.id 
       WHERE fp."fundiId" = $1`,
      [userId]
    );

    // 3. Fetch certificates
    const certificatesRes = await db.query(
      `SELECT * FROM certificates WHERE fundi_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    // Decrypt certificate URLs if encrypted
    const certificates = certificatesRes.rows.map(cert => {
      if (cert.image_url && cert.image_url.includes(':')) {
        try {
          cert.image_url = SecurityService.decrypt(cert.image_url);
        } catch {
          // Fallback if not encrypted or corrupted
        }
      }
      return cert;
    });

    // 4. Fetch education list
    const educationRes = await db.query(
      `SELECT * FROM education WHERE fundi_id = $1 ORDER BY start_date DESC`,
      [userId]
    );

    // 5. Fetch licenses list
    const licensesRes = await db.query(
      `SELECT * FROM licenses WHERE fundi_profile_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const licenses = licensesRes.rows.map(lic => {
      if (lic.credential_url && lic.credential_url.includes(':')) {
        try {
          lic.credential_url = SecurityService.decrypt(lic.credential_url);
        } catch {
          // Fallback
        }
      }
      return lic;
    });

    // 6. Fetch portfolio items
    const portfolioRes = await db.query(
      `SELECT * FROM portfolio_items WHERE fundi_id = $1 ORDER BY completion_date DESC`,
      [userId]
    );

    const portfolio = portfolioRes.rows.map(item => {
      if (item.before_image_url && item.before_image_url.includes(':')) {
        try { item.before_image_url = SecurityService.decrypt(item.before_image_url); } catch {}
      }
      if (item.after_image_url && item.after_image_url.includes(':')) {
        try { item.after_image_url = SecurityService.decrypt(item.after_image_url); } catch {}
      }
      if (item.video_url && item.video_url.includes(':')) {
        try { item.video_url = SecurityService.decrypt(item.video_url); } catch {}
      }
      return item;
    });

    // 7. Fetch reviews
    const reviewsRes = await db.query(
      `SELECT r.id, r.rating, r.comment, r.photos_urls, r.video_url, r.created_at,
              r.before_photos_urls, r.after_photos_urls, r.project_cost, r.completion_date,
              u.full_name as customer_name, u.profile_picture_url as customer_picture
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       WHERE r.fundi_id = $1 AND r.is_fake = false
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      profile: profileRes.rows[0],
      professions: professionsRes.rows,
      certificates,
      education: educationRes.rows,
      licenses,
      portfolio,
      reviews: reviewsRes.rows
    });
  } catch (error) {
    console.error('Error fetching fundi profile:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

/**
 * @route PUT /api/fundis/profile
 * @desc Upgraded route to update weekly schedule, pricing, service area, and languages spoken
 */
fundiRouter.put('/profile', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized session' });
    return;
  }

  // Validate request body
  const parseResult = profileUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    return;
  }

  const {
    bio,
    experienceYears,
    startingPrice,
    languagesSpoken,
    serviceAreaType,
    serviceAreaRadius,
    emergencyServiceEnabled,
    vacationMode,
    vacationStart,
    vacationEnd,
    workingDays,
    workingHoursStart,
    workingHoursEnd,
    lunchBreakStart,
    lunchBreakEnd,
    professions
  } = parseResult.data;

  try {
    await db.transaction(async (client) => {
      // 1. Update Core Fundi Profile Fields
      await client.query(
        `UPDATE fundi_profiles 
         SET bio = COALESCE($1, bio),
             experience_years = COALESCE($2, experience_years),
             starting_price = COALESCE($3, starting_price, hourly_rate),
             languages_spoken = COALESCE($4, languages_spoken),
             service_area_type = COALESCE($5, service_area_type),
             service_area_radius = COALESCE($6, service_area_radius),
             emergency_service_enabled = COALESCE($7, emergency_service_enabled),
             vacation_mode = COALESCE($8, vacation_mode),
             vacation_start = COALESCE($9, vacation_start::date),
             vacation_end = COALESCE($10, vacation_end::date),
             working_days = COALESCE($11, working_days),
             working_hours_start = COALESCE($12, working_hours_start::time),
             working_hours_end = COALESCE($13, working_hours_end::time),
             lunch_break_start = COALESCE($14, lunch_break_start::time),
             lunch_break_end = COALESCE($15, lunch_break_end::time),
             updated_at = NOW(),
             last_active_at = NOW()
         WHERE user_id = $16`,
        [
          bio,
          experienceYears,
          startingPrice,
          languagesSpoken,
          serviceAreaType,
          serviceAreaRadius,
          emergencyServiceEnabled,
          vacationMode,
          vacationStart,
          vacationEnd,
          workingDays,
          workingHoursStart,
          workingHoursEnd,
          lunchBreakStart,
          lunchBreakEnd,
          userId
        ]
      );

      // 2. Overwrite / Update professions and pricing details if provided
      if (professions && professions.length > 0) {
        // Delete current mappings
        await client.query(`DELETE FROM fundi_professions WHERE "fundiId" = $1`, [userId]);
        
        // Insert upgraded mappings
        for (const prof of professions) {
          await client.query(
            `INSERT INTO fundi_professions (
              id, "fundiId", "professionId", "isPrimary",
              experience_years, skill_level, starting_price,
              minimum_price, maximum_price, emergency_price, weekend_price
             ) VALUES (
              gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
             )`,
            [
              userId,
              prof.professionId,
              prof.isPrimary,
              prof.experienceYears,
              prof.skillLevel,
              prof.startingPrice,
              prof.minimumPrice,
              prof.maximumPrice,
              prof.emergencyPrice,
              prof.weekendPrice
            ]
          );
        }
      }
    });

    res.status(200).json({ message: 'Profile upgraded details updated successfully.' });
  } catch (error: any) {
    console.error('Failed to update profile settings:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

/**
 * @route POST /api/fundis/certificates
 * @desc Add a new professional certification record
 */
fundiRouter.post('/certificates', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized session' });
    return;
  }

  const parseResult = certificateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    return;
  }

  const { name, institution, certificateNumber, issueDate, expiryDate, imageUrl } = parseResult.data;

  try {
    const result = await db.query(
      `INSERT INTO certificates (
        fundi_id, name, institution, certificate_number, issue_date, expiry_date, image_url, verification_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_verification') RETURNING *`,
      [userId, name, institution, certificateNumber, new Date(issueDate), expiryDate ? new Date(expiryDate) : null, imageUrl]
    );

    res.status(201).json({ message: 'Certificate added and pending verification.', certificate: result.rows[0] });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create certificate: ' + error.message });
  }
});

/**
 * @route DELETE /api/fundis/certificates/:id
 * @desc Delete a certification record
 */
fundiRouter.delete('/certificates/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM certificates WHERE id = $1 AND fundi_id = $2 RETURNING *`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Certificate record not found or unauthorized' });
      return;
    }

    res.status(200).json({ message: 'Certificate deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

/**
 * @route POST /api/fundis/education
 * @desc Add education record
 */
fundiRouter.post('/education', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized session' });
    return;
  }

  const parseResult = educationSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    return;
  }

  const { institution, course, level, startDate, endDate } = parseResult.data;

  try {
    const result = await db.query(
      `INSERT INTO education (
        fundi_id, institution, course, level, start_date, end_date
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, institution, course, level, new Date(startDate), new Date(endDate)]
    );

    res.status(201).json({ message: 'Education history added successfully.', education: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save education: ' + error.message });
  }
});

/**
 * @route DELETE /api/fundis/education/:id
 * @desc Delete education record
 */
fundiRouter.delete('/education/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM education WHERE id = $1 AND fundi_id = $2 RETURNING *`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Education record not found or unauthorized' });
      return;
    }

    res.status(200).json({ message: 'Education history deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete education' });
  }
});

/**
 * @route POST /api/fundis/licenses
 * @desc Add a new professional license
 */
fundiRouter.post('/licenses', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized session' });
    return;
  }

  const parseResult = licenseSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    return;
  }

  const { licenseNumber, authority, expiryDate, credentialUrl } = parseResult.data;

  try {
    const result = await db.query(
      `INSERT INTO licenses (
        fundi_profile_id, license_number, authority, expiry_date, status, credential_url
      ) VALUES ($1, $2, $3, $4, 'pending_verification', $5) RETURNING *`,
      [userId, licenseNumber, authority, new Date(expiryDate), credentialUrl]
    );

    res.status(201).json({ message: 'License added and pending verification.', license: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save license: ' + error.message });
  }
});

/**
 * @route DELETE /api/fundis/licenses/:id
 * @desc Delete license
 */
fundiRouter.delete('/licenses/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM licenses WHERE id = $1 AND fundi_profile_id = $2 RETURNING *`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'License record not found or unauthorized' });
      return;
    }

    res.status(200).json({ message: 'License deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete license' });
  }
});

/**
 * @route POST /api/fundis/portfolio
 * @desc Add a new project to professional portfolio
 */
fundiRouter.post('/portfolio', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized session' });
    return;
  }

  const parseResult = portfolioItemSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    return;
  }

  const {
    title,
    description,
    mediaUrls,
    videoUrl,
    beforeImageUrl,
    afterImageUrl,
    completionDate,
    clientApproved,
    serviceCategory,
    location,
    clientReviewId
  } = parseResult.data;

  try {
    const result = await db.query(
      `INSERT INTO portfolio_items (
        fundi_id, title, description, media_urls, video_url, 
        before_image_url, after_image_url, completion_date, 
        client_approved, service_category, location, client_review_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        userId,
        title,
        description || '',
        mediaUrls,
        videoUrl || null,
        beforeImageUrl || null,
        afterImageUrl || null,
        completionDate ? new Date(completionDate) : null,
        clientApproved,
        serviceCategory || '',
        location || '',
        clientReviewId || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create portfolio item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route DELETE /api/fundis/portfolio/:id
 * @desc Delete a portfolio item
 */
fundiRouter.delete('/portfolio/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM portfolio_items WHERE id = $1 AND fundi_id = $2 RETURNING *`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Portfolio item not found or unauthorized' });
      return;
    }

    res.status(200).json({ message: 'Portfolio item deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete portfolio item' });
  }
});

/**
 * @route POST /api/fundis/subscribe
 * @desc Purchase/renew a subscription package
 */
fundiRouter.post('/subscribe', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { fundiId, packageTier, paymentRef } = req.body;

  try {
    if (req.user?.id !== fundiId && req.user?.role !== 'super_admin') {
      res.status(403).json({ error: 'Access Denied: Cannot modify subscriptions for another user' });
      return;
    }
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

/**
 * @route POST /api/fundis/nida/verify
 * @desc Verify NIDA identity details securely
 */
fundiRouter.post('/nida/verify', async (req: Request, res: Response): Promise<void> => {
  const { nida, fundiProfileId } = req.body;
  if (!nida) {
    res.status(400).json({ success: false, error: 'NIDA number is required.' });
    return;
  }

  try {
    const verification = await NIDAService.verifyNIDA(nida, fundiProfileId);
    res.status(200).json({ success: true, data: verification });
  } catch (error: any) {
    console.error('NIDA route verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

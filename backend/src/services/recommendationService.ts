import { db } from '../db';

export interface RecommendationRequest {
  professionId: string;
  latitude: number;
  longitude: number;
  maxDistanceKm?: number; // default 15km
  limit?: number; // default 5
}

export interface RecommendedFundi {
  userId: string;
  fullName: string;
  professionName: string;
  profilePictureUrl: string;
  distanceKm: number;
  averageRating: number;
  completedJobs: number;
  startingPrice: number;
  averageResponseTime: number;
  verifiedBadge: boolean;
  onlineStatus: boolean;
  subscriptionPlan: string;
  aiScore: number; // Computed score
}

export class RecommendationService {
  /**
   * Calculate distance between two lat/lng coordinates using the Haversine formula
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  /**
   * Recommend fundis using the AI scoring algorithm
   */
  public static async recommendFundis(req: RecommendationRequest): Promise<RecommendedFundi[]> {
    const { professionId, latitude, longitude, maxDistanceKm = 15, limit = 5 } = req;

    // Fetch all active fundis with their profile & target profession details
    const query = `
      SELECT 
        u.id as user_id,
        u.full_name,
        u.profile_picture_url,
        string_agg(p.name_en, ', ') as profession_name,
        target_fprof."isPrimary" as is_primary_match,
        target_fprof.experience_years as specific_experience,
        target_fprof.skill_level as specific_skill_level,
        target_fprof.starting_price as specific_price,
        fp.average_rating,
        fp.completed_jobs,
        fp.average_response_time,
        fp.verified_badge,
        fp.online_status,
        fp.subscription_plan,
        fp.emergency_service_enabled,
        fp.vacation_mode,
        ST_X(fp.gps_location::geometry) as longitude,
        ST_Y(fp.gps_location::geometry) as latitude
      FROM fundi_profiles fp
      JOIN users u ON fp.user_id = u.id
      JOIN fundi_professions target_fprof ON fp.user_id = target_fprof."fundiId" AND target_fprof."professionId" = $1
      LEFT JOIN fundi_professions fprof ON fp.user_id = fprof."fundiId"
      LEFT JOIN professions p ON fprof."professionId" = p.id
      WHERE u.status = 'active'
      GROUP BY u.id, fp.user_id, target_fprof."isPrimary", target_fprof.experience_years, target_fprof.skill_level, target_fprof.starting_price
    `;

    const result = await db.query(query, [professionId]);
    const fundis: RecommendedFundi[] = [];

    // Calculate average price of the matching group to establish price scoring reference
    let totalPrice = 0;
    let countPrice = 0;
    for (const row of result.rows) {
      const price = parseFloat(row.specific_price || '0');
      if (price > 0) {
        totalPrice += price;
        countPrice++;
      }
    }
    const averagePrice = countPrice > 0 ? totalPrice / countPrice : 20000;

    for (const row of result.rows) {
      const fundiLat = parseFloat(row.latitude);
      const fundiLng = parseFloat(row.longitude);

      if (isNaN(fundiLat) || isNaN(fundiLng)) continue;

      const distance = this.calculateDistance(latitude, longitude, fundiLat, fundiLng);

      // Filter by max distance
      if (distance > maxDistanceKm) continue;

      // COMPUTE UPGRADED AI SCORE (0 to 100) based on Plan weights:
      
      // 1. Primary Profession Match (30% weight)
      const isPrimaryMatch = row.is_primary_match === true || row.is_primary_match === 'true';
      const primaryScore = isPrimaryMatch ? 30 : 10;

      // 2. Distance Score (20% weight)
      const distanceScore = Math.max(0, 1 - distance / maxDistanceKm) * 20;

      // 3. Experience Score (15% weight) - specific experience capped at 15 years
      const specificExp = parseInt(row.specific_experience || '0');
      const experienceScore = Math.min(1, specificExp / 15) * 15;

      // 4. Skill Level Score (10% weight)
      let skillScore = 2; // Beginner default
      const skillLevel = (row.specific_skill_level || 'Beginner').toLowerCase();
      if (skillLevel === 'intermediate') skillScore = 4;
      else if (skillLevel === 'professional') skillScore = 6;
      else if (skillLevel === 'expert') skillScore = 8;
      else if (skillLevel === 'master') skillScore = 10;

      // 5. Rating Score (10% weight)
      const rating = parseFloat(row.average_rating || '0');
      const ratingScore = (rating / 5) * 10;

      // 6. Response Speed Score (5% weight)
      const responseTime = parseInt(row.average_response_time || '60');
      const responseScore = Math.max(0, 1 - responseTime / 60) * 5;

      // 7. Availability & Schedule Score (5% weight)
      let availabilityScore = 0;
      if (row.online_status && !row.vacation_mode) {
        availabilityScore += 3;
      }
      if (row.emergency_service_enabled) {
        availabilityScore += 2;
      }

      // 8. Pricing Score (3% weight) - Lower price than average adds score
      const price = parseFloat(row.specific_price || '0');
      let priceScore = 1.5; // Neutral
      if (price > 0 && averagePrice > 0) {
        // If price is lower than average, give higher score
        const priceRatio = averagePrice / price;
        priceScore = Math.min(3, priceRatio * 1.5);
      }

      // 9. Repeat Customer Score (2% weight) - Mock score (jobs completed / 30)
      const completedJobs = parseInt(row.completed_jobs || '0');
      const repeatCustomerScore = Math.min(2, (completedJobs / 30));

      const aiScore = parseFloat(
        (primaryScore + distanceScore + experienceScore + skillScore + ratingScore + responseScore + availabilityScore + priceScore + repeatCustomerScore).toFixed(2)
      );

      fundis.push({
        userId: row.user_id,
        fullName: row.full_name,
        professionName: row.profession_name,
        profilePictureUrl: row.profile_picture_url || '',
        distanceKm: parseFloat(distance.toFixed(2)),
        averageRating: rating,
        completedJobs,
        startingPrice: price || parseFloat(row.starting_price || row.hourly_rate || '0'),
        averageResponseTime: responseTime,
        verifiedBadge: row.verified_badge || false,
        onlineStatus: row.online_status || false,
        subscriptionPlan: row.subscription_plan || 'free',
        aiScore
      });
    }

    // Sort by AI Score descending
    fundis.sort((a, b) => b.aiScore - a.aiScore);

    return fundis.slice(0, limit);
  }
}

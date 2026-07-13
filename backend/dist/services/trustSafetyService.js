"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustSafetyService = void 0;
const db_1 = require("../db");
class TrustSafetyService {
    /**
     * Recalculates the Trust Score (0-100) of a Fundi Profile
     */
    static async recalculateTrustScore(fundiProfileId) {
        try {
            // 1. Load Fundi profile stats
            const fundiRes = await db_1.db.query(`SELECT fp.id, fp.verified_badge, fp.completed_jobs,
                COALESCE((SELECT AVG(rating) FROM reviews WHERE fundi_id = fp.id), 5.00) as avg_rating
         FROM fundi_profiles fp
         WHERE fp.id = $1`, [fundiProfileId]);
            if (fundiRes.rowCount === 0)
                return 100;
            const profile = fundiRes.rows[0];
            const verifiedIdentity = profile.verified_badge || false;
            // Check EWURA/VETA certificate approvals
            const certRes = await db_1.db.query(`SELECT COUNT(*) as count FROM certificates WHERE fundi_profile_id = $1 AND status = 'active'`, [fundiProfileId]);
            const verifiedCertificates = parseInt(certRes.rows[0].count) > 0;
            // Count warranty claims
            const claimsRes = await db_1.db.query(`SELECT COUNT(*) as count 
         FROM warranty_claims wc
         JOIN warranties w ON wc.warranty_id = w.id
         JOIN bookings b ON w.booking_id = b.id
         WHERE b.fundi_id = (SELECT user_id FROM fundi_profiles WHERE id = $1) AND wc.status = 'ACCEPTED'`, [fundiProfileId]);
            const claimCount = parseInt(claimsRes.rows[0].count);
            // 2. Compute Score components
            let score = 70; // Base score
            if (verifiedIdentity)
                score += 10;
            if (verifiedCertificates)
                score += 10;
            // Jobs completed modifier (up to 10 points)
            const jobsModifier = Math.min(10, (profile.completed_jobs || 0) * 2);
            score += jobsModifier;
            // Rating modifier (up to 10 points)
            const ratingVal = parseFloat(profile.avg_rating);
            const ratingModifier = Math.round(ratingVal * 2);
            score += ratingModifier;
            // Deduct for warranty claims
            score -= claimCount * 5;
            // Caps
            const finalScore = Math.min(100, Math.max(0, score));
            // 3. Update database
            await db_1.db.query(`INSERT INTO trust_scores (fundi_profile_id, score, verified_identity, verified_certificates, jobs_completed, avg_rating, response_time_mins)
         VALUES ($1, $2, $3, $4, $5, $6, 15)
         ON CONFLICT (fundi_profile_id) DO UPDATE 
         SET score = EXCLUDED.score,
             verified_identity = EXCLUDED.verified_identity,
             verified_certificates = EXCLUDED.verified_certificates,
             jobs_completed = EXCLUDED.jobs_completed,
             avg_rating = EXCLUDED.avg_rating,
             updated_at = NOW()`, [fundiProfileId, finalScore, verifiedIdentity, verifiedCertificates, profile.completed_jobs || 0, ratingVal]);
            // Trigger progression level update
            await this.updateProgressionLevel(fundiProfileId, finalScore, profile.completed_jobs || 0);
            return finalScore;
        }
        catch (err) {
            console.error('Error recalculating trust score:', err);
            return 100;
        }
    }
    /**
     * Updates the Progression Level of a Fundi Profile
     */
    static async updateProgressionLevel(fundiProfileId, trustScore, jobsCount) {
        let level = 'BRONZE';
        if (jobsCount >= 100 && trustScore >= 95) {
            level = 'ELITE';
        }
        else if (jobsCount >= 50 && trustScore >= 90) {
            level = 'DIAMOND';
        }
        else if (jobsCount >= 30 && trustScore >= 85) {
            level = 'PLATINUM';
        }
        else if (jobsCount >= 15 && trustScore >= 80) {
            level = 'GOLD';
        }
        else if (jobsCount >= 5 && trustScore >= 75) {
            level = 'SILVER';
        }
        await db_1.db.query(`INSERT INTO fundi_levels (fundi_profile_id, current_level, points)
       VALUES ($1, $2, $3)
       ON CONFLICT (fundi_profile_id) DO UPDATE 
       SET current_level = EXCLUDED.current_level,
           points = EXCLUDED.points,
           updated_at = NOW()`, [fundiProfileId, level, jobsCount * 10]);
        return level;
    }
}
exports.TrustSafetyService = TrustSafetyService;

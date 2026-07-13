"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPSService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../config/logger"));
class GPSService {
    // In-memory cache simulating fast Redis namespace storage for performance
    static locationCache = new Map();
    /**
     * Calculates distance between two coordinates in kilometers using Haversine formula
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    /**
     * Updates a Fundi's coordinates with location spoofing protection checks
     */
    static async updateLocation(fundiId, lat, lng) {
        const now = Date.now();
        const lastLocation = GPSService.locationCache.get(fundiId);
        if (lastLocation) {
            const distance = GPSService.calculateDistance(lastLocation.latitude, lastLocation.longitude, lat, lng);
            const timeDiffSeconds = (now - lastLocation.timestamp) / 1000;
            if (timeDiffSeconds > 0) {
                // Velocity check: speed = distance / time. Reject if speed exceeds 150 km/h (impossible speed jumps check)
                const speedKmh = (distance / timeDiffSeconds) * 3600;
                if (speedKmh > 150) {
                    logger_1.default.warn(`[GPS Spoofing Alert] Fundi ${fundiId} update rejected. Speed: ${speedKmh.toFixed(1)} km/h.`);
                    return false;
                }
            }
        }
        // Update memory cache
        GPSService.locationCache.set(fundiId, {
            latitude: lat,
            longitude: lng,
            timestamp: now,
        });
        // Persist in background database tables asynchronously
        prisma_1.default.fundiLocation.create({
            data: {
                fundiId,
                latitude: lat,
                longitude: lng,
            },
        }).catch(err => {
            logger_1.default.error(`[DB Error] Saving fundi location: ${err.message}`);
        });
        return true;
    }
    /**
     * Retrieves last cached location of a fundi
     */
    static getLocation(fundiId) {
        return GPSService.locationCache.get(fundiId) || null;
    }
    /**
     * Searches for online fundis within a specific kilometer radius using Haversine filters
     */
    static async findNearbyFundis(lat, lng, radiusKm) {
        // 1. Get all active online fundis
        const onlineFundis = await prisma_1.default.user.findMany({
            where: {
                role: 'FUNDI',
                isActive: true,
                fundiProfile: {
                    isOnline: true,
                },
            },
            include: {
                fundiProfile: true,
            },
        });
        const results = [];
        // 2. Filter using our cached GPS coordinates
        for (const fundi of onlineFundis) {
            const coords = GPSService.getLocation(fundi.id);
            if (coords) {
                const distance = GPSService.calculateDistance(lat, lng, coords.latitude, coords.longitude);
                if (distance <= radiusKm) {
                    results.push({
                        fundiId: fundi.id,
                        fullName: fundi.fullName,
                        phone: fundi.phoneNumber,
                        distance,
                        rating: fundi.fundiProfile?.startingPrice, // mock rating representation or lookup
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                    });
                }
            }
        }
        // Sort by distance (nearest first)
        return results.sort((a, b) => a.distance - b.distance);
    }
}
exports.GPSService = GPSService;

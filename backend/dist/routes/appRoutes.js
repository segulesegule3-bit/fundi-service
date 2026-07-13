"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
exports.appRouter = (0, express_1.Router)();
/**
 * Helper to parse User Agent and extract device and OS info
 */
function parseUserAgent(ua) {
    if (!ua)
        return { device: 'Unknown', os: 'Unknown' };
    let device = 'Desktop';
    let os = 'Unknown OS';
    const uaLower = ua.toLowerCase();
    if (uaLower.includes('android')) {
        device = 'Android Phone';
        os = 'Android';
        const match = ua.match(/Android\s([0-9\.]+)/);
        if (match)
            os = `Android ${match[1]}`;
    }
    else if (uaLower.includes('iphone') || uaLower.includes('ipad')) {
        device = uaLower.includes('iphone') ? 'iPhone' : 'iPad';
        os = 'iOS';
        const match = ua.match(/OS\s([0-9_]+)/);
        if (match)
            os = `iOS ${match[1].replace(/_/g, '.')}`;
    }
    else if (uaLower.includes('windows')) {
        device = 'PC';
        os = 'Windows';
    }
    else if (uaLower.includes('macintosh')) {
        device = 'Mac';
        os = 'macOS';
    }
    return { device, os };
}
/**
 * GET /api/app/version
 * Checks the latest versions available for Android APK, Android App Bundle (AAB), and iOS
 */
exports.appRouter.get('/version', async (req, res) => {
    try {
        const latestApk = await db_1.db.query(`SELECT id, version_code, release_notes, type, download_url, force_update, created_at 
       FROM app_releases WHERE type = 'apk' AND is_published = true 
       ORDER BY created_at DESC LIMIT 1`);
        const latestAab = await db_1.db.query(`SELECT id, version_code, release_notes, type, download_url, force_update, created_at 
       FROM app_releases WHERE type = 'aab' AND is_published = true 
       ORDER BY created_at DESC LIMIT 1`);
        const latestIos = await db_1.db.query(`SELECT id, version_code, release_notes, type, download_url, force_update, created_at 
       FROM app_releases WHERE type = 'ios' AND is_published = true 
       ORDER BY created_at DESC LIMIT 1`);
        res.status(200).json({
            apk: latestApk.rowCount !== null && latestApk.rowCount > 0 ? latestApk.rows[0] : null,
            aab: latestAab.rowCount !== null && latestAab.rowCount > 0 ? latestAab.rows[0] : null,
            ios: latestIos.rowCount !== null && latestIos.rowCount > 0 ? latestIos.rows[0] : null,
        });
    }
    catch (error) {
        console.error('[AppRouter] Version check error:', error);
        res.status(500).json({ error: 'Failed to retrieve application version metadata.' });
    }
});
/**
 * GET /api/app/download/apk
 * Serves the latest APK release, logs download analytics, and redirects to the file
 */
exports.appRouter.get('/download/apk', async (req, res) => {
    try {
        const latestApkRes = await db_1.db.query(`SELECT id, download_url FROM app_releases 
       WHERE type = 'apk' AND is_published = true 
       ORDER BY created_at DESC LIMIT 1`);
        if (latestApkRes.rowCount === 0 || latestApkRes.rowCount === null) {
            res.status(404).json({ error: 'No published APK version found.' });
            return;
        }
        const latestApk = latestApkRes.rows[0];
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'];
        const { device, os } = parseUserAgent(userAgent);
        // Insert download analytics
        await db_1.db.query(`INSERT INTO app_download_analytics (release_id, platform, ip_address, device_type, os_version, country)
       VALUES ($1, $2, $3, $4, $5, $6)`, [latestApk.id, 'apk', ipAddress, device, os, 'Tanzania']);
        // Redirect to the file
        res.redirect(latestApk.download_url);
    }
    catch (error) {
        console.error('[AppRouter] APK download redirect error:', error);
        res.status(500).json({ error: 'Server error processing APK download.' });
    }
});
/**
 * GET /api/app/redirect/play-store
 * Logs analytics event for Google Play redirection and redirects
 */
exports.appRouter.get('/redirect/play-store', async (req, res) => {
    try {
        const latestApkRes = await db_1.db.query(`SELECT id FROM app_releases WHERE type = 'apk' AND is_published = true ORDER BY created_at DESC LIMIT 1`);
        const releaseId = latestApkRes.rowCount !== null && latestApkRes.rowCount > 0 ? latestApkRes.rows[0].id : null;
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'];
        const { device, os } = parseUserAgent(userAgent);
        await db_1.db.query(`INSERT INTO app_download_analytics (release_id, platform, ip_address, device_type, os_version, country)
       VALUES ($1, $2, $3, $4, $5, $6)`, [releaseId, 'play_store', ipAddress, device, os, 'Tanzania']);
        // Redirect to Google Play (in production this would be the actual store link)
        res.redirect('https://play.google.com/store/apps/details?id=com.fundiservice.tz');
    }
    catch (error) {
        console.error('[AppRouter] Play Store redirect error:', error);
        res.redirect('https://play.google.com/store');
    }
});
/**
 * GET /api/app/redirect/app-store
 * Logs analytics event for Apple App Store redirection and redirects
 */
exports.appRouter.get('/redirect/app-store', async (req, res) => {
    try {
        const latestIosRes = await db_1.db.query(`SELECT id, download_url FROM app_releases WHERE type = 'ios' AND is_published = true ORDER BY created_at DESC LIMIT 1`);
        const releaseId = latestIosRes.rowCount !== null && latestIosRes.rowCount > 0 ? latestIosRes.rows[0].id : null;
        const redirectUrl = latestIosRes.rowCount !== null && latestIosRes.rowCount > 0 ? latestIosRes.rows[0].download_url : 'https://apps.apple.com/tz/app/fundiservice';
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'];
        const { device, os } = parseUserAgent(userAgent);
        await db_1.db.query(`INSERT INTO app_download_analytics (release_id, platform, ip_address, device_type, os_version, country)
       VALUES ($1, $2, $3, $4, $5, $6)`, [releaseId, 'app_store', ipAddress, device, os, 'Tanzania']);
        res.redirect(redirectUrl);
    }
    catch (error) {
        console.error('[AppRouter] App Store redirect error:', error);
        res.redirect('https://apps.apple.com/app');
    }
});
/**
 * GET /api/app/latest
 * Returns the latest published Android APK release information.
 * Used by native Android applications for automatic update checking.
 */
exports.appRouter.get('/latest', async (req, res) => {
    try {
        const latestApkRes = await db_1.db.query(`SELECT version_code, release_notes, download_url, force_update 
       FROM app_releases WHERE type = 'apk' AND is_published = true 
       ORDER BY created_at DESC LIMIT 1`);
        if (latestApkRes.rowCount === 0 || latestApkRes.rowCount === null) {
            res.status(200).json({
                latestVersion: '1.0.0',
                apkUrl: '/downloads/app-release.apk',
                releaseNotes: 'Toleo la kwanza la majaribio.',
                minVersion: '1.0.0',
                forceUpdate: false
            });
            return;
        }
        const latest = latestApkRes.rows[0];
        res.status(200).json({
            latestVersion: latest.version_code,
            apkUrl: latest.download_url,
            releaseNotes: latest.release_notes,
            minVersion: latest.version_code,
            forceUpdate: latest.force_update
        });
    }
    catch (error) {
        console.error('[AppRouter] Latest apk retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve latest application version data.' });
    }
});

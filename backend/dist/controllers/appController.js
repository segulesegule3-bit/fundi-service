"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../config/logger"));
class AppController {
    static APPS_DIR = path_1.default.resolve(process.cwd(), 'uploads', 'apps');
    /**
     * Initialize directory structure and populate seed versions if database is empty
     */
    static async seedVersionsIfEmpty() {
        try {
            if (!fs_1.default.existsSync(AppController.APPS_DIR)) {
                fs_1.default.mkdirSync(AppController.APPS_DIR, { recursive: true });
                logger_1.default.info(`[AppController] Created apps folder directory at: ${AppController.APPS_DIR}`);
            }
            // Create mock apk files if they don't exist for validation testing
            const customerMockApk = path_1.default.join(AppController.APPS_DIR, 'customer-v1.0.0.apk');
            const fundiMockApk = path_1.default.join(AppController.APPS_DIR, 'fundi-v1.0.0.apk');
            if (!fs_1.default.existsSync(customerMockApk)) {
                fs_1.default.writeFileSync(customerMockApk, 'MOCK_CUSTOMER_APK_BINARY_CONTENT');
            }
            if (!fs_1.default.existsSync(fundiMockApk)) {
                fs_1.default.writeFileSync(fundiMockApk, 'MOCK_FUNDI_APK_BINARY_CONTENT');
            }
            const count = await prisma_1.default.appVersion.count();
            if (count === 0) {
                await prisma_1.default.appVersion.createMany({
                    data: [
                        {
                            appType: 'customer',
                            version: '1.0.0',
                            fileName: 'customer-v1.0.0.apk',
                            downloadUrl: '/download/customer',
                            releaseNotes: 'Toleo la kwanza la majaribio la wateja. Linear maps tracking na malipo vimejumuishwa.',
                            isLatest: true,
                        },
                        {
                            appType: 'fundi',
                            version: '1.0.0',
                            fileName: 'fundi-v1.0.0.apk',
                            downloadUrl: '/download/fundi',
                            releaseNotes: 'Toleo la kwanza la majaribio la mafundi. Smart wave dispatch system imewezeshwa.',
                            isLatest: true,
                        }
                    ]
                });
                logger_1.default.info('[AppController] Seeded default application versions successfully');
            }
        }
        catch (err) {
            logger_1.default.warn(`[AppController] Prisma seeding failed/skipped (expected in mock environment): ${err.message}`);
        }
    }
    /**
     * GET /download/:appType
     * Serves secure APK file download
     */
    static async downloadApk(req, res) {
        const { appType } = req.params;
        // 1. Strict validation of appType to prevent directory traversal
        if (appType !== 'customer' && appType !== 'fundi') {
            res.status(400).json({
                success: false,
                message: 'Invalid application type requested',
                errors: ['Application type must be customer or fundi'],
            });
            return;
        }
        let fileName = `${appType}-v1.0.0.apk`;
        try {
            // 2. Fetch the latest version from db
            const latestVersion = await prisma_1.default.appVersion.findFirst({
                where: { appType, isLatest: true },
                orderBy: { createdAt: 'desc' }
            });
            if (latestVersion) {
                fileName = latestVersion.fileName;
            }
        }
        catch (dbError) {
            // Fallback to local default file mapping if Prisma connection fails (matching db.ts mocking behavior)
            logger_1.default.warn(`[AppController] Database connection failed. Serving mock APK fallback: ${dbError.message}`);
        }
        try {
            // 3. Resolve the path securely and prevent directory traversal
            const safeFileName = path_1.default.basename(fileName);
            const targetFilePath = path_1.default.resolve(AppController.APPS_DIR, safeFileName);
            const normalizedAppsDir = path_1.default.normalize(AppController.APPS_DIR).toLowerCase();
            const normalizedTargetFilePath = path_1.default.normalize(targetFilePath).toLowerCase();
            // Verify the resolved path starts with the designated folder path prefix
            if (!normalizedTargetFilePath.startsWith(normalizedAppsDir)) {
                logger_1.default.warn(`[Security Alert] Traversal attempt detected on download of appType ${appType}`);
                res.status(403).json({
                    success: false,
                    message: 'Directory traversal validation failed',
                    errors: ['Unauthorized path escape access'],
                });
                return;
            }
            // 4. Verify file exists on disk
            if (!fs_1.default.existsSync(targetFilePath)) {
                logger_1.default.error(`[AppController] Target APK file not found on path: ${targetFilePath}`);
                res.status(404).json({
                    success: false,
                    message: 'APK file is missing on storage disk',
                    errors: [`File '${fileName}' was not found. Please contact support.`],
                });
                return;
            }
            // Get stats
            const stats = fs_1.default.statSync(targetFilePath);
            // Log download telemetry
            logger_1.default.info(`[AppController] Downloading ${fileName} (${stats.size} bytes) from IP ${req.ip}`);
            // 5. Stream the download back with correct headers
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
            res.setHeader('Content-Length', stats.size.toString());
            const fileStream = fs_1.default.createReadStream(targetFilePath);
            fileStream.pipe(res);
        }
        catch (error) {
            logger_1.default.error(`[AppController] Download failed: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'File download transaction failed',
                errors: [error.message],
            });
        }
    }
    /**
     * GET /:filename.apk
     * Serves direct APK root file downloads for backward compatibility (e.g. /app-1.0.0.apk)
     */
    static async downloadApkDirect(req, res) {
        const { filename } = req.params;
        const lowerFilename = filename.toLowerCase();
        // Map to customer or fundi appType based on filename pattern
        const appType = lowerFilename.includes('fundi') ? 'fundi' : 'customer';
        // Inject appType parameter and call downloadApk
        req.params.appType = appType;
        return AppController.downloadApk(req, res);
    }
    /**
     * GET /api/version
     * Version check API returns details of the latest releases
     */
    static async checkVersion(req, res) {
        const appType = req.query.appType;
        if (appType && appType !== 'customer' && appType !== 'fundi') {
            res.status(400).json({
                success: false,
                message: 'Invalid query type requested',
                errors: ['appType query param must be customer or fundi'],
            });
            return;
        }
        try {
            if (appType) {
                let latestData = {
                    appType,
                    version: '1.0.0',
                    releaseNotes: 'Toleo la kwanza la majaribio. Smart wave dispatch system imewezeshwa.',
                    fileName: `${appType}-v1.0.0.apk`,
                    downloadUrl: `/download/${appType}`
                };
                try {
                    const latest = await prisma_1.default.appVersion.findFirst({
                        where: { appType, isLatest: true },
                        orderBy: { createdAt: 'desc' }
                    });
                    if (latest) {
                        latestData = {
                            appType: latest.appType,
                            version: latest.version,
                            releaseNotes: latest.releaseNotes || 'Toleo la kwanza la majaribio.',
                            fileName: latest.fileName,
                            downloadUrl: `/download/${latest.appType}`
                        };
                    }
                }
                catch (dbErr) {
                    logger_1.default.warn(`[AppController] DB Query fallback on version check: ${dbErr.message}`);
                }
                // Retrieve file stats for size calculation
                const filePath = path_1.default.resolve(AppController.APPS_DIR, latestData.fileName);
                let fileSizeMb = 24.0; // default estimated
                if (fs_1.default.existsSync(filePath)) {
                    fileSizeMb = parseFloat((fs_1.default.statSync(filePath).size / (1024 * 1024)).toFixed(2));
                }
                res.status(200).json({
                    success: true,
                    data: {
                        appType: latestData.appType,
                        version: latestData.version,
                        releaseNotes: latestData.releaseNotes,
                        fileName: latestData.fileName,
                        fileSizeMb,
                        androidMinRequirement: 'Android 8.0 (Oreo) or higher',
                        downloadUrl: latestData.downloadUrl,
                        forceUpdate: true
                    }
                });
            }
            else {
                let releasesList = [
                    {
                        appType: 'customer',
                        version: '1.0.0',
                        releaseNotes: 'Toleo la kwanza la majaribio la wateja. Linear maps tracking na malipo vimejumuishwa.',
                        fileName: 'customer-v1.0.0.apk',
                        downloadUrl: '/download/customer'
                    },
                    {
                        appType: 'fundi',
                        version: '1.0.0',
                        releaseNotes: 'Toleo la kwanza la majaribio la mafundi. Smart wave dispatch system imewezeshwa.',
                        fileName: 'fundi-v1.0.0.apk',
                        downloadUrl: '/download/fundi'
                    }
                ];
                try {
                    const releases = await prisma_1.default.appVersion.findMany({
                        where: { isLatest: true },
                        orderBy: { appType: 'asc' }
                    });
                    if (releases && releases.length > 0) {
                        releasesList = releases.map(r => ({
                            appType: r.appType,
                            version: r.version,
                            releaseNotes: r.releaseNotes || 'Toleo la majaribio.',
                            fileName: r.fileName,
                            downloadUrl: `/download/${r.appType}`
                        }));
                    }
                }
                catch (dbErr) {
                    logger_1.default.warn(`[AppController] DB Query fallback on version list query: ${dbErr.message}`);
                }
                res.status(200).json({
                    success: true,
                    data: releasesList.map(r => {
                        const filePath = path_1.default.resolve(AppController.APPS_DIR, r.fileName);
                        let fileSizeMb = 24.0;
                        if (fs_1.default.existsSync(filePath)) {
                            fileSizeMb = parseFloat((fs_1.default.statSync(filePath).size / (1024 * 1024)).toFixed(2));
                        }
                        return {
                            appType: r.appType,
                            version: r.version,
                            releaseNotes: r.releaseNotes,
                            fileName: r.fileName,
                            fileSizeMb,
                            androidMinRequirement: 'Android 8.0 (Oreo) or higher',
                            downloadUrl: r.downloadUrl,
                            forceUpdate: true
                        };
                    })
                });
            }
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Querying app releases failed',
                errors: [error.message],
            });
        }
    }
}
exports.AppController = AppController;

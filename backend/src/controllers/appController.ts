import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../config/prisma';
import logger from '../config/logger';

export class AppController {
  private static APPS_DIR = path.resolve(process.cwd(), 'uploads', 'apps');

  /**
   * Initialize directory structure and populate seed versions if database is empty
   */
  public static async seedVersionsIfEmpty(): Promise<void> {
    try {
      if (!fs.existsSync(AppController.APPS_DIR)) {
        fs.mkdirSync(AppController.APPS_DIR, { recursive: true });
        logger.info(`[AppController] Created apps folder directory at: ${AppController.APPS_DIR}`);
      }

      // Create mock apk files if they don't exist for validation testing
      const customerMockApk = path.join(AppController.APPS_DIR, 'customer-v1.0.0.apk');
      const fundiMockApk = path.join(AppController.APPS_DIR, 'fundi-v1.0.0.apk');
      
      if (!fs.existsSync(customerMockApk)) {
        fs.writeFileSync(customerMockApk, 'MOCK_CUSTOMER_APK_BINARY_CONTENT');
      }
      if (!fs.existsSync(fundiMockApk)) {
        fs.writeFileSync(fundiMockApk, 'MOCK_FUNDI_APK_BINARY_CONTENT');
      }

      const count = await prisma.appVersion.count();
      if (count === 0) {
        await prisma.appVersion.createMany({
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
        logger.info('[AppController] Seeded default application versions successfully');
      }
    } catch (err: any) {
      logger.warn(`[AppController] Prisma seeding failed/skipped (expected in mock environment): ${err.message}`);
    }
  }

  /**
   * GET /download/:appType
   * Serves secure APK file download
   */
  public static async downloadApk(req: Request, res: Response): Promise<void> {
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
      const latestVersion = await prisma.appVersion.findFirst({
        where: { appType, isLatest: true },
        orderBy: { createdAt: 'desc' }
      });

      if (latestVersion) {
        fileName = latestVersion.fileName;
      }
    } catch (dbError: any) {
      // Fallback to local default file mapping if Prisma connection fails (matching db.ts mocking behavior)
      logger.warn(`[AppController] Database connection failed. Serving mock APK fallback: ${dbError.message}`);
    }

    try {
      // 3. Resolve the path securely and prevent directory traversal
      const safeFileName = path.basename(fileName);
      const targetFilePath = path.resolve(AppController.APPS_DIR, safeFileName);

      const normalizedAppsDir = path.normalize(AppController.APPS_DIR).toLowerCase();
      const normalizedTargetFilePath = path.normalize(targetFilePath).toLowerCase();

      // Verify the resolved path starts with the designated folder path prefix
      if (!normalizedTargetFilePath.startsWith(normalizedAppsDir)) {
        logger.warn(`[Security Alert] Traversal attempt detected on download of appType ${appType}`);
        res.status(403).json({
          success: false,
          message: 'Directory traversal validation failed',
          errors: ['Unauthorized path escape access'],
        });
        return;
      }

      // 4. Verify file exists on disk
      if (!fs.existsSync(targetFilePath)) {
        logger.error(`[AppController] Target APK file not found on path: ${targetFilePath}`);
        res.status(404).json({
          success: false,
          message: 'APK file is missing on storage disk',
          errors: [`File '${fileName}' was not found. Please contact support.`],
        });
        return;
      }

      // Get stats
      const stats = fs.statSync(targetFilePath);

      // Log download telemetry
      logger.info(`[AppController] Downloading ${fileName} (${stats.size} bytes) from IP ${req.ip}`);

      // 5. Stream the download back with correct headers
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
      res.setHeader('Content-Length', stats.size.toString());

      const fileStream = fs.createReadStream(targetFilePath);
      fileStream.pipe(res);

    } catch (error: any) {
      logger.error(`[AppController] Download failed: ${error.message}`);
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
  public static async downloadApkDirect(req: Request, res: Response): Promise<void> {
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
  public static async checkVersion(req: Request, res: Response): Promise<void> {
    const appType = req.query.appType as string;

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
          const latest = await prisma.appVersion.findFirst({
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
        } catch (dbErr: any) {
          logger.warn(`[AppController] DB Query fallback on version check: ${dbErr.message}`);
        }

        // Retrieve file stats for size calculation
        const filePath = path.resolve(AppController.APPS_DIR, latestData.fileName);
        let fileSizeMb = 24.0; // default estimated
        if (fs.existsSync(filePath)) {
          fileSizeMb = parseFloat((fs.statSync(filePath).size / (1024 * 1024)).toFixed(2));
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
      } else {
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
          const releases = await prisma.appVersion.findMany({
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
        } catch (dbErr: any) {
          logger.warn(`[AppController] DB Query fallback on version list query: ${dbErr.message}`);
        }

        res.status(200).json({
          success: true,
          data: releasesList.map(r => {
            const filePath = path.resolve(AppController.APPS_DIR, r.fileName);
            let fileSizeMb = 24.0;
            if (fs.existsSync(filePath)) {
              fileSizeMb = parseFloat((fs.statSync(filePath).size / (1024 * 1024)).toFixed(2));
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Querying app releases failed',
        errors: [error.message],
      });
    }
  }
}

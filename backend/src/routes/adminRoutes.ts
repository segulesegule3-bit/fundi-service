import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { AuthService } from '../services/authService';
import { WalletService } from '../services/walletService';

export const adminRouter = Router();

// Middleware to authorize specific admin roles
function requireRoles(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const user = AuthService.verifyToken(token);

    if (!user) {
      res.status(401).json({ error: 'Invalid token session' });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ error: 'Access denied. Insufficient permissions for role: ' + user.role });
      return;
    }

    // Attach user profile to request for log files audits
    req.body.adminUser = user;
    next();
  };
}

/**
 * Audit log helper
 */
async function writeAuditLog(adminId: string, action: string, ip: string, userAgent: string, details: object) {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, ip_address, user_agent, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, action, ip, userAgent, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('Audit log write error:', err);
  }
}

/**
 * @route GET /api/admin/audit-logs
 * @desc Get system audit logs (Super Admin only)
 */
adminRouter.get('/audit-logs', requireRoles(['super_admin']), async (req: Request, res: Response) => {
  try {
    const logs = await db.query(
      `SELECT al.id, al.action, al.ip_address, al.user_agent, al.details, al.created_at,
              u.full_name as admin_name, u.role as admin_role
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC LIMIT 100`
    );
    res.status(200).json(logs.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

/**
 * @route POST /api/admin/accounts
 * @desc Create a new Admin user account (Super Admin only)
 */
adminRouter.post('/accounts', requireRoles(['super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, phoneNumber, password, role } = req.body;
  const admin = req.body.adminUser;

  try {
    if (!fullName || !email || !phoneNumber || !password || !role) {
      res.status(400).json({ error: 'Missing admin profile fields' });
      return;
    }

    const validAdminRoles = ['admin', 'super_admin', 'support_officer', 'verification_officer', 'finance_officer', 'moderator'];
    if (!validAdminRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid admin role: ' + role });
      return;
    }

    const passwordHash = await AuthService.hashPassword(password);
    const referralCode = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newAdmin = await db.query(
      `INSERT INTO users (full_name, email, phone_number, password_hash, role, referral_code, email_verified, phone_verified)
       VALUES ($1, $2, $3, $4, $5, $6, true, true) RETURNING id, full_name, email, role`,
      [fullName, email, phoneNumber, passwordHash, role, referralCode]
    );

    await writeAuditLog(
      admin.id, 
      'create_admin_account', 
      req.ip || '127.0.0.1', 
      req.headers['user-agent'] || '', 
      { newAdminId: newAdmin.rows[0].id, role }
    );

    res.status(201).json({ message: 'Admin account created successfully', admin: newAdmin.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create admin profile' });
  }
});

/**
 * @route DELETE /api/admin/accounts/:id
 * @desc Suspend or delete Admin profile (Super Admin only)
 */
adminRouter.delete('/accounts/:id', requireRoles(['super_admin']), async (req: Request, res: Response) => {
  const { id } = req.params;
  const admin = req.body.adminUser;

  try {
    await db.query('UPDATE users SET status = $1 WHERE id = $2', ['banned', id]);
    await writeAuditLog(admin.id, 'ban_admin_account', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { bannedUserId: id });
    res.status(200).json({ message: 'Admin account suspended successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Suspension failed' });
  }
});

/**
 * @route GET /api/admin/fundis/pending
 * @desc Get list of fundis pending approval (Verification Officer or Admins)
 */
adminRouter.get('/fundis/pending', requireRoles(['verification_officer', 'admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const list = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone_number, u.profile_picture_url,
              p.name_en as profession_name, fp.experience_years, fp.national_id_number,
              fp.national_id_url, fp.tin_number, fp.tin_certificate_url, fp.professional_certificate_url
       FROM users u
       JOIN fundi_profiles fp ON u.id = fp.user_id
       JOIN professions p ON fp.profession_id = p.id
       WHERE fp.verification_status = 'pending_verification'`
    );
    res.status(200).json(list.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to pull pending list' });
  }
});

/**
 * @route POST /api/admin/fundis/:id/verify
 * @desc Approve or Reject a Fundi profile (Verification Officer / Admins)
 */
adminRouter.post('/fundis/:id/verify', requireRoles(['verification_officer', 'admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, notes } = req.body; // status: 'verified' or 'rejected'
  const admin = req.body.adminUser;

  try {
    if (status !== 'verified' && status !== 'rejected') {
      res.status(400).json({ error: 'Status must be verified or rejected' });
      return;
    }

    const badge = status === 'verified';
    await db.query(
      `UPDATE fundi_profiles 
       SET verification_status = $1, verified_badge = $2, verification_notes = $3
       WHERE user_id = $4`,
      [status, badge, notes || '', id]
    );

    await writeAuditLog(admin.id, `fundi_verification_${status}`, req.ip || '127.0.0.1', req.headers['user-agent'] || '', { fundiId: id, notes });

    res.status(200).json({ message: `Fundi has been successfully ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Verification workflow update failed' });
  }
});

/**
 * @route POST /api/admin/disputes/:id/resolve
 * @desc Resolve dispute and payout/refund held escrow funds (Finance Officer or Admins)
 */
adminRouter.post('/disputes/:id/resolve', requireRoles(['finance_officer', 'admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { winner } = req.body; // 'customer' or 'fundi'
  const admin = req.body.adminUser;

  try {
    if (winner !== 'customer' && winner !== 'fundi') {
      res.status(400).json({ error: 'Winner must be customer or fundi' });
      return;
    }

    // Lock dispute and fetch booking
    const disputeRes = await db.query('SELECT * FROM disputes WHERE id = $1 FOR UPDATE', [id]);
    if (disputeRes.rowCount === 0) {
      res.status(404).json({ error: 'Dispute record not found' });
      return;
    }

    const dispute = disputeRes.rows[0];
    if (dispute.status !== 'open') {
      res.status(400).json({ error: 'Dispute has already been resolved' });
      return;
    }

    await db.transaction(async (client) => {
      if (winner === 'customer') {
        // Refund customer
        await WalletService.refundEscrow(dispute.booking_id);
      } else {
        // Release to fundi
        await WalletService.releaseEscrow(dispute.booking_id);
      }

      // Close dispute
      await client.query(
        `UPDATE disputes 
         SET status = $1, resolved_by_id = $2, winner_id = (
           SELECT ${winner === 'customer' ? 'customer_id' : 'fundi_id'} FROM bookings WHERE id = dispute.booking_id
         ), updated_at = NOW()
         WHERE id = $3`,
        [winner === 'customer' ? 'resolved_refunded' : 'resolved_released', admin.id, id]
      );
    });

    await writeAuditLog(admin.id, 'resolve_escrow_dispute', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { disputeId: id, winner });

    res.status(200).json({ message: `Dispute resolved successfully. Funds routed to ${winner}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Resolution transaction failed' });
  }
});

/**
 * @route POST /api/admin/settings
 * @desc Manage Platform Settings (Super Admin only)
 */
adminRouter.post('/settings', requireRoles(['super_admin']), async (req: Request, res: Response) => {
  const { commissionPercent, vatPercent } = req.body;
  const admin = req.body.adminUser;

  try {
    if (commissionPercent !== undefined) {
      await db.query("UPDATE system_settings SET value = $1 WHERE key = 'platform_commission_percent'", [commissionPercent.toString()]);
    }
    if (vatPercent !== undefined) {
      await db.query("UPDATE system_settings SET value = $1 WHERE key = 'platform_vat_percent'", [vatPercent.toString()]);
    }

    await writeAuditLog(admin.id, 'update_system_settings', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { commissionPercent, vatPercent });

    res.status(200).json({ message: 'Settings saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

/**
 * @route POST /api/admin/app/release
 * @desc Upload / create a new app release build (Super Admin only)
 */
adminRouter.post('/app/release', requireRoles(['super_admin']), async (req: Request, res: Response) => {
  const { versionCode, type, downloadUrl, releaseNotes, forceUpdate } = req.body;
  const admin = req.body.adminUser;

  try {
    if (!versionCode || !type || !downloadUrl) {
      res.status(400).json({ error: 'Missing versionCode, type, or downloadUrl.' });
      return;
    }

    const releaseRes = await db.query(
      `INSERT INTO app_releases (version_code, type, download_url, release_notes, force_update)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [versionCode, type, downloadUrl, releaseNotes || '', forceUpdate || false]
    );

    await writeAuditLog(admin.id, `publish_app_release_${type}`, req.ip || '127.0.0.1', req.headers['user-agent'] || '', { versionCode, type });

    res.status(201).json({ message: 'New application version published successfully.', release: releaseRes.rows[0] });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create application release record.' });
  }
});

/**
 * @route GET /api/admin/app/releases
 * @desc Retrieve all release builds (Admins / Super Admins)
 */
adminRouter.get('/app/releases', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const releases = await db.query(`SELECT * FROM app_releases ORDER BY created_at DESC`);
    res.status(200).json(releases.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to query release history log.' });
  }
});

/**
 * @route PATCH /api/admin/app/releases/:id
 * @desc Modify release status, release notes, or toggle force update (Super Admin only)
 */
adminRouter.patch('/app/releases/:id', requireRoles(['super_admin']), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isPublished, forceUpdate, releaseNotes } = req.body;
  const admin = req.body.adminUser;

  try {
    const updateRes = await db.query(
      `UPDATE app_releases 
       SET is_published = COALESCE($1, is_published),
           force_update = COALESCE($2, force_update),
           release_notes = COALESCE($3, release_notes)
       WHERE id = $4 RETURNING *`,
      [isPublished, forceUpdate, releaseNotes, id]
    );

    if (updateRes.rowCount === 0 || updateRes.rowCount === null) {
      res.status(404).json({ error: 'Release build record not found.' });
      return;
    }

    await writeAuditLog(admin.id, 'modify_app_release', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { releaseId: id, isPublished, forceUpdate });

    res.status(200).json({ message: 'App version updated successfully.', release: updateRes.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to modify release version configurations.' });
  }
});

/**
 * @route GET /api/admin/app/analytics/summary
 * @desc Gets aggregates of daily and monthly download counts per platform (Admins / Super Admins)
 */
adminRouter.get('/app/analytics/summary', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const dailyAnalytics = await db.query(
      `SELECT platform, COUNT(*)::int as count, TO_CHAR(created_at, 'YYYY-MM-DD') as day 
       FROM app_download_analytics 
       GROUP BY platform, day 
       ORDER BY day DESC LIMIT 30`
    );

    const monthlyAnalytics = await db.query(
      `SELECT platform, COUNT(*)::int as count, TO_CHAR(created_at, 'YYYY-MM') as month 
       FROM app_download_analytics 
       GROUP BY platform, month 
       ORDER BY month DESC LIMIT 12`
    );

    const platformTotals = await db.query(
      `SELECT platform, COUNT(*)::int as count 
       FROM app_download_analytics 
       GROUP BY platform`
    );

    res.status(200).json({
      daily: dailyAnalytics.rows,
      monthly: monthlyAnalytics.rows,
      totals: platformTotals.rows
    });
  } catch (error: any) {
    console.error('[AdminRouter] Analytics fetching failed:', error);
    res.status(500).json({ error: 'Failed to retrieve application downloads statistics.' });
  }
});

/**
 * @route POST /api/admin/professions
 * @desc Create new profession category (Admins / Super Admins)
 */
adminRouter.post('/professions', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { nameEn, nameSw, iconName } = req.body;
  const admin = req.body.adminUser;

  try {
    if (!nameEn || !nameSw || !iconName) {
      res.status(400).json({ error: 'Missing nameEn, nameSw, or iconName.' });
      return;
    }

    const result = await db.query(
      `INSERT INTO professions (name_en, name_sw, icon_name)
       VALUES ($1, $2, $3) RETURNING *`,
      [nameEn, nameSw, iconName]
    );

    await writeAuditLog(admin.id, 'create_profession', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { nameEn });

    res.status(201).json({ message: 'Profession category created successfully.', profession: result.rows[0] });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create profession category.' });
  }
});

/**
 * @route PUT /api/admin/professions/:id
 * @desc Update profession category (Admins / Super Admins)
 */
adminRouter.put('/professions/:id', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nameEn, nameSw, iconName, isActive } = req.body;
  const admin = req.body.adminUser;

  try {
    const result = await db.query(
      `UPDATE professions 
       SET name_en = COALESCE($1, name_en),
           name_sw = COALESCE($2, name_sw),
           icon_name = COALESCE($3, icon_name),
           is_active = COALESCE($4, is_active)
       WHERE id = $5 RETURNING *`,
      [nameEn, nameSw, iconName, isActive, id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Profession category not found.' });
      return;
    }

    await writeAuditLog(admin.id, 'update_profession', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { id });

    res.status(200).json({ message: 'Profession category updated successfully.', profession: result.rows[0] });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profession category.' });
  }
});

/**
 * @route DELETE /api/admin/professions/:id
 * @desc Delete/Deactivate profession category (Admins / Super Admins)
 */
adminRouter.delete('/professions/:id', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const admin = req.body.adminUser;

  try {
    // We do a soft delete by deactivating it
    const result = await db.query(
      `UPDATE professions SET is_active = false WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Profession category not found.' });
      return;
    }

    await writeAuditLog(admin.id, 'delete_profession', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { id });

    res.status(200).json({ message: 'Profession category deactivated successfully.' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to deactivate profession category.' });
  }
});

/**
 * @route PATCH /api/admin/users/:id/status
 * @desc Suspend or Activate user account status (Admins / Super Admins)
 */
adminRouter.patch('/users/:id/status', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body; // 'active' or 'suspended'
  const admin = req.body.adminUser;

  try {
    if (status !== 'active' && status !== 'suspended') {
      res.status(400).json({ error: 'Status must be active or suspended.' });
      return;
    }

    const result = await db.query(
      `UPDATE users SET status = $1 WHERE id = $2 RETURNING id, full_name, status`,
      [status, id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    await writeAuditLog(admin.id, `user_${status}`, req.ip || '127.0.0.1', req.headers['user-agent'] || '', { userId: id });

    res.status(200).json({ message: `User account has been ${status} successfully.`, user: result.rows[0] });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle user account status.' });
  }
});

/**
 * @route GET /api/admin/verification-queue
 * @desc Get list of all Fundis with pending verification elements
 */
adminRouter.get('/verification-queue', requireRoles(['admin', 'super_admin', 'verification_officer']), async (req: Request, res: Response) => {
  try {
    const queue = await db.query(
      `SELECT 
        u.id as user_id,
        u.full_name,
        u.phone_number,
        fp.verification_status,
        fp.national_id_number,
        fp.national_id_url,
        fp.business_license_url,
        fp.professional_certificate_url,
        fp.verification_notes,
        (SELECT JSON_AGG(c) FROM certificates c WHERE c.fundi_id = u.id AND c.verification_status = 'pending_verification') as pending_certificates,
        (SELECT JSON_AGG(l) FROM licenses l WHERE l.fundi_profile_id = u.id AND l.status = 'pending_verification') as pending_licenses
       FROM users u
       JOIN fundi_profiles fp ON u.id = fp.user_id
       WHERE fp.verification_status = 'pending_verification'
          OR EXISTS (SELECT 1 FROM certificates c WHERE c.fundi_id = u.id AND c.verification_status = 'pending_verification')
          OR EXISTS (SELECT 1 FROM licenses l WHERE l.fundi_profile_id = u.id AND l.status = 'pending_verification')
       ORDER BY fp.updated_at DESC`
    );
    res.status(200).json(queue.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to query verification queue' });
  }
});

/**
 * @route PATCH /api/admin/fundi/:fundiId/primary-profession
 * @desc Change Primary Profession of a Fundi
 */
adminRouter.patch('/fundi/:fundiId/primary-profession', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { fundiId } = req.params;
  const { primaryProfessionId } = req.body;
  const admin = req.body.adminUser;

  try {
    if (!primaryProfessionId) {
      res.status(400).json({ error: 'Missing primaryProfessionId.' });
      return;
    }

    await db.transaction(async (client) => {
      // 1. Set all professions for this Fundi to isPrimary = false
      await client.query(
        `UPDATE fundi_professions SET "isPrimary" = false WHERE "fundiId" = $1`,
        [fundiId]
      );
      // 2. Set the requested profession to isPrimary = true
      const result = await client.query(
        `UPDATE fundi_professions SET "isPrimary" = true WHERE "fundiId" = $1 AND "professionId" = $2 RETURNING *`,
        [fundiId, primaryProfessionId]
      );

      // If the profession wasn't already mapped, we insert it
      if (result.rowCount === 0) {
        await client.query(
          `INSERT INTO fundi_professions (id, "fundiId", "professionId", "isPrimary") 
           VALUES (gen_random_uuid(), $1, $2, true)`,
          [fundiId, primaryProfessionId]
        );
      }
    });

    await writeAuditLog(admin.id, 'change_primary_profession', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { fundiId, primaryProfessionId });
    res.status(200).json({ message: 'Primary profession changed successfully.' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to change primary profession.' });
  }
});

/**
 * @route PATCH /api/admin/fundi/:fundiId/approve-secondary
 * @desc Manage/approve secondary specialties for a Fundi
 */
adminRouter.patch('/fundi/:fundiId/approve-secondary', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { fundiId } = req.params;
  const { secondaryProfessionIds } = req.body;
  const admin = req.body.adminUser;

  try {
    if (!Array.isArray(secondaryProfessionIds)) {
      res.status(400).json({ error: 'secondaryProfessionIds must be an array.' });
      return;
    }

    await db.transaction(async (client) => {
      // 1. Delete all existing secondary professions for this Fundi
      await client.query(
        `DELETE FROM fundi_professions WHERE "fundiId" = $1 AND "isPrimary" = false`,
        [fundiId]
      );

      // 2. Insert new secondary professions
      for (const profId of secondaryProfessionIds) {
        // Prevent inserting same as primary
        const checkPrim = await client.query(
          `SELECT 1 FROM fundi_professions WHERE "fundiId" = $1 AND "professionId" = $2 AND "isPrimary" = true`,
          [fundiId, profId]
        );
        if (checkPrim.rowCount === 0) {
          await client.query(
            `INSERT INTO fundi_professions (id, "fundiId", "professionId", "isPrimary") 
             VALUES (gen_random_uuid(), $1, $2, false)`,
            [fundiId, profId]
          );
        }
      }
    });

    await writeAuditLog(admin.id, 'approve_secondary_professions', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { fundiId, secondaryProfessionIds });
    res.status(200).json({ message: 'Secondary professions updated successfully.' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update secondary professions.' });
  }
});

/**
 * @route POST /api/admin/professions/merge
 * @desc Merge duplicate profession categories
 */
adminRouter.post('/professions/merge', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { sourceId, targetId } = req.body;
  const admin = req.body.adminUser;

  try {
    if (!sourceId || !targetId) {
      res.status(400).json({ error: 'sourceId and targetId are required.' });
      return;
    }

    if (sourceId === targetId) {
      res.status(400).json({ error: 'Source and Target categories cannot be the same.' });
      return;
    }

    await db.transaction(async (client) => {
      // 1. Find all fundis having the source profession
      const sourceFundis = await client.query(
        `SELECT "fundiId", "isPrimary" FROM fundi_professions WHERE "professionId" = $1`,
        [sourceId]
      );

      for (const row of sourceFundis.rows) {
        const { fundiId, isPrimary } = row;

        // Check if fundi already has target profession
        const checkTarget = await client.query(
          `SELECT id, "isPrimary" FROM fundi_professions WHERE "fundiId" = $1 AND "professionId" = $2`,
          [fundiId, targetId]
        );

        if (checkTarget.rowCount === 0) {
          // Fundi doesn't have target profession: update source record to target profession
          await client.query(
            `UPDATE fundi_professions SET "professionId" = $1 WHERE "fundiId" = $2 AND "professionId" = $3`,
            [targetId, fundiId, sourceId]
          );
        } else {
          // Fundi already has target profession:
          // If source was primary and target is not, make target primary
          if (isPrimary && !checkTarget.rows[0].isPrimary) {
            await client.query(
              `UPDATE fundi_professions SET "isPrimary" = true WHERE id = $1`,
              [checkTarget.rows[0].id]
            );
          }
          // Delete duplicate source record
          await client.query(
            `DELETE FROM fundi_professions WHERE "fundiId" = $1 AND "professionId" = $2`,
            [fundiId, sourceId]
          );
        }
      }

      // 2. Move services pointing to source category to target category
      await client.query(
        `UPDATE services SET "categoryId" = $1 WHERE "categoryId" = $2`,
        [targetId, sourceId]
      );

      // 3. Deactivate source category
      await client.query(
        `UPDATE professions SET is_active = false WHERE id = $1`,
        [sourceId]
      );
    });

    await writeAuditLog(admin.id, 'merge_professions', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { sourceId, targetId });
    res.status(200).json({ message: 'Profession categories merged successfully.' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to merge profession categories.' });
  }
});

/**
 * @route PATCH /api/admin/verify/certificate/:id
 * @desc Approve/Reject certificate (Admins / Verification Officers)
 */
adminRouter.patch('/verify/certificate/:id', requireRoles(['admin', 'super_admin', 'verification_officer']), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, notes } = req.body; // status: 'verified' or 'rejected'
  const admin = req.body.adminUser;

  try {
    if (status !== 'verified' && status !== 'rejected') {
      res.status(400).json({ error: 'Status must be verified or rejected' });
      return;
    }

    const certRes = await db.query(
      `UPDATE certificates 
       SET verification_status = $1 
       WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (certRes.rowCount === 0) {
      res.status(404).json({ error: 'Certificate record not found' });
      return;
    }

    const cert = certRes.rows[0];

    // If approved, update certificate_verified flag on the fundi profile
    if (status === 'verified') {
      await db.query(
        `UPDATE fundi_profiles 
         SET certificate_verified = true, verified_badge = true
         WHERE user_id = $1`,
        [cert.fundi_id]
      );
    }

    // Write audit log
    await writeAuditLog(admin.id, `verify_certificate_${status}`, req.ip || '127.0.0.1', req.headers['user-agent'] || '', { certificateId: id, notes });

    // Send database/in-app notification to the fundi
    await db.query(
      `INSERT INTO notifications (user_id, title, body, type)
       VALUES ($1, $2, $3, 'in_app')`,
      [
        cert.fundi_id,
        status === 'verified' ? 'Cheti Kimeidhinishwa' : 'Cheti Kimekataliwa',
        status === 'verified'
          ? `Cheti chako cha "${cert.name}" kimehakikiwa kwa ufanisi na msimamizi yetu.`
          : `Cheti chako cha "${cert.name}" kimekataliwa. Maoni: ${notes || 'Tafadhali pakia cheti halali.'}`,
      ]
    );

    res.status(200).json({ message: `Certificate has been ${status} successfully.`, certificate: cert });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify certificate' });
  }
});

/**
 * @route PATCH /api/admin/verify/license/:id
 * @desc Approve/Reject professional license (Admins / Verification Officers)
 */
adminRouter.patch('/verify/license/:id', requireRoles(['admin', 'super_admin', 'verification_officer']), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, notes } = req.body; // status: 'verified' or 'rejected'
  const admin = req.body.adminUser;

  try {
    if (status !== 'verified' && status !== 'rejected') {
      res.status(400).json({ error: 'Status must be verified or rejected' });
      return;
    }

    const licStatus = status === 'verified' ? 'active' : 'suspended';

    const licRes = await db.query(
      `UPDATE licenses 
       SET status = $1 
       WHERE id = $2 RETURNING *`,
      [licStatus, id]
    );

    if (licRes.rowCount === 0) {
      res.status(404).json({ error: 'License record not found' });
      return;
    }

    const license = licRes.rows[0];

    // If approved, update identity/profession_verified flag on the fundi profile
    if (status === 'verified') {
      await db.query(
        `UPDATE fundi_profiles 
         SET profession_verified = true 
         WHERE user_id = $1`,
        [license.fundi_profile_id]
      );
    }

    // Write audit log
    await writeAuditLog(admin.id, `verify_license_${status}`, req.ip || '127.0.0.1', req.headers['user-agent'] || '', { licenseId: id, notes });

    // Send notification to the fundi
    await db.query(
      `INSERT INTO notifications (user_id, title, body, type)
       VALUES ($1, $2, $3, 'in_app')`,
      [
        license.fundi_profile_id,
        status === 'verified' ? 'Leseni Imeidhinishwa' : 'Leseni Kimekataliwa',
        status === 'verified'
          ? `Leseni yako ya kazi "${license.license_number}" imehakikiwa na kuidhinishwa.`
          : `Leseni yako ya kazi "${license.license_number}" imekataliwa. Maoni: ${notes || 'Wasiliana na huduma kwa wateja.'}`,
      ]
    );

    res.status(200).json({ message: `License has been ${status} successfully.`, license });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify license' });
  }
});

/**
 * @route PATCH /api/admin/verify/badge
 * @desc Set/Toggle verification badge flags (Super Admin / Admins)
 */
adminRouter.patch('/verify/badge', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { fundiId, badge, value } = req.body;
  const admin = req.body.adminUser;

  const allowedBadges = [
    'identity_verified',
    'profession_verified',
    'certificate_verified',
    'veta_certified',
    'premium_fundi',
    'top_rated',
    'background_checked',
    'verified_badge'
  ];

  try {
    if (!fundiId || !badge || value === undefined) {
      res.status(400).json({ error: 'fundiId, badge name, and value (boolean) are required' });
      return;
    }

    if (!allowedBadges.includes(badge)) {
      res.status(400).json({ error: 'Invalid badge name: ' + badge });
      return;
    }

    const colName = badge;
    const query = `UPDATE fundi_profiles SET "${colName}" = $1 WHERE user_id = $2 RETURNING *`;
    const result = await db.query(query, [value === true || value === 'true', fundiId]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Fundi profile not found' });
      return;
    }

    await writeAuditLog(admin.id, `toggle_badge_${badge}`, req.ip || '127.0.0.1', req.headers['user-agent'] || '', { fundiId, value });

    // Send notification
    await db.query(
      `INSERT INTO notifications (user_id, title, body, type)
       VALUES ($1, $2, $3, 'in_app')`,
      [
        fundiId,
        'Mabadiliko ya Beji (Badge Update)',
        value
          ? `Umekabidhiwa beji mpya ya "${badge.replace('_', ' ').toUpperCase()}" na Msimamizi.`
          : `Beji yako ya "${badge.replace('_', ' ').toUpperCase()}" imeondolewa na Msimamizi.`,
      ]
    );

    res.status(200).json({ message: 'Badge settings updated successfully', profile: result.rows[0] });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle profile badge' });
  }
});

/**
 * @route POST /api/admin/verify/request-docs
 * @desc Request additional verification documents (Admins / Verification Officers)
 */
adminRouter.post('/verify/request-docs', requireRoles(['admin', 'super_admin', 'verification_officer']), async (req: Request, res: Response): Promise<void> => {
  const { fundiId, message } = req.body;
  const admin = req.body.adminUser;

  try {
    if (!fundiId || !message) {
      res.status(400).json({ error: 'fundiId and message are required' });
      return;
    }

    // Update verification notes
    await db.query(
      `UPDATE fundi_profiles 
       SET verification_notes = $1, verification_status = 'rejected' 
       WHERE user_id = $2`,
      [message, fundiId]
    );

    await writeAuditLog(admin.id, 'request_additional_documents', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { fundiId, message });

    // Send notification
    await db.query(
      `INSERT INTO notifications (user_id, title, body, type)
       VALUES ($1, $2, $3, 'in_app')`,
      [
        fundiId,
        'Nyaraka za Ziada Zinahitajika (Action Required)',
        `Msimamizi ameomba uwasilishe nyaraka za ziada: ${message}`,
      ]
    );

    res.status(200).json({ message: 'Request for additional documents sent successfully.' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to request additional documents' });
  }
});

/**
 * @route GET /api/admin/config
 * @desc Get system configurations (commission, subscriptions, promotion, inspection, corporate discount)
 */
adminRouter.get('/config', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const configRes = await db.query('SELECT * FROM system_configs LIMIT 1');
    if (configRes.rowCount === 0) {
      res.status(404).json({ error: 'System configuration not found' });
      return;
    }
    res.status(200).json(configRes.rows[0]);
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(500).json({ error: 'Failed to fetch system config' });
  }
});

/**
 * @route POST /api/admin/config
 * @desc Update system configurations
 */
adminRouter.post('/config', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { commissionRate, subBasic, subPro, subPremium, promotionFee, inspectionFeeBase, corporateDiscount } = req.body;
  const admin = req.body.adminUser;

  try {
    const configRes = await db.query(
      `UPDATE system_configs 
       SET commission_rate = COALESCE($1, commission_rate),
           sub_basic = COALESCE($2, sub_basic),
           sub_pro = COALESCE($3, sub_pro),
           sub_premium = COALESCE($4, sub_premium),
           promotion_fee = COALESCE($5, promotion_fee),
           inspection_fee_base = COALESCE($6, inspection_fee_base),
           corporate_discount = COALESCE($7, corporate_discount),
           updated_at = NOW()
       RETURNING *`,
      [commissionRate, subBasic, subPro, subPremium, promotionFee, inspectionFeeBase, corporateDiscount]
    );

    if (admin) {
      await writeAuditLog(admin.id, 'update_system_config', req.ip || '127.0.0.1', req.headers['user-agent'] || '', req.body);
    }

    res.status(200).json({
      message: 'System configuration updated successfully',
      config: configRes.rows[0]
    });
  } catch (error) {
    console.error('Error updating system config:', error);
    res.status(500).json({ error: 'Failed to update system config' });
  }
});

/**
 * @route GET /api/admin/warranty-claims
 * @desc Get all warranty claims for inspection
 */
adminRouter.get('/warranty-claims', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const claimsRes = await db.query(
      `SELECT wc.*, w.warranty_number, w.duration, w.expiry_date,
              b.id as booking_id, u.full_name as customer_name, f.full_name as fundi_name
       FROM warranty_claims wc
       JOIN warranties w ON wc.warranty_id = w.id
       JOIN bookings b ON w.booking_id = b.id
       JOIN users u ON b.customer_id = u.id
       JOIN users f ON b.fundi_id = f.id
       ORDER BY wc.created_at DESC`
    );
    res.status(200).json(claimsRes.rows);
  } catch (error) {
    console.error('Error fetching warranty claims:', error);
    res.status(500).json({ error: 'Failed to fetch warranty claims' });
  }
});

/**
 * @route POST /api/admin/warranty-claims/:claimId/inspect
 * @desc Inspect warranty claim and issue an outcome (rework, reject, partial_compensation, full_refund)
 */
adminRouter.post('/warranty-claims/:claimId/inspect', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { claimId } = req.params;
  const { outcome } = req.body; // rework, reject, partial_compensation, full_refund
  const admin = req.body.adminUser;

  if (!outcome || !['rework', 'reject', 'partial_compensation', 'full_refund'].includes(outcome)) {
    res.status(400).json({ error: 'Valid outcome is required' });
    return;
  }

  try {
    await db.transaction(async (client) => {
      // 1. Update claim status & outcome
      const statusValue = outcome === 'reject' ? 'REJECTED' : 'RESOLVED';
      await client.query(
        `UPDATE warranty_claims 
         SET status = $1, admin_outcome = $2, updated_at = NOW() 
         WHERE id = $3`,
        [statusValue, outcome, claimId]
      );

      // Write audit log
      if (admin) {
        await writeAuditLog(admin.id, 'inspect_warranty_claim', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { claimId, outcome });
      }

      res.status(200).json({ message: `Quality inspection completed. Outcome: ${outcome}` });
    });
  } catch (error) {
    console.error('Error executing quality inspection:', error);
    res.status(500).json({ error: 'Failed to resolve warranty claim inspection' });
  }
});

/**
 * @route GET /api/admin/trust-scores
 * @desc Get all trust scores of Mafundi
 */
adminRouter.get('/trust-scores', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const scoresRes = await db.query(
      `SELECT ts.*, u.full_name as fundi_name, fp.completed_jobs
       FROM trust_scores ts
       JOIN fundi_profiles fp ON ts.fundi_profile_id = fp.id
       JOIN users u ON fp.user_id = u.id
       ORDER BY ts.score DESC`
    );
    res.status(200).json(scoresRes.rows);
  } catch (error) {
    console.error('Error fetching trust scores:', error);
    res.status(500).json({ error: 'Failed to fetch trust scores' });
  }
});

/**
 * @route POST /api/admin/badges/award
 * @desc Award badge to a Fundi
 */
adminRouter.post('/badges/award', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { fundiProfileId, badgeName } = req.body;
  const admin = req.body.adminUser;

  try {
    // Get badge ID
    const badgeRes = await db.query('SELECT id FROM badges WHERE name = $1', [badgeName]);
    if (badgeRes.rowCount === 0) {
      res.status(404).json({ error: 'Badge name not found' });
      return;
    }
    const badgeId = badgeRes.rows[0].id;

    // Map badge
    await db.query(
      `INSERT INTO fundi_badges (fundi_profile_id, badge_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [fundiProfileId, badgeId]
    );

    if (admin) {
      await writeAuditLog(admin.id, 'award_badge', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { fundiProfileId, badgeName });
    }

    res.status(200).json({ message: `Badge ${badgeName} awarded successfully` });
  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

/**
 * @route POST /api/admin/fundis/level
 * @desc Override Progression level for a Fundi
 */
adminRouter.post('/fundis/level', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response): Promise<void> => {
  const { fundiProfileId, targetLevel } = req.body; // BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, ELITE
  const admin = req.body.adminUser;

  if (!['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ELITE'].includes(targetLevel)) {
    res.status(400).json({ error: 'Invalid level value' });
    return;
  }

  try {
    await db.query(
      `INSERT INTO fundi_levels (fundi_profile_id, current_level, points)
       VALUES ($1, $2, 0)
       ON CONFLICT (fundi_profile_id) DO UPDATE 
       SET current_level = EXCLUDED.current_level,
           updated_at = NOW()`,
      [fundiProfileId, targetLevel]
    );

    if (admin) {
      await writeAuditLog(admin.id, 'override_fundi_level', req.ip || '127.0.0.1', req.headers['user-agent'] || '', { fundiProfileId, targetLevel });
    }

    res.status(200).json({ message: `Fundi progression level overridden to ${targetLevel}` });
  } catch (error) {
    console.error('Error overriding level:', error);
    res.status(500).json({ error: 'Failed to override level' });
  }
});


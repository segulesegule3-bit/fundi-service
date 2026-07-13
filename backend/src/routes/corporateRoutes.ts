import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/authMiddleware';

export const corporateRouter = Router();

/**
 * @route POST /api/corporate/register
 * @desc Register a new corporate account
 */
corporateRouter.post('/register', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { companyName, tinNumber, billingAddress } = req.body;
  const userId = req.user?.id;

  if (!companyName) {
    res.status(400).json({ error: 'Company name is required' });
    return;
  }

  try {
    await db.transaction(async (client) => {
      // 1. Create corporate account
      const corpRes = await client.query(
        `INSERT INTO corporate_accounts (company_name, tin_number, billing_address) 
         VALUES ($1, $2, $3) RETURNING *`,
        [companyName, tinNumber || '', billingAddress || '']
      );
      const corporate = corpRes.rows[0];

      // 2. Map current user as Corporate Manager and upgrade their role to CORPORATE
      await client.query(
        `UPDATE users SET role = 'corporate' WHERE id = $1`,
        [userId]
      );

      await client.query(
        `INSERT INTO corporate_employees (corporate_id, user_id, role) 
         VALUES ($1, $2, 'manager')`,
        [corporate.id, userId]
      );

      res.status(201).json({
        message: 'Corporate account registered successfully',
        corporate
      });
    });
  } catch (error) {
    console.error('Error registering corporate account:', error);
    res.status(500).json({ error: 'Corporate registration failed' });
  }
});

/**
 * @route POST /api/corporate/employees
 * @desc Add/Invite an employee to the corporate account
 */
corporateRouter.post('/employees', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { employeeEmail, employeePhone, employeeName, role } = req.body;
  const userId = req.user?.id;

  try {
    // 1. Check if caller is a corporate manager
    const managerCheck = await db.query(
      `SELECT corporate_id FROM corporate_employees WHERE user_id = $1 AND role = 'manager'`,
      [userId]
    );

    if (managerCheck.rowCount === 0) {
      res.status(403).json({ error: 'Access Denied: Only corporate managers can add employees' });
      return;
    }

    const corporateId = managerCheck.rows[0].corporate_id;

    // 2. Create User account for employee if not exists or map them
    // Mock user creation or update
    const passwordHash = 'mock_employee_password';
    let employeeUserRes = await db.query('SELECT id FROM users WHERE phone_number = $1', [employeePhone]);
    let employeeUserId;

    if (employeeUserRes.rowCount === 0) {
      const newUser = await db.query(
        `INSERT INTO users (phone_number, password_hash, role, full_name) 
         VALUES ($1, $2, 'customer', $3) RETURNING id`,
        [employeePhone, passwordHash, employeeName]
      );
      employeeUserId = newUser.rows[0].id;
    } else {
      employeeUserId = employeeUserRes.rows[0].id;
    }

    // 3. Map to corporate_employees
    await db.query(
      `INSERT INTO corporate_employees (corporate_id, user_id, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role`,
      [corporateId, employeeUserId, role || 'employee']
    );

    res.status(201).json({ message: 'Employee added successfully', employeeUserId });
  } catch (error) {
    console.error('Error adding corporate employee:', error);
    res.status(500).json({ error: 'Failed to add corporate employee' });
  }
});

/**
 * @route GET /api/corporate/bookings
 * @desc Track corporate bookings
 */
corporateRouter.get('/bookings', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    const employeeCheck = await db.query(
      `SELECT corporate_id, role FROM corporate_employees WHERE user_id = $1`,
      [userId]
    );

    if (employeeCheck.rowCount === 0) {
      res.status(403).json({ error: 'Access Denied: Not associated with any corporate account' });
      return;
    }

    const { corporate_id, role } = employeeCheck.rows[0];

    // Managers track all corporate bookings; employees track their own corporate bookings
    let query = `SELECT b.*, u.full_name as customer_name, f.full_name as fundi_name
                 FROM bookings b
                 JOIN users u ON b.customer_id = u.id
                 JOIN users f ON b.fundi_id = f.id
                 WHERE b.corporate_id = $1`;
    let params = [corporate_id];

    if (role !== 'manager') {
      query += ` AND b.customer_id = $2`;
      params.push(userId);
    }

    const bookingsRes = await db.query(query, params);
    res.status(200).json(bookingsRes.rows);
  } catch (error) {
    console.error('Error fetching corporate bookings:', error);
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

/**
 * @route GET /api/corporate/invoices
 * @desc Download corporate invoices and expenses reports
 */
corporateRouter.get('/invoices', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    const employeeCheck = await db.query(
      `SELECT corporate_id FROM corporate_employees WHERE user_id = $1 AND role = 'manager'`,
      [userId]
    );

    if (employeeCheck.rowCount === 0) {
      res.status(403).json({ error: 'Access Denied: Corporate invoice access restricted to managers' });
      return;
    }

    const corporateId = employeeCheck.rows[0].corporate_id;

    const invoicesRes = await db.query(
      `SELECT b.id as booking_id, b.date, b.address, b.description, b.service_price, 
              u.full_name as employee_name, f.full_name as fundi_name, b.status
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       JOIN users f ON b.fundi_id = f.id
       WHERE b.corporate_id = $1 AND b.status = 'completed'`,
      [corporateId]
    );

    const totalSpent = invoicesRes.rows.reduce((sum, row) => sum + parseFloat(row.service_price), 0);

    res.status(200).json({
      corporateId,
      totalSpent,
      invoices: invoicesRes.rows
    });
  } catch (error) {
    console.error('Error loading invoices:', error);
    res.status(500).json({ error: 'Failed to load invoices' });
  }
});

/**
 * @route POST /api/corporate/approve-expense
 * @desc Approve corporate expense limit for employee booking
 */
corporateRouter.post('/approve-expense', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { employeeId, bookingId, approved } = req.body;
  const userId = req.user?.id;

  try {
    const managerCheck = await db.query(
      `SELECT corporate_id FROM corporate_employees WHERE user_id = $1 AND role = 'manager'`,
      [userId]
    );

    if (managerCheck.rowCount === 0) {
      res.status(403).json({ error: 'Access Denied: Only corporate managers can approve expenses' });
      return;
    }

    // Process mock expense approval
    res.status(200).json({
      message: approved ? 'Expense approved successfully' : 'Expense rejected and locked',
      bookingId,
      employeeId,
      approved
    });
  } catch (error) {
    console.error('Error approving expense:', error);
    res.status(500).json({ error: 'Expense approval failed' });
  }
});

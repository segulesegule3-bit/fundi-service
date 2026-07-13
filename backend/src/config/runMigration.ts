import { db } from '../db';
import fs from 'fs';
import path from 'path';

async function run() {
  try {
    const sqlPath = path.join(__dirname, '../../../database/migrations/upgraded_profile.sql');
    console.log('Reading migration file from:', sqlPath);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Applying migration to database...');
    
    // Execute SQL script
    await db.query(sql);
    
    console.log('Migration applied successfully!');
    process.exit(0);
  } catch (err: any) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

run();

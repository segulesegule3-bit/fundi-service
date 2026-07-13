"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function run() {
    try {
        const sqlPath = path_1.default.join(__dirname, '../../../database/migrations/upgraded_profile.sql');
        console.log('Reading migration file from:', sqlPath);
        const sql = fs_1.default.readFileSync(sqlPath, 'utf8');
        console.log('Applying migration to database...');
        // Execute SQL script
        await db_1.db.query(sql);
        console.log('Migration applied successfully!');
        process.exit(0);
    }
    catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}
run();

# Installation Guide - Fundi Service Tanzania

This guide details setting up the Fundi Service Tanzania marketplace development environment.

## Prerequisites
Ensure the following are installed:
1. **Node.js (v20.x or later)** & `npm`
2. **PostgreSQL (v15.x or later)** with **PostGIS** geo-spatial extensions
3. **Docker Desktop** (for containerized execution)
4. **Expo CLI** (`npm install -g expo-cli`) for compiling the mobile application
5. **Git**

---

## 1. Database Setup

1. Create a database in PostgreSQL:
   ```sql
   CREATE DATABASE fundi_db;
   ```
2. Enable PostGIS & UUID extensions:
   ```sql
   \c fundi_db;
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
3. Run the database migration script:
   ```bash
   psql -U postgres -d fundi_db -f ../database/schema.sql
   ```
4. Seed the default database data:
   ```bash
   psql -U postgres -d fundi_db -f ../database/seed.sql
   ```

---

## 2. Backend Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Configure the environmental variables. Copy `.env` template and verify options:
   ```bash
   cp .env.example .env
   ```
4. Start the Node.js/Express development server:
   ```bash
   npm run dev
   ```
   *The REST API will be running on `http://localhost:5000/api` and the Swagger docs on `http://localhost:5000/api-docs`.*

---

## 3. Frontend Web Client Installation

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Boot Vite development environment:
   ```bash
   npm run dev
   ```
   *The PWA website and Admin interface will load on `http://localhost:3000`.*

---

## 4. Mobile App (Expo) Installation

1. Navigate to the mobile directory:
   ```bash
   cd ../mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch Expo development tool:
   ```bash
   npm run start
   ```
   - Press **a** to launch on Android Emulator.
   - Press **i** to launch on iOS Simulator.
   - Scan the QR code using Expo Go on your mobile phone to debug on physical devices.

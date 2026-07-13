# Fundi Service Tanzania

Fundi Service Tanzania is a complete, enterprise-level production-ready service marketplace platform connecting local certified technicians (Fundis) with customers. The platform is designed with a premium Material Design 3 theme supporting responsive web, mobile, and administrative modules.

---

## 🛠️ Technology Stack

- **Core Backend:** Node.js (TypeScript) + Express.js + PostGIS (Geographic PostgreSQL)
- **Real-Time Layer:** Socket.io WebSockets (Chat, GPS Tracking & Status Sync)
- **API Interfaces:** RESTful Web APIs + GraphQL endpoints (with Swagger & GraphiQL support)
- **Frontend Client & PWA:** React.js (Vite) + TailwindCSS + Framer Motion (premium animations)
- **Admin Dashboard:** Responsive Analytics Charts + Commission Controls + Evidence disputing
- **Mobile Application:** React Native (Expo template) supporting FaceID / TouchID biometric locks and GPS Location sync

---

## 🚀 Advanced Features Built-in

1. **AI Smart Recommendations:** Weighs geographic distance (Haversine formula), average customer star ratings, response speeds, hourly pricing rates, and verified premium memberships to sort and suggest active Fundis.
2. **ACID Digital Wallet:** Secure transactions ledger supporting mobile money (M-Pesa, Airtel, Tigo, AzamPay) deposit simulation, withdrawals, and escrow bookings.
3. **Escrow Lock State Machine:** Holds funds securely upon booking acceptance. Releases payouts to Fundi only upon completion verification, or processes instant refunds upon cancellation/rejection.
4. **Disputes Panel Workspace:** Admin interface displaying evidence submissions, chats histories, and quick winner picking to release or refund held escrow funds.
5. **Real-time Map tracking:** Emulated route mapping and real-time distance updates (distance remaining and ETA) synchronizing via WebSockets.
6. **Chatbot Support:** Floating helper chatbot answering support FAQs, finding plumbers, and performing wallet checks.
7. **PWA Installability:** Fully configured web app manifest and offline caching support.

---

## 📂 Project Structure

```
fundi-service-tanzania/
├── database/
│   ├── schema.sql           # PostgreSQL tables, PostGIS indices & triggers
│   └── seed.sql             # Region, District, Ward, and Profession seeds
├── backend/
│   ├── src/
│   │   ├── __tests__/       # Supertest API endpoints testing
│   │   ├── graphql/         # GraphQL Query and Mutation resolvers
│   │   ├── routes/          # Express API endpoints routing
│   │   ├── services/        # Escrow wallets, SMS gateways, and AI recommend engine
│   │   ├── sockets/         # WebSocket chat and live location tracking handlers
│   │   ├── db.ts            # PostgreSQL pool client and transactions wrapper
│   │   └── index.ts         # Server entrypoint
│   ├── Dockerfile
│   └── tsconfig.json
├── frontend/
│   ├── public/              # Icons and PWA Web App manifest
│   ├── src/
│   │   ├── components/      # Smart search, chatbot and tracking maps
│   │   ├── App.tsx          # Responsive layout displaying marketplace, admin, and chat
│   │   ├── index.css        # Glassmorphism utilities and global styling directives
│   │   └── main.tsx         # React bootstrap
│   └── vite.config.ts
├── mobile/
│   ├── App.tsx              # Expo React Native App (Biometrics & Location tracking)
│   └── package.json
├── docker/
│   ├── docker-compose.yml   # Multi-container orchestration config
│   └── nginx.conf           # Web proxy and WebSocket upgrades router
├── k8s/
│   └── deployment.yml       # Kubernetes pods, services and ingress manifest
└── docs/
    ├── INSTALLATION.md      # Detailed database migrations and local launch guides
    └── DEPLOYMENT.md        # Ubuntu Docker and Nginx SSL deployment instructions
```

---

## 🚦 Quick Start

To launch the backend, database, and client apps concurrently:

1. **Docker Compose:**
   ```bash
   cd docker
   docker-compose up --build
   ```
   *Brings up PostgreSQL on `5432`, Backend REST & GraphQL APIs on `5000`, and Vite React website on `80`.*

2. **Manual Run:**
   - Follow instructions in [docs/INSTALLATION.md](file:///docs/INSTALLATION.md).
   - Read deployment options in [docs/DEPLOYMENT.md](file:///docs/DEPLOYMENT.md).

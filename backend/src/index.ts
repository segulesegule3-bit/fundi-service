import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { createHandler } from 'graphql-http/lib/use/express';
import swaggerUi from 'swagger-ui-express';

// Routers
import { authRouter } from './routes/authRoutes';
import { fundiRouter } from './routes/fundiRoutes';
import { bookingRouter } from './routes/bookingRoutes';
import { paymentRouter } from './routes/paymentRoutes';
import { chatRouter } from './routes/chatRoutes';
import { walletRouter } from './routes/walletRoutes';
import { palmpayRouter } from './routes/palmpayRoutes';
import { dispatchRouter } from './routes/dispatchRoutes';
import { aiRouter } from './routes/aiRoutes';
import { DispatchSocket } from './sockets/dispatchSocket';
import { adminRouter } from './routes/adminRoutes';
import { corporateRouter } from './routes/corporateRoutes';
import { warrantyRouter } from './routes/warrantyRoutes';
import { appRouter } from './routes/appRoutes';
import { quoteRouter } from './routes/quoteRoutes';
import { opsRouter } from './routes/opsRoutes';
import { AppController } from './controllers/appController';

// Services / Sockets
import { ChatSocket } from './sockets/chatSocket';
import { graphqlSchema } from './graphql/schema';
import { rateLimiter } from './middlewares/rateLimiter';
import { db } from './db';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

import path from 'path';

// Middlewares
app.use(rateLimiter);

// Secure Headers Configuration
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self' http: https: ws: wss:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:;");
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Hardened CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/downloads', express.static(path.join(__dirname, '../public/downloads')));

// REST Routes
app.use('/api/auth', authRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/fundis', fundiRouter);
app.use('/api/v1/fundis', fundiRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/chats', chatRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/admin', adminRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/corporate', corporateRouter);
app.use('/api/v1/corporate', corporateRouter);
app.use('/api/warranties', warrantyRouter);
app.use('/api/v1/warranties', warrantyRouter);
app.use('/api/app', appRouter);
app.use('/api/v1/app', appRouter);
app.get('/download/:appType', AppController.downloadApk);
app.get('/api/version', AppController.checkVersion);
app.get('/:filename.apk', AppController.downloadApkDirect);
app.use('/api/quotes', quoteRouter);
app.use('/api/v1/quotes', quoteRouter);
app.use('/api/ops', opsRouter);
app.use('/api/v1/ops', opsRouter);
app.use('/api/v1', palmpayRouter);
app.use('/api/v1', dispatchRouter);
app.use('/api/v1', aiRouter);

// GraphQL Endpoint
app.use('/graphql', createHandler({ schema: graphqlSchema }));

// Swagger Documentation (Placeholder)
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Fundi Service Tanzania API',
    version: '1.0.0',
    description: 'REST and GraphQL APIs for Fundi Service Tanzania marketplace platform'
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Development Server' }
  ],
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new customer or fundi',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  phoneNumber: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string', enum: ['customer', 'fundi'] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'User successfully created' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Log in with credentials',
        responses: {
          200: { description: 'Login successful' }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Healthcheck Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Initialize Socket.io Chat Gateway
ChatSocket.init(io);
DispatchSocket.init(io);

const PORT = process.env.PORT || 5000;

// Startup database migrations / column validation checks
db.query('ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS signature VARCHAR(255)').catch(err => {
  console.warn('Could not verify/create signature column in database:', err.message);
});

AppController.seedVersionsIfEmpty().catch(err => {
  console.error('Failed seeding AppVersion database: ', err.message);
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  Fundi Service Tanzania Server Initialized    `);
    console.log(`  REST API Available: http://localhost:${PORT}/api`);
    console.log(`  GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`  API docs page: http://localhost:${PORT}/api-docs`);
    console.log(`  WebSocket running on ws://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}

export { app, server };

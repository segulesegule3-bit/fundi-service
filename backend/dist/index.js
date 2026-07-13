"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_2 = require("graphql-http/lib/use/express");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// Routers
const authRoutes_1 = require("./routes/authRoutes");
const fundiRoutes_1 = require("./routes/fundiRoutes");
const bookingRoutes_1 = require("./routes/bookingRoutes");
const paymentRoutes_1 = require("./routes/paymentRoutes");
const chatRoutes_1 = require("./routes/chatRoutes");
const walletRoutes_1 = require("./routes/walletRoutes");
const palmpayRoutes_1 = require("./routes/palmpayRoutes");
const dispatchRoutes_1 = require("./routes/dispatchRoutes");
const aiRoutes_1 = require("./routes/aiRoutes");
const dispatchSocket_1 = require("./sockets/dispatchSocket");
const adminRoutes_1 = require("./routes/adminRoutes");
const corporateRoutes_1 = require("./routes/corporateRoutes");
const warrantyRoutes_1 = require("./routes/warrantyRoutes");
const appRoutes_1 = require("./routes/appRoutes");
const quoteRoutes_1 = require("./routes/quoteRoutes");
const opsRoutes_1 = require("./routes/opsRoutes");
const appController_1 = require("./controllers/appController");
// Services / Sockets
const chatSocket_1 = require("./sockets/chatSocket");
const schema_1 = require("./graphql/schema");
const rateLimiter_1 = require("./middlewares/rateLimiter");
const db_1 = require("./db");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
    }
});
const path_1 = __importDefault(require("path"));
// Middlewares
app.use(rateLimiter_1.rateLimiter);
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
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/downloads', express_1.default.static(path_1.default.join(__dirname, '../public/downloads')));
// REST Routes
app.use('/api/auth', authRoutes_1.authRouter);
app.use('/api/v1/auth', authRoutes_1.authRouter);
app.use('/api/fundis', fundiRoutes_1.fundiRouter);
app.use('/api/v1/fundis', fundiRoutes_1.fundiRouter);
app.use('/api/bookings', bookingRoutes_1.bookingRouter);
app.use('/api/v1/bookings', bookingRoutes_1.bookingRouter);
app.use('/api/payments', paymentRoutes_1.paymentRouter);
app.use('/api/v1/payments', paymentRoutes_1.paymentRouter);
app.use('/api/wallet', walletRoutes_1.walletRouter);
app.use('/api/v1/wallet', walletRoutes_1.walletRouter);
app.use('/api/chats', chatRoutes_1.chatRouter);
app.use('/api/v1/chats', chatRoutes_1.chatRouter);
app.use('/api/admin', adminRoutes_1.adminRouter);
app.use('/api/v1/admin', adminRoutes_1.adminRouter);
app.use('/api/corporate', corporateRoutes_1.corporateRouter);
app.use('/api/v1/corporate', corporateRoutes_1.corporateRouter);
app.use('/api/warranties', warrantyRoutes_1.warrantyRouter);
app.use('/api/v1/warranties', warrantyRoutes_1.warrantyRouter);
app.use('/api/app', appRoutes_1.appRouter);
app.use('/api/v1/app', appRoutes_1.appRouter);
app.get('/download/:appType', appController_1.AppController.downloadApk);
app.get('/api/version', appController_1.AppController.checkVersion);
app.get('/:filename.apk', appController_1.AppController.downloadApkDirect);
app.use('/api/quotes', quoteRoutes_1.quoteRouter);
app.use('/api/v1/quotes', quoteRoutes_1.quoteRouter);
app.use('/api/ops', opsRoutes_1.opsRouter);
app.use('/api/v1/ops', opsRoutes_1.opsRouter);
app.use('/api/v1', palmpayRoutes_1.palmpayRouter);
app.use('/api/v1', dispatchRoutes_1.dispatchRouter);
app.use('/api/v1', aiRoutes_1.aiRouter);
// GraphQL Endpoint
app.use('/graphql', (0, express_2.createHandler)({ schema: schema_1.graphqlSchema }));
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
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// Healthcheck Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date() });
});
// Initialize Socket.io Chat Gateway
chatSocket_1.ChatSocket.init(io);
dispatchSocket_1.DispatchSocket.init(io);
const PORT = process.env.PORT || 5000;
// Startup database migrations / column validation checks
db_1.db.query('ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS signature VARCHAR(255)').catch(err => {
    console.warn('Could not verify/create signature column in database:', err.message);
});
appController_1.AppController.seedVersionsIfEmpty().catch(err => {
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

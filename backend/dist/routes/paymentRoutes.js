"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
exports.paymentRouter = (0, express_1.Router)();
exports.paymentRouter.post('/initiate', paymentController_1.PaymentController.initiate);
exports.paymentRouter.post('/webhook/:provider', paymentController_1.PaymentController.webhook);

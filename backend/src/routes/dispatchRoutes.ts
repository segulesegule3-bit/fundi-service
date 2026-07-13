import { Router } from 'express';
import { DispatchController } from '../controllers/dispatchController';

export const dispatchRouter = Router();

dispatchRouter.post('/location/update', DispatchController.updateLocation);
dispatchRouter.get('/fundis/nearby', DispatchController.findNearby);
dispatchRouter.post('/jobs/dispatch', DispatchController.dispatchJob);
dispatchRouter.post('/jobs/accept', DispatchController.acceptJob);
dispatchRouter.post('/jobs/reject', DispatchController.rejectJob);

import { Router } from 'express';
import { checkSubscriptionRenewalDate, sendReminders } from '../controllers/workflow.controller.js';

const workflowRouter = Router();

workflowRouter.post('/', sendReminders);
workflowRouter.post('/schedule', checkSubscriptionRenewalDate);

export default workflowRouter;
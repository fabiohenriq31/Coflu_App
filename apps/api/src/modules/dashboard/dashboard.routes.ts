import { Router } from 'express';

import { getCategories, getMembers, getSummary } from './dashboard.controller.js';

export const dashboardRoutes = Router({ mergeParams: true });

dashboardRoutes.get('/summary', getSummary);
dashboardRoutes.get('/categories', getCategories);
dashboardRoutes.get('/members', getMembers);

import { Router } from 'express';

import { authRoutes } from '../modules/auth/auth.routes.js';
import { groupsRoutes } from '../modules/groups/groups.routes.js';
import { healthRoutes } from '../modules/health/health.routes.js';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/groups', groupsRoutes);
routes.use('/health', healthRoutes);

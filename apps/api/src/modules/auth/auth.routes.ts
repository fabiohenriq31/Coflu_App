import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.js';
import { login, logout, me, register } from './auth.controller.js';

export const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/me', authenticate, me);
authRoutes.post('/logout', authenticate, logout);

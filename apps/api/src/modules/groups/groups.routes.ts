import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.js';
import { categoriesRoutes } from '../categories/categories.routes.js';
import { dashboardRoutes } from '../dashboard/dashboard.routes.js';
import { transactionsRoutes } from '../transactions/transactions.routes.js';
import {
  createGroup,
  deleteGroup,
  getGroup,
  inviteMember,
  listGroups,
  listMembers,
  removeMember,
  updateGroup,
  updateMemberRole,
} from './groups.controller.js';

export const groupsRoutes = Router();

groupsRoutes.use(authenticate);

groupsRoutes.post('/', createGroup);
groupsRoutes.get('/', listGroups);

groupsRoutes.use('/:groupId/categories', categoriesRoutes);
groupsRoutes.use('/:groupId/dashboard', dashboardRoutes);
groupsRoutes.use('/:groupId/transactions', transactionsRoutes);

groupsRoutes.get('/:groupId', getGroup);
groupsRoutes.patch('/:groupId', updateGroup);
groupsRoutes.delete('/:groupId', deleteGroup);

groupsRoutes.get('/:groupId/members', listMembers);
groupsRoutes.post('/:groupId/invite', inviteMember);
groupsRoutes.patch('/:groupId/members/:memberId/role', updateMemberRole);
groupsRoutes.delete('/:groupId/members/:memberId', removeMember);

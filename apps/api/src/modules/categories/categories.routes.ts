import { Router } from 'express';

import { listCategories } from './categories.controller.js';

export const categoriesRoutes = Router({ mergeParams: true });

categoriesRoutes.get('/', listCategories);

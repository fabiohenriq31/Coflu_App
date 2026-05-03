import { Router } from 'express';

import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from './categories.controller.js';

export const categoriesRoutes = Router({ mergeParams: true });

categoriesRoutes.get('/', listCategories);
categoriesRoutes.post('/', createCategory);
categoriesRoutes.patch('/:categoryId', updateCategory);
categoriesRoutes.delete('/:categoryId', deleteCategory);

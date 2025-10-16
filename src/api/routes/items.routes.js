import { Router } from 'express';
import { listItems } from '../controllers/items.controller.js';

export const itemsRouter = Router();
itemsRouter.get('/', listItems);

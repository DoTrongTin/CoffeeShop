import { Router } from 'express';
import { getProducts } from './product.controller.js';

const productRoutes = Router();

productRoutes.get('/', getProducts);

export default productRoutes;
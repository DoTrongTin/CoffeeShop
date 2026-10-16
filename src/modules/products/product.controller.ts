import type { Request, Response } from 'express';
import { productService } from './product.service.js';

export const getProducts = (_request: Request, response: Response) => {
  response.json(productService.listProducts());
};
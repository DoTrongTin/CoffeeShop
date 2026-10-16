import { productService } from './product.service.js';
export const getProducts = (_request, response) => {
    response.json(productService.listProducts());
};

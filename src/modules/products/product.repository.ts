import type { Product } from './product.types.js';

const products: Product[] = [
  { id: '1', name: 'Cà phê Đen', price: 20000 },
  { id: '2', name: 'Cà phê Sữa', price: 25000 },
  { id: '3', name: 'Bạc Xỉu', price: 30000 },
];

export const productRepository = {
  findAll(): Product[] {
    return products;
  },
};
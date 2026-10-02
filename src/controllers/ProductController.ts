import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../services/ProductService';
import { Product } from '../models/Product';

export const useProducts = () => {
  return useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};

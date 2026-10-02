import React from 'react';
import { useProducts } from '../controllers/ProductController';

export default function HomeScreen() {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>Đã xảy ra lỗi: {error.message}</div>;

  return (
    <div>
      <h1>Coffee Shop - Các công nghệ lập trình hiện đại</h1>
      <h2>Danh sách sản phẩm</h2>
      <ul>
        {products?.map(product => (
          <li key={product.id}>
            {product.name} - {product.price} VND
          </li>
        ))}
      </ul>
    </div>
  );
}

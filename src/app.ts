import cors from 'cors';
import express from 'express';
import productRoutes from './modules/products/product.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/hello', (_request, response) => {
  response.json({ message: 'CoffeeShop backend is running' });
});

app.use('/api/products', productRoutes);

export default app;
import cors from 'cors';
import express from 'express';
import { errorHandler, notFoundHandler } from './common/middleware/error-handler.js';
import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/product.routes.js';
const app = express();
app.use(cors());
app.use(express.json());
app.get('/hello', (_request, response) => {
    response.json({ message: 'CoffeeShop backend is running' });
});
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;

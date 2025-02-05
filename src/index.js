// src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import vehiclesRouter from './routes/vehicles.js';
import brandsRouter from './routes/brands.js';
import driversRouter from './routes/drivers.js';
import availableRouter from './routes/available.js';
import routesRouter from './routes/routes.js';
import errorHandler from './middlewares/errorHandler.js'

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Rutas
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/routes/', availableRouter);
app.use('/api/routes', routesRouter);

app.use(errorHandler);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
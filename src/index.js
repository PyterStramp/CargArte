// src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import vehiclesRouter from './routes/vehicles.js';
import brandsRouter from './routes/brands.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL
}));
app.use(express.json());

// Rutas
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/brands', brandsRouter);

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
// src/routes/brands.js
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/brands
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM get_brands()');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/brands/:id/models
router.get('/:id/models', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM get_models_by_brand($1)', [id]);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
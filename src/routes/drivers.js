// src/routes/brands.js
import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// GET /api/

// GET /api/drivers/available
router.get("/available", async (req, res, next) => {
  try {
    let { date } = req.query;

    // Validar formato de fecha
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Se requiere una fecha",
      });
    }

    // Asegurarnos de que la fecha esté en formato YYYY-MM-DD
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Formato de fecha inválido",
      });
    }

    // Formatear la fecha para la consulta SQL
    const formattedDate = dateObj.toISOString().split("T")[0];
    const result = await pool.query(
      `
        SELECT id, first_name, last_name, license_number, phone 
        FROM drivers 
        WHERE id NOT IN (
          SELECT driver_id 
          FROM routes 
          WHERE date = $1 AND driver_id IS NOT NULL
        )
        `,
      [formattedDate]
    );
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error in /available:', error);
    next(error);
  }
});

export default router;

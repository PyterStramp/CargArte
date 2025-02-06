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
// GET api/drivers/
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT id, first_name, identification ,last_name, license_number, phone, email,created_at
        FROM drivers 
        `
    );
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error in /available:', error);
    next(error);
  }
})

// GET /api/drivers/:identification
router.get("/:identification", async (req, res, next) => {
  try {
    const { identification } = req.params;
    console.log("Request", req.params);
    const result = await pool.query(
      `
        SELECT id, first_name, last_name, identification, license_number, phone, email, created_at
        FROM drivers 
        WHERE identification = $1
        `,
      [identification]
    );
    // console.log(result);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }
    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error in /:id:', error);
    next(error);
  }
});

router.delete("/:identification", async (req, res, next) => {
  try {
    const { identification } = req.params;
    console.log("Request", req.params);

    const result = await pool.query(
      `DELETE FROM drivers WHERE identification = $1 RETURNING *`,
      [identification]
    );

    // Verificar si se eliminó algo
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontró un conductor con esa identificación.",
      });
    }

    res.json({
      success: true,
      message: "Conductor eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error en DELETE /drivers/:identification:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
    });
  }
});



// POST /api/drivers/
router.post("/", async (req, res, next) => {
  try {
    const { identification, first_name, last_name, license_number, phone, email } = req.body;
    if (!identification || !first_name || !last_name || !license_number || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Todos los datos son necesarios",
      });
    }
    // Validar que el número de licencia no haya sido utilizado anteriormente

    const result = await pool.query(
      `
        INSERT INTO drivers (identification,first_name, last_name, license_number, phone, email)
        VALUES ($1, $2, $3, $4, $5,$6)
        RETURNING id
        `,
      [identification, first_name, last_name, license_number, phone, email]
    );
    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error in /post:', error);
    next(error);
  }
});

// PUT /api/drivers/:identification

router.put("/:identification", async (req, res, next) => {
  try {
    const { identification } = req.params
    const { first_name, last_name, phone, email } = req.body;
    if (!identification || !first_name || !last_name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Todos los datos son necesarios",
      });
    }
    // Validar que el número de licencia no haya sido utilizado anteriormente
    const validatePhone = await pool.query(
      `
        SELECT COUNT(*) AS count
        FROM drivers
        WHERE phone = $1 AND identification!= $2`,
      [phone, identification]
    );
    if (validatePhone.rows[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "Número de licencia ya está en uso",
      });
    }
    console.log("Telefono valido");
    // Actualizar los datos del conductor
    const result = await pool.query(
      `
        UPDATE drivers
        SET first_name = $2, last_name = $3, phone = $4, email = $5
        WHERE identification = $1`,
      [identification, first_name, last_name, phone, email]
    );
    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error in PUT/:', error);
    next(error);
  }
});

export default router;

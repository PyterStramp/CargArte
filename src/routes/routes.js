// src/routes/brands.js
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// POST /api/routes - Crear nueva ruta
router.post('/', async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { name, driver_id, vehicle_id, date, status = 'Pending' } = req.body;

    // Validar disponibilidad de conductor y vehículo
    const availabilityCheck = await client.query(
      `SELECT 
          (SELECT COUNT(*) FROM routes WHERE driver_id = $1 AND date = $2) as driver_routes,
          (SELECT COUNT(*) FROM routes WHERE vehicle_id = $3 AND date = $2) as vehicle_routes`,
      [driver_id, date, vehicle_id]
    );

    const { driver_routes, vehicle_routes } = availabilityCheck.rows[0];

    if (driver_routes > 0) {
      throw new Error('El conductor ya tiene una ruta asignada para esta fecha');
    }

    if (vehicle_routes > 0) {
      throw new Error('El vehículo ya está asignado para esta fecha');
    }

    // Insertar la ruta
    const result = await client.query(
      `INSERT INTO routes (name, driver_id, vehicle_id, date, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
      [name, driver_id, vehicle_id, date, status]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// POST /api/routes/:id/delivery-points - Añadir punto de entrega
router.post('/:id/delivery-points', async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id: route_id } = req.params;
    const { latitude, longitude, address, packages_count } = req.body;

    // Validar que la ruta existe
    const routeCheck = await client.query(
      'SELECT id FROM routes WHERE id = $1',
      [route_id]
    );

    if (routeCheck.rows.length === 0) {
      throw new Error('Ruta no encontrada');
    }

    // Insertar punto de entrega
    const result = await client.query(
      `INSERT INTO delivery_points 
         (route_id, latitude, longitude, address, packages_count)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
      [route_id, latitude, longitude, address, packages_count]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// GET /api/routes - Obtener todas las rutas
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT r.*, 
          d.first_name || ' ' || d.last_name as driver_name,
          v.plate as vehicle_plate
         FROM routes r
         LEFT JOIN drivers d ON r.driver_id = d.id
         LEFT JOIN vehicles v ON r.vehicle_id = v.id
         ORDER BY r.date DESC`
    );
    const formatoFecha = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });
    const formattedRoutes = result.rows.map(row => ({
      ...row,
      date: formatoFecha.format(new Date(row.date)) // Formatea la fecha
    }));
    res.json({
      success: true,
      data: formattedRoutes
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/routes/:id - Obtener detalles de una ruta
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Obtener información de la ruta
    const routeResult = await pool.query(
      `SELECT r.*, 
          d.first_name || ' ' || d.last_name as driver_name,
          v.plate as vehicle_plate
         FROM routes r
         LEFT JOIN drivers d ON r.driver_id = d.id
         LEFT JOIN vehicles v ON r.vehicle_id = v.id
         WHERE r.id = $1`,
      [id]
    );

    if (routeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
      });
    }

    // Obtener puntos de entrega
    const pointsResult = await pool.query(
      `SELECT * FROM delivery_points
         WHERE route_id = $1
         ORDER BY id`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...routeResult.rows[0],
        delivery_points: pointsResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const { id } = req.params; // ID de la ruta a eliminar

  try {
    await pool.query("BEGIN"); // Iniciamos una transacción

    // 1️⃣ Eliminar los puntos de entrega asociados a la ruta
    await pool.query("DELETE FROM delivery_points WHERE route_id = $1", [id]);

    // 2️⃣ Luego, eliminar la ruta
    const result = await pool.query("DELETE FROM routes WHERE id = $1 RETURNING *", [id]);

    // Si la ruta no existía, enviamos un 404
    if (result.rowCount === 0) {
      await pool.query("ROLLBACK"); // Revertimos la transacción
      return res.status(404).json({ message: "Ruta no encontrada" });
    }

    await pool.query("COMMIT"); // Confirmamos la transacción
    

    res.json({
      success: true,
    });
  } catch (error) {
    await pool.query("ROLLBACK"); // Si hay error, revertimos la transacción
    console.error("Error al eliminar la ruta:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});



export default router;
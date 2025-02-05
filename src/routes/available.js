import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// POST /api/routes/validate-availability
router.post("/validate-availability", async (req, res, next) => {
    try {
      const { date, driver_id, vehicle_id } = req.body;
      
      // Verificar disponibilidad del conductor
      const driverCheck = await pool.query(
        `SELECT id FROM routes 
         WHERE date = $1 AND driver_id = $2`,
        [date, driver_id]
      );
  
      // Verificar disponibilidad del vehículo
      const vehicleCheck = await pool.query(
        `SELECT id FROM routes 
         WHERE date = $1 AND vehicle_id = $2`,
        [date, vehicle_id]
      );
  
      res.json({
        success: true,
        data: {
          isDriverAvailable: driverCheck.rows.length === 0,
          isVehicleAvailable: vehicleCheck.rows.length === 0
        }
      });
    } catch (error) {
      next(error);
    }
});

export default router;
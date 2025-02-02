// src/routes/vehicles.js
import express from "express";
import pool from "../config/database.js";

const vehiclesrouter = express.Router();

// GET /api/vehicles
vehiclesrouter.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM get_vehicles()");
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/vehicles/:plate
vehiclesrouter.get("/:plate", async (req, res, next) => {
  try {
    const { plate } = req.params;
    const result = await pool.query("SELECT * FROM get_vehicle_by_plate($1)", [
      plate,
    ]);
    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

//POST

vehiclesrouter.post('/', async (req, res) => {
    try {
      const { plate, modelId, color, cargoCapacity } = req.body;
  
      // Validaciones básicas
      if (!plate || !modelId || !color || !cargoCapacity) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }
  
      // Validar formato de placa (3 letras y 3 números)
      const plateRegex = /^[A-Z]{3}[0-9]{3}$/;
      if (!plateRegex.test(plate)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de placa inválido. Debe ser tipo ABC123'
        });
      }
  
      // Validar capacidad de carga
      if (cargoCapacity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La capacidad de carga debe ser mayor a 0'
        });
      }
  
      const result = await pool.query(
        'SELECT * FROM create_vehicle($1, $2, $3, $4)',
        [plate, modelId, color, cargoCapacity]
      );
  
      const response = result.rows[0];
  
      if (!response.success) {
        return res.status(400).json({
          success: false,
          message: response.message
        });
      }
  
      res.status(201).json({
        success: true,
        message: response.message,
        data: {
          plate: response.plate,
          brand_name: response.brand_name,
          model_name: response.model_name,
          color: response.color,
          cargo_capacity: response.cargo_capacity
        }
      });
  
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
});

//PUT
// PUT /api/vehicles/:plate
vehiclesrouter.put('/:plate', async (req, res) => {
    try {
      const { plate } = req.params;
      const { modelId, color, cargoCapacity } = req.body;
  
      if (!modelId || !color || !cargoCapacity) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }
  
      if (cargoCapacity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La capacidad de carga debe ser mayor a 0'
        });
      }
  
      const result = await pool.query(
        'SELECT * FROM update_vehicle($1, $2, $3, $4)',
        [plate, modelId, color, cargoCapacity]
      );
  
      const response = result.rows[0];
  
      if (!response.success) {
        return res.status(400).json({
          success: false,
          message: response.message
        });
      }
  
      res.json({
        success: true,
        message: response.message,
        data: {
          plate: response.plate,
          brand_name: response.brand_name,
          model_name: response.model_name,
          color: response.color,
          cargo_capacity: response.cargo_capacity
        }
      });
  
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
});

//DELETE

// DELETE /api/vehicles/:plate
vehiclesrouter.delete('/:plate', async (req, res) => {
    try {
      const { plate } = req.params;
  
      const result = await pool.query(
        'SELECT * FROM delete_vehicle($1)',
        [plate]
      );
  
      const response = result.rows[0];
  
      if (!response.success) {
        return res.status(400).json({
          success: false,
          message: response.message
        });
      }
  
      res.json({
        success: true,
        message: response.message,
        data: { plate: response.plate }
      });
  
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
});

export default vehiclesrouter;

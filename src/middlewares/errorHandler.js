// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    // Errores conocidos
    if (err.message.includes('ya tiene una ruta asignada') ||
        err.message.includes('ya está asignado')) {
      return res.status(409).json({
        success: false,
        message: err.message
      });
    }
  
    // Error de ruta no encontrada
    if (err.message.includes('no encontrada')) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
  
    // Errores de validación de la base de datos
    if (err.code === '23505') { // Error de unicidad
      return res.status(409).json({
        success: false,
        message: 'Ya existe un registro con estos datos'
      });
    }
  
    if (err.code === '23503') { // Error de llave foránea
      return res.status(400).json({
        success: false,
        message: 'Referencia inválida a un registro que no existe'
      });
    }
  
    // Error por defecto
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  };
  
export default errorHandler;
const RecetaService = require('../services/RecetaService');
const { validationResult } = require('express-validator');

class RecetaController {
  async crear(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const receta = await RecetaService.crearReceta(req.body);
      res.status(201).json({
        mensaje: 'Receta creada exitosamente',
        receta
      });
    } catch (error) {
      if (error.message.includes('no encontrado') || error.message.includes('no está activo')) {
        return res.status(404).json({ mensaje: error.message });
      }
      if (error.message.includes('Ya existe')) {
        return res.status(400).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al crear la receta',
        error: error.message
      });
    }
  }

  async obtenerTodas(req, res) {
    try {
      const filtros = {
        id_producto: req.query.id_producto,
        id_ingrediente: req.query.id_ingrediente
      };

      const recetas = await RecetaService.obtenerRecetas(filtros);
      res.status(200).json(recetas);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener las recetas',
        error: error.message
      });
    }
  }

  async obtenerPorPrecio(req, res) {
    try {
      const recetas = await RecetaService.obtenerRecetasPorPrecio(req.params.idPrecio);
      res.status(200).json(recetas);
    } catch (error) {
      if (error.message === 'Presentación/Precio no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener las recetas de la presentación',
        error: error.message
      });
    }
  }

  async obtenerPorProducto(req, res) {
    try {
      const recetas = await RecetaService.obtenerRecetasPorProducto(req.params.idProducto);
      res.status(200).json(recetas);
    } catch (error) {
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener las recetas del producto',
        error: error.message
      });
    }
  }

  async obtenerPorIngrediente(req, res) {
    try {
      const recetas = await RecetaService.obtenerRecetasPorIngrediente(req.params.idIngrediente);
      res.status(200).json(recetas);
    } catch (error) {
      if (error.message === 'Ingrediente no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener las recetas del ingrediente',
        error: error.message
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const receta = await RecetaService.obtenerRecetaPorId(req.params.id);
      res.status(200).json(receta);
    } catch (error) {
      if (error.message === 'Receta no encontrada') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener la receta',
        error: error.message
      });
    }
  }

  async actualizar(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const receta = await RecetaService.actualizarReceta(req.params.id, req.body);
      res.status(200).json({
        mensaje: 'Receta actualizada exitosamente',
        receta
      });
    } catch (error) {
      if (error.message.includes('no encontrad')) {
        return res.status(404).json({ mensaje: error.message });
      }
      if (error.message.includes('Ya existe') || error.message.includes('no está activo')) {
        return res.status(400).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al actualizar la receta',
        error: error.message
      });
    }
  }

  async eliminar(req, res) {
    try {
      const resultado = await RecetaService.eliminarReceta(req.params.id);
      res.status(200).json(resultado);
    } catch (error) {
      if (error.message === 'Receta no encontrada') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al eliminar la receta',
        error: error.message
      });
    }
  }

  async calcularCostoPorPrecio(req, res) {
    try {
      const costo = await RecetaService.calcularCostoProduccionPorPrecio(req.params.idPrecio);
      res.status(200).json(costo);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al calcular el costo de producción de la presentación',
        error: error.message
      });
    }
  }

  async calcularCosto(req, res) {
    try {
      const costo = await RecetaService.calcularCostoProduccion(req.params.idProducto);
      res.status(200).json(costo);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al calcular el costo de producción',
        error: error.message
      });
    }
  }

  async duplicar(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const { id_producto_origen, id_producto_destino } = req.body;
      const resultado = await RecetaService.duplicarReceta(id_producto_origen, id_producto_destino);
      
      res.status(200).json(resultado);
    } catch (error) {
      if (error.message.includes('no fueron encontrados') || error.message.includes('no tiene recetas')) {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al duplicar la receta',
        error: error.message
      });
    }
  }
}

module.exports = new RecetaController();

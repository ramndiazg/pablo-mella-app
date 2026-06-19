const Expense = require("../models/Expense");

// @desc    Registrar gasto
// @route   POST /api/gastos
// @access  Private/Admin
const crearGasto = async (req, res) => {
  try {
    const { descripcion, monto, categoria, fecha } = req.body;

    if (!descripcion || !monto || !categoria || !fecha) {
      return res.status(400).json({ mensaje: "Faltan campos requeridos" });
    }

    const gasto = await Expense.create({
      descripcion,
      monto,
      categoria,
      fecha,
      factura: req.file ? req.file.path : null,
      registradoPor: req.user._id,
    });

    res.status(201).json({ mensaje: "Gasto registrado exitosamente", gasto });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener todos los gastos
// @route   GET /api/gastos
// @access  Private
const getGastos = async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const filtro = {};

    if (mes && anio) {
      const inicio = new Date(anio, mes - 1, 1);
      const fin = new Date(anio, mes, 0, 23, 59, 59);
      filtro.fecha = { $gte: inicio, $lte: fin };
    }

    const gastos = await Expense.find(filtro)
      .populate("registradoPor", "nombre")
      .sort({ fecha: -1 });

    const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);

    res.json({ gastos, totalGastos });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener resumen de gastos por categoría
// @route   GET /api/gastos/resumen
// @access  Private/Admin
const getResumenGastos = async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const filtro = {};

    if (mes && anio) {
      const inicio = new Date(anio, mes - 1, 1);
      const fin = new Date(anio, mes, 0, 23, 59, 59);
      filtro.fecha = { $gte: inicio, $lte: fin };
    }

    const resumen = await Expense.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: "$categoria",
          total: { $sum: "$monto" },
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalGeneral = resumen.reduce((sum, r) => sum + r.total, 0);

    res.json({ resumen, totalGeneral });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Eliminar gasto
// @route   DELETE /api/gastos/:id
// @access  Private/Admin
const eliminarGasto = async (req, res) => {
  try {
    const gasto = await Expense.findByIdAndDelete(req.params.id);

    if (!gasto) {
      return res.status(404).json({ mensaje: "Gasto no encontrado" });
    }

    res.json({ mensaje: "Gasto eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = { crearGasto, getGastos, getResumenGastos, eliminarGasto };

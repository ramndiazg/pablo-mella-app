const Fee = require("../models/Fee");
const Payment = require("../models/Payment");
const Apartment = require("../models/Apartment");

// @desc    Crear cuota (mensual o extraordinaria)
// @route   POST /api/cuotas
// @access  Private/Admin
const crearCuota = async (req, res) => {
  try {
    const { tipo, mes, anio, monto, descripcion, fechaLimite } = req.body;

    if (!tipo || !anio || !monto || !descripcion) {
      return res.status(400).json({ mensaje: "Faltan campos requeridos" });
    }

    if (tipo === "mensual" && !mes) {
      return res
        .status(400)
        .json({ mensaje: "El mes es requerido para cuotas mensuales" });
    }

    // Verificar que no exista ya una cuota mensual para ese mes/año
    if (tipo === "mensual") {
      const cuotaExiste = await Fee.findOne({ tipo: "mensual", mes, anio });
      if (cuotaExiste) {
        return res.status(400).json({
          mensaje: `Ya existe una cuota mensual para ${mes}/${anio}`,
        });
      }
    }

    const cuota = await Fee.create({
      tipo,
      mes: tipo === "mensual" ? mes : null,
      anio,
      monto,
      descripcion,
      fechaLimite: fechaLimite || null,
      creadoPor: req.user._id,
    });

    res.status(201).json({ mensaje: "Cuota creada exitosamente", cuota });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener todas las cuotas
// @route   GET /api/cuotas
// @access  Private
const getCuotas = async (req, res) => {
  try {
    const cuotas = await Fee.find()
      .populate("creadoPor", "nombre")
      .sort({ createdAt: -1 });

    res.json(cuotas);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener una cuota con estado de pagos
// @route   GET /api/cuotas/:id
// @access  Private/Admin
const getCuota = async (req, res) => {
  try {
    const cuota = await Fee.findById(req.params.id).populate(
      "creadoPor",
      "nombre",
    );

    if (!cuota) {
      return res.status(404).json({ mensaje: "Cuota no encontrada" });
    }

    // Obtener pagos de esta cuota
    const pagos = await Payment.find({ cuotaId: cuota._id })
      .populate({
        path: "apartamentoId",
        populate: { path: "edificioId", select: "numero nombre" },
      })
      .populate("residenteId", "nombre email")
      .sort({ createdAt: -1 });

    // Obtener total de apartamentos activos
    const totalApartamentos = await Apartment.countDocuments({ activo: true });
    const totalPagados = pagos.filter((p) => p.estado === "aprobado").length;
    const totalPendientes = pagos.filter(
      (p) => p.estado === "pendiente",
    ).length;
    const totalMorosos = totalApartamentos - totalPagados - totalPendientes;

    res.json({
      cuota,
      pagos,
      resumen: {
        totalApartamentos,
        totalPagados,
        totalPendientes,
        totalMorosos,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener resumen financiero del mes
// @route   GET /api/cuotas/resumen/:mes/:anio
// @access  Private/Admin
const getResumenMensual = async (req, res) => {
  try {
    const { mes, anio } = req.params;

    const cuota = await Fee.findOne({
      tipo: "mensual",
      mes: parseInt(mes),
      anio: parseInt(anio),
    });

    if (!cuota) {
      return res
        .status(404)
        .json({ mensaje: "No existe cuota para ese mes/año" });
    }

    const pagosAprobados = await Payment.find({
      cuotaId: cuota._id,
      estado: "aprobado",
    }).populate("apartamentoId residenteId", "numero nombre email");

    const totalRecaudado = pagosAprobados.reduce((sum, p) => sum + p.monto, 0);
    const totalApartamentos = await Apartment.countDocuments({ activo: true });

    res.json({
      mes,
      anio,
      cuota,
      totalRecaudado,
      totalApartamentos,
      totalPagaron: pagosAprobados.length,
      totalMorosos: totalApartamentos - pagosAprobados.length,
      pagos: pagosAprobados,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = { crearCuota, getCuotas, getCuota, getResumenMensual };

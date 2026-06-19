const Maintenance = require("../models/Maintenance");

// @desc    Crear solicitud de mantenimiento
// @route   POST /api/mantenimiento
// @access  Private
const crearSolicitud = async (req, res) => {
  try {
    const { descripcion, tipo } = req.body;

    if (!descripcion || !tipo) {
      return res
        .status(400)
        .json({ mensaje: "Descripción y tipo son requeridos" });
    }

    if (!req.user.apartamentoId) {
      return res
        .status(400)
        .json({ mensaje: "No tienes apartamento asignado" });
    }

    const solicitud = await Maintenance.create({
      descripcion,
      tipo,
      foto: req.file ? req.file.path : null,
      solicitadoPor: req.user._id,
      apartamentoId: req.user.apartamentoId,
    });

    res
      .status(201)
      .json({ mensaje: "Solicitud creada exitosamente", solicitud });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener todas las solicitudes
// @route   GET /api/mantenimiento
// @access  Private/Admin
const getSolicitudes = async (req, res) => {
  try {
    const { estado } = req.query;
    const filtro = estado ? { estado } : {};

    const solicitudes = await Maintenance.find(filtro)
      .populate("solicitadoPor", "nombre email telefono")
      .populate({
        path: "apartamentoId",
        populate: { path: "edificioId", select: "numero nombre" },
      })
      .sort({ createdAt: -1 });

    res.json(solicitudes);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener mis solicitudes (residente)
// @route   GET /api/mantenimiento/mis-solicitudes
// @access  Private
const getMisSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Maintenance.find({
      solicitadoPor: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(solicitudes);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Actualizar estado de solicitud
// @route   PUT /api/mantenimiento/:id
// @access  Private/Admin
const actualizarSolicitud = async (req, res) => {
  try {
    const { estado, nota } = req.body;

    if (!estado) {
      return res.status(400).json({ mensaje: "El estado es requerido" });
    }

    const solicitud = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { estado, nota: nota || null, actualizadoEn: new Date() },
      { new: true, runValidators: true },
    )
      .populate("solicitadoPor", "nombre email")
      .populate({
        path: "apartamentoId",
        populate: { path: "edificioId", select: "numero nombre" },
      });

    if (!solicitud) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }

    res.json({ mensaje: "Solicitud actualizada", solicitud });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = {
  crearSolicitud,
  getSolicitudes,
  getMisSolicitudes,
  actualizarSolicitud,
};

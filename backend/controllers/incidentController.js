const Incident = require("../models/Incident");

// @desc    Reportar incidencia entre vecinos
// @route   POST /api/incidencias
// @access  Private
const crearIncidencia = async (req, res) => {
  try {
    const { descripcion, anonimo } = req.body;

    if (!descripcion) {
      return res.status(400).json({ mensaje: "La descripción es requerida" });
    }

    if (!req.user.apartamentoId) {
      return res
        .status(400)
        .json({ mensaje: "No tienes apartamento asignado" });
    }

    const incidencia = await Incident.create({
      descripcion,
      anonimo: anonimo || false,
      reportadoPor: req.user._id,
      apartamentoId: req.user.apartamentoId,
    });

    res
      .status(201)
      .json({ mensaje: "Incidencia reportada exitosamente", incidencia });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener todas las incidencias
// @route   GET /api/incidencias
// @access  Private/Admin
const getIncidencias = async (req, res) => {
  try {
    const { estado } = req.query;
    const filtro = estado ? { estado } : {};

    const incidencias = await Incident.find(filtro)
      .populate({
        path: "reportadoPor",
        select: "nombre email telefono",
      })
      .populate({
        path: "apartamentoId",
        populate: { path: "edificioId", select: "numero nombre" },
      })
      .sort({ createdAt: -1 });

    // Si el reporte es anónimo, ocultamos quien lo reportó
    const incidenciasFormateadas = incidencias.map((inc) => {
      const obj = inc.toObject();
      if (obj.anonimo) {
        obj.reportadoPor = { nombre: "Anónimo" };
      }
      return obj;
    });

    res.json(incidenciasFormateadas);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Actualizar estado de incidencia
// @route   PUT /api/incidencias/:id
// @access  Private/Admin
const actualizarIncidencia = async (req, res) => {
  try {
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ mensaje: "El estado es requerido" });
    }

    const incidencia = await Incident.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true, runValidators: true },
    );

    if (!incidencia) {
      return res.status(404).json({ mensaje: "Incidencia no encontrada" });
    }

    res.json({ mensaje: "Incidencia actualizada", incidencia });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = { crearIncidencia, getIncidencias, actualizarIncidencia };

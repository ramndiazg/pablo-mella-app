const Assembly = require("../models/Assembly");
const Vote = require("../models/Vote");

// @desc    Crear asamblea
// @route   POST /api/asambleas
// @access  Private/Admin
const crearAsamblea = async (req, res) => {
  try {
    const { titulo, fecha, hora, lugar, agenda } = req.body;

    if (!titulo || !fecha || !hora || !lugar || !agenda) {
      return res
        .status(400)
        .json({ mensaje: "Todos los campos son requeridos" });
    }

    const asamblea = await Assembly.create({
      titulo,
      fecha,
      hora,
      lugar,
      agenda,
      creadoPor: req.user._id,
    });

    res.status(201).json({ mensaje: "Asamblea creada exitosamente", asamblea });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener todas las asambleas
// @route   GET /api/asambleas
// @access  Private
const getAsambleas = async (req, res) => {
  try {
    const asambleas = await Assembly.find()
      .populate("creadoPor", "nombre")
      .sort({ fecha: -1 });

    res.json(asambleas);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener una asamblea con sus votaciones
// @route   GET /api/asambleas/:id
// @access  Private
const getAsamblea = async (req, res) => {
  try {
    const asamblea = await Assembly.findById(req.params.id).populate(
      "creadoPor",
      "nombre",
    );

    if (!asamblea) {
      return res.status(404).json({ mensaje: "Asamblea no encontrada" });
    }

    const votaciones = await Vote.find({ asambleaId: asamblea._id }).populate(
      "creadoPor",
      "nombre",
    );

    res.json({ asamblea, votaciones });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Subir acta de asamblea
// @route   PUT /api/asambleas/:id/acta
// @access  Private/Admin
const subirActa = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ mensaje: "El archivo del acta es requerido" });
    }

    const asamblea = await Assembly.findByIdAndUpdate(
      req.params.id,
      { actaUrl: req.file.path },
      { new: true },
    );

    if (!asamblea) {
      return res.status(404).json({ mensaje: "Asamblea no encontrada" });
    }

    res.json({ mensaje: "Acta subida correctamente", asamblea });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = { crearAsamblea, getAsambleas, getAsamblea, subirActa };

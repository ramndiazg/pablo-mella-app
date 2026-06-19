const Announcement = require("../models/Announcement");

// @desc    Crear anuncio o alerta
// @route   POST /api/anuncios
// @access  Private/Admin
const crearAnuncio = async (req, res) => {
  try {
    const { titulo, contenido, tipo } = req.body;

    if (!titulo || !contenido) {
      return res
        .status(400)
        .json({ mensaje: "Título y contenido son requeridos" });
    }

    const anuncio = await Announcement.create({
      titulo,
      contenido,
      tipo: tipo || "normal",
      creadoPor: req.user._id,
    });

    res.status(201).json({ mensaje: "Anuncio creado exitosamente", anuncio });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener todos los anuncios activos
// @route   GET /api/anuncios
// @access  Private
const getAnuncios = async (req, res) => {
  try {
    const anuncios = await Announcement.find({ activo: true })
      .populate("creadoPor", "nombre")
      .sort({ createdAt: -1 });

    res.json(anuncios);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener alertas de emergencia activas
// @route   GET /api/anuncios/emergencias
// @access  Private
const getEmergencias = async (req, res) => {
  try {
    const emergencias = await Announcement.find({
      tipo: "emergencia",
      activo: true,
    })
      .populate("creadoPor", "nombre")
      .sort({ createdAt: -1 });

    res.json(emergencias);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Desactivar anuncio o alerta
// @route   PUT /api/anuncios/:id/desactivar
// @access  Private/Admin
const desactivarAnuncio = async (req, res) => {
  try {
    const anuncio = await Announcement.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true },
    );

    if (!anuncio) {
      return res.status(404).json({ mensaje: "Anuncio no encontrado" });
    }

    res.json({ mensaje: "Anuncio desactivado", anuncio });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Eliminar anuncio
// @route   DELETE /api/anuncios/:id
// @access  Private/Admin
const eliminarAnuncio = async (req, res) => {
  try {
    const anuncio = await Announcement.findByIdAndDelete(req.params.id);

    if (!anuncio) {
      return res.status(404).json({ mensaje: "Anuncio no encontrado" });
    }

    res.json({ mensaje: "Anuncio eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = {
  crearAnuncio,
  getAnuncios,
  getEmergencias,
  desactivarAnuncio,
  eliminarAnuncio,
};

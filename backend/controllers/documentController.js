const Document = require("../models/Document");

// @desc    Subir documento
// @route   POST /api/documentos
// @access  Private/Admin
const subirDocumento = async (req, res) => {
  try {
    const { titulo, descripcion, tipo } = req.body;

    if (!titulo || !tipo) {
      return res.status(400).json({ mensaje: "Título y tipo son requeridos" });
    }

    if (!req.file) {
      return res.status(400).json({ mensaje: "El archivo es requerido" });
    }

    const documento = await Document.create({
      titulo,
      descripcion: descripcion || null,
      tipo,
      url: req.file.path,
      subidoPor: req.user._id,
    });

    res
      .status(201)
      .json({ mensaje: "Documento subido exitosamente", documento });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener todos los documentos
// @route   GET /api/documentos
// @access  Private
const getDocumentos = async (req, res) => {
  try {
    const { tipo } = req.query;
    const filtro = tipo ? { tipo } : {};

    const documentos = await Document.find(filtro)
      .populate("subidoPor", "nombre")
      .sort({ createdAt: -1 });

    res.json(documentos);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Eliminar documento
// @route   DELETE /api/documentos/:id
// @access  Private/Admin
const eliminarDocumento = async (req, res) => {
  try {
    const documento = await Document.findByIdAndDelete(req.params.id);

    if (!documento) {
      return res.status(404).json({ mensaje: "Documento no encontrado" });
    }

    res.json({ mensaje: "Documento eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = { subirDocumento, getDocumentos, eliminarDocumento };

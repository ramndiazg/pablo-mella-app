const Fine = require("../models/Fine");
const Apartment = require("../models/Apartment");

// @desc    Crear multa
// @route   POST /api/multas
// @access  Private/Admin
const crearMulta = async (req, res) => {
  try {
    const { apartamentoId, descripcion, monto } = req.body;

    if (!apartamentoId || !descripcion || !monto) {
      return res.status(400).json({ mensaje: "Faltan campos requeridos" });
    }

    const apartamento = await Apartment.findById(apartamentoId).populate(
      "residenteActualId",
      "_id",
    );

    if (!apartamento) {
      return res.status(404).json({ mensaje: "Apartamento no encontrado" });
    }

    if (!apartamento.residenteActualId) {
      return res
        .status(400)
        .json({ mensaje: "El apartamento no tiene residente asignado" });
    }

    const multa = await Fine.create({
      apartamentoId,
      residenteId: apartamento.residenteActualId._id,
      descripcion,
      monto,
      creadoPor: req.user._id,
    });

    res.status(201).json({ mensaje: "Multa creada exitosamente", multa });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener todas las multas
// @route   GET /api/multas
// @access  Private/Admin
const getMultas = async (req, res) => {
  try {
    const { estado } = req.query;
    const filtro = estado ? { estado } : {};

    const multas = await Fine.find(filtro)
      .populate("residenteId", "nombre email telefono")
      .populate({
        path: "apartamentoId",
        populate: { path: "edificioId", select: "numero nombre" },
      })
      .populate("creadoPor", "nombre")
      .sort({ createdAt: -1 });

    res.json(multas);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener mis multas (residente)
// @route   GET /api/multas/mis-multas
// @access  Private
const getMisMultas = async (req, res) => {
  try {
    const multas = await Fine.find({ residenteId: req.user._id })
      .populate("creadoPor", "nombre")
      .sort({ createdAt: -1 });

    res.json(multas);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Pagar multa (residente sube comprobante)
// @route   PUT /api/multas/:id/pagar
// @access  Private
const pagarMulta = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: "El comprobante es obligatorio" });
    }

    const multa = await Fine.findById(req.params.id);

    if (!multa) {
      return res.status(404).json({ mensaje: "Multa no encontrada" });
    }

    if (multa.estado !== "pendiente") {
      return res
        .status(400)
        .json({ mensaje: "Esta multa ya fue pagada o anulada" });
    }

    multa.comprobantePago = req.file.path;
    multa.estado = "pagada";
    multa.fechaPagada = new Date();
    await multa.save();

    res.json({ mensaje: "Multa pagada correctamente", multa });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Anular multa
// @route   PUT /api/multas/:id/anular
// @access  Private/Admin
const anularMulta = async (req, res) => {
  try {
    const multa = await Fine.findByIdAndUpdate(
      req.params.id,
      { estado: "anulada" },
      { new: true },
    );

    if (!multa) {
      return res.status(404).json({ mensaje: "Multa no encontrada" });
    }

    res.json({ mensaje: "Multa anulada correctamente", multa });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = {
  crearMulta,
  getMultas,
  getMisMultas,
  pagarMulta,
  anularMulta,
};

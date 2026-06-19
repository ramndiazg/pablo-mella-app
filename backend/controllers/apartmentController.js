const Apartment = require("../models/Apartment");
const User = require("../models/User");

// @desc    Obtener apartamentos por edificio
// @route   GET /api/apartamentos/edificio/:edificioId
// @access  Private
const getApartamentosPorEdificio = async (req, res) => {
  try {
    const apartamentos = await Apartment.find({
      edificioId: req.params.edificioId,
      activo: true,
    })
      .populate("residenteActualId", "nombre email telefono")
      .sort({ numero: 1 });

    res.json(apartamentos);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener un apartamento
// @route   GET /api/apartamentos/:id
// @access  Private
const getApartamento = async (req, res) => {
  try {
    const apartamento = await Apartment.findById(req.params.id)
      .populate("edificioId")
      .populate("residenteActualId", "nombre email telefono rol");

    if (!apartamento) {
      return res.status(404).json({ mensaje: "Apartamento no encontrado" });
    }

    res.json(apartamento);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Asignar residente a apartamento
// @route   PUT /api/apartamentos/:id/asignar-residente
// @access  Private/Admin
const asignarResidente = async (req, res) => {
  try {
    const { residenteId } = req.body;

    if (!residenteId) {
      return res.status(400).json({ mensaje: "residenteId es requerido" });
    }

    const apartamento = await Apartment.findById(req.params.id);
    if (!apartamento) {
      return res.status(404).json({ mensaje: "Apartamento no encontrado" });
    }

    const residente = await User.findById(residenteId);
    if (!residente) {
      return res.status(404).json({ mensaje: "Residente no encontrado" });
    }

    // Desvincula el apartamento anterior del residente si tenía uno
    if (residente.apartamentoId) {
      await Apartment.findByIdAndUpdate(residente.apartamentoId, {
        residenteActualId: null,
      });
    }

    // Asigna el residente al apartamento
    apartamento.residenteActualId = residenteId;
    await apartamento.save();

    // Actualiza el apartamento en el usuario
    residente.apartamentoId = apartamento._id;
    await residente.save();

    const apartamentoActualizado = await Apartment.findById(apartamento._id)
      .populate("edificioId")
      .populate("residenteActualId", "nombre email telefono");

    res.json({
      mensaje: "Residente asignado correctamente",
      apartamento: apartamentoActualizado,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Desvincula residente de apartamento
// @route   PUT /api/apartamentos/:id/desvincular-residente
// @access  Private/Admin
const desvincularResidente = async (req, res) => {
  try {
    const apartamento = await Apartment.findById(req.params.id);
    if (!apartamento) {
      return res.status(404).json({ mensaje: "Apartamento no encontrado" });
    }

    if (!apartamento.residenteActualId) {
      return res
        .status(400)
        .json({ mensaje: "El apartamento no tiene residente asignado" });
    }

    // Desactiva el usuario
    await User.findByIdAndUpdate(apartamento.residenteActualId, {
      activo: false,
      apartamentoId: null,
    });

    // Libera el apartamento
    apartamento.residenteActualId = null;
    await apartamento.save();

    res.json({ mensaje: "Residente desvinculado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener todos los apartamentos sin residente
// @route   GET /api/apartamentos/disponibles
// @access  Private/Admin
const getApartamentosDisponibles = async (req, res) => {
  try {
    const apartamentos = await Apartment.find({
      residenteActualId: null,
      activo: true,
    })
      .populate("edificioId", "numero nombre")
      .sort({ numero: 1 });

    res.json(apartamentos);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = {
  getApartamentosPorEdificio,
  getApartamento,
  asignarResidente,
  desvincularResidente,
  getApartamentosDisponibles,
};

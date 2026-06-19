const Building = require("../models/Building");
const Apartment = require("../models/Apartment");

// @desc    Crear edificio
// @route   POST /api/edificios
// @access  Private/Admin
const crearEdificio = async (req, res) => {
  try {
    const { numero, nombre, aptasPorPiso } = req.body;

    if (!numero || !nombre || !aptasPorPiso) {
      return res
        .status(400)
        .json({ mensaje: "Todos los campos son requeridos" });
    }

    const edificioExiste = await Building.findOne({ numero });
    if (edificioExiste) {
      return res
        .status(400)
        .json({ mensaje: `El edificio ${numero} ya existe` });
    }

    const edificio = await Building.create({
      numero,
      nombre,
      aptasPorPiso,
      totalPisos: 4,
    });

    // Crear apartamentos automáticamente
    const apartamentos = [];
    for (let piso = 1; piso <= 4; piso++) {
      for (let apto = 1; apto <= aptasPorPiso; apto++) {
        apartamentos.push({
          edificioId: edificio._id,
          numero: `${piso}0${apto}`,
          piso,
        });
      }
    }

    await Apartment.insertMany(apartamentos);

    res.status(201).json({
      mensaje: `Edificio ${numero} creado con ${apartamentos.length} apartamentos`,
      edificio,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener todos los edificios
// @route   GET /api/edificios
// @access  Private
const getEdificios = async (req, res) => {
  try {
    const edificios = await Building.find({ activo: true }).sort({ numero: 1 });
    res.json(edificios);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener un edificio con sus apartamentos
// @route   GET /api/edificios/:id
// @access  Private
const getEdificio = async (req, res) => {
  try {
    const edificio = await Building.findById(req.params.id);

    if (!edificio) {
      return res.status(404).json({ mensaje: "Edificio no encontrado" });
    }

    const apartamentos = await Apartment.find({
      edificioId: edificio._id,
      activo: true,
    })
      .populate("residenteActualId", "nombre email telefono rol")
      .sort({ numero: 1 });

    res.json({ edificio, apartamentos });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Actualizar edificio
// @route   PUT /api/edificios/:id
// @access  Private/Admin
const actualizarEdificio = async (req, res) => {
  try {
    const edificio = await Building.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!edificio) {
      return res.status(404).json({ mensaje: "Edificio no encontrado" });
    }

    res.json({ mensaje: "Edificio actualizado", edificio });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = {
  crearEdificio,
  getEdificios,
  getEdificio,
  actualizarEdificio,
};

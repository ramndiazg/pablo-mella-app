const Vote = require("../models/Vote");
const Assembly = require("../models/Assembly");

// @desc    Crear votación
// @route   POST /api/votaciones
// @access  Private/Admin
const crearVotacion = async (req, res) => {
  try {
    const { asambleaId, pregunta, opciones } = req.body;

    if (!asambleaId || !pregunta) {
      return res
        .status(400)
        .json({ mensaje: "asambleaId y pregunta son requeridos" });
    }

    const asamblea = await Assembly.findById(asambleaId);
    if (!asamblea) {
      return res.status(404).json({ mensaje: "Asamblea no encontrada" });
    }

    const votacion = await Vote.create({
      asambleaId,
      pregunta,
      opciones: opciones || ["Sí", "No", "Abstención"],
      abierta: true,
      votos: [],
      creadoPor: req.user._id,
    });

    res.status(201).json({ mensaje: "Votación creada exitosamente", votacion });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Votar
// @route   POST /api/votaciones/:id/votar
// @access  Private
const votar = async (req, res) => {
  try {
    const { opcion } = req.body;

    if (!opcion) {
      return res.status(400).json({ mensaje: "La opción es requerida" });
    }

    const votacion = await Vote.findById(req.params.id);

    if (!votacion) {
      return res.status(404).json({ mensaje: "Votación no encontrada" });
    }

    if (!votacion.abierta) {
      return res.status(400).json({ mensaje: "Esta votación ya está cerrada" });
    }

    if (!votacion.opciones.includes(opcion)) {
      return res.status(400).json({
        mensaje: `Opción inválida. Opciones válidas: ${votacion.opciones.join(", ")}`,
      });
    }

    // Verificar que no haya votado antes
    const yaVoto = votacion.votos.find(
      (v) => v.residenteId.toString() === req.user._id.toString(),
    );

    if (yaVoto) {
      return res
        .status(400)
        .json({ mensaje: "Ya has votado en esta votación" });
    }

    votacion.votos.push({
      residenteId: req.user._id,
      opcion,
      votadoEn: new Date(),
    });

    await votacion.save();

    res.json({ mensaje: "Voto registrado exitosamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Cerrar votación y ver resultados
// @route   PUT /api/votaciones/:id/cerrar
// @access  Private/Admin
const cerrarVotacion = async (req, res) => {
  try {
    const votacion = await Vote.findById(req.params.id);

    if (!votacion) {
      return res.status(404).json({ mensaje: "Votación no encontrada" });
    }

    votacion.abierta = false;
    await votacion.save();

    // Calcular resultados
    const resultados = {};
    votacion.opciones.forEach((op) => (resultados[op] = 0));
    votacion.votos.forEach((v) => resultados[v.opcion]++);

    res.json({
      mensaje: "Votación cerrada",
      pregunta: votacion.pregunta,
      totalVotos: votacion.votos.length,
      resultados,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Ver resultados de votación
// @route   GET /api/votaciones/:id/resultados
// @access  Private
const getResultados = async (req, res) => {
  try {
    const votacion = await Vote.findById(req.params.id).populate(
      "creadoPor",
      "nombre",
    );

    if (!votacion) {
      return res.status(404).json({ mensaje: "Votación no encontrada" });
    }

    const resultados = {};
    votacion.opciones.forEach((op) => (resultados[op] = 0));
    votacion.votos.forEach((v) => resultados[v.opcion]++);

    // Verificar si el usuario ya votó
    const yaVoto = votacion.votos.find(
      (v) => v.residenteId.toString() === req.user._id.toString(),
    );

    res.json({
      votacion: {
        _id: votacion._id,
        pregunta: votacion.pregunta,
        opciones: votacion.opciones,
        abierta: votacion.abierta,
        creadoPor: votacion.creadoPor,
      },
      totalVotos: votacion.votos.length,
      resultados,
      yaVote: !!yaVoto,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = { crearVotacion, votar, cerrarVotacion, getResultados };

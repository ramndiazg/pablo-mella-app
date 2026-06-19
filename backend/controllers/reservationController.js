const Reservation = require("../models/Reservation");
const Payment = require("../models/Payment");
const Fine = require("../models/Fine");
const Fee = require("../models/Fee");

// Función interna para verificar morosidad
const verificarMorosidad = async (apartamentoId) => {
  const ultimasCuotas = await Fee.find({ tipo: "mensual" })
    .sort({ anio: -1, mes: -1 })
    .limit(3);

  let mesesDeuda = 0;
  for (const cuota of ultimasCuotas) {
    const pago = await Payment.findOne({
      cuotaId: cuota._id,
      apartamentoId,
      estado: "aprobado",
    });
    if (!pago) mesesDeuda++;
  }

  const multasPendientes = await Fine.countDocuments({
    apartamentoId,
    estado: "pendiente",
  });

  return {
    esMoroso: mesesDeuda >= 2 || multasPendientes > 0,
    mesesDeuda,
    multasPendientes,
  };
};

// @desc    Crear reserva
// @route   POST /api/reservas
// @access  Private
const crearReserva = async (req, res) => {
  try {
    const { espacio, fecha, horaInicio, horaFin, descripcion } = req.body;

    if (!espacio || !fecha || !horaInicio || !horaFin) {
      return res.status(400).json({ mensaje: "Faltan campos requeridos" });
    }

    if (!req.user.apartamentoId) {
      return res
        .status(400)
        .json({ mensaje: "No tienes apartamento asignado" });
    }

    // Verificar morosidad
    const { esMoroso, mesesDeuda, multasPendientes } = await verificarMorosidad(
      req.user.apartamentoId,
    );

    if (esMoroso) {
      return res.status(403).json({
        mensaje: `No puedes reservar porque tienes ${mesesDeuda} mes(es) de deuda y ${multasPendientes} multa(s) pendiente(s)`,
      });
    }

    // Verificar que no tenga reserva activa
    const reservaActiva = await Reservation.findOne({
      apartamentoId: req.user.apartamentoId,
      estado: { $in: ["pendiente", "aprobada"] },
    });

    if (reservaActiva) {
      return res.status(400).json({
        mensaje: "Ya tienes una reserva activa pendiente o aprobada",
      });
    }

    // Verificar disponibilidad del espacio en esa fecha
    const fechaReserva = new Date(fecha);
    const reservaExiste = await Reservation.findOne({
      espacio,
      fecha: fechaReserva,
      estado: { $in: ["pendiente", "aprobada"] },
    });

    if (reservaExiste) {
      return res.status(400).json({
        mensaje: `El ${espacio} ya está reservado para esa fecha`,
      });
    }

    const reserva = await Reservation.create({
      espacio,
      apartamentoId: req.user.apartamentoId,
      residenteId: req.user._id,
      fecha: fechaReserva,
      horaInicio,
      horaFin,
      descripcion: descripcion || null,
    });

    res
      .status(201)
      .json({ mensaje: "Reserva solicitada exitosamente", reserva });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener todas las reservas
// @route   GET /api/reservas
// @access  Private/Admin
const getReservas = async (req, res) => {
  try {
    const { estado, espacio } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (espacio) filtro.espacio = espacio;

    const reservas = await Reservation.find(filtro)
      .populate("residenteId", "nombre email telefono")
      .populate({
        path: "apartamentoId",
        populate: { path: "edificioId", select: "numero nombre" },
      })
      .sort({ fecha: 1 });

    res.json(reservas);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener mis reservas (residente)
// @route   GET /api/reservas/mis-reservas
// @access  Private
const getMisReservas = async (req, res) => {
  try {
    const reservas = await Reservation.find({
      residenteId: req.user._id,
    }).sort({ fecha: -1 });

    res.json(reservas);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener calendario de disponibilidad
// @route   GET /api/reservas/calendario
// @access  Private
const getCalendario = async (req, res) => {
  try {
    const { mes, anio } = req.query;

    const inicio = new Date(anio, mes - 1, 1);
    const fin = new Date(anio, mes, 0, 23, 59, 59);

    const reservas = await Reservation.find({
      fecha: { $gte: inicio, $lte: fin },
      estado: { $in: ["pendiente", "aprobada"] },
    })
      .select("espacio fecha horaInicio horaFin estado")
      .sort({ fecha: 1 });

    res.json(reservas);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Aprobar o rechazar reserva
// @route   PUT /api/reservas/:id/verificar
// @access  Private/Admin
const verificarReserva = async (req, res) => {
  try {
    const { estado, motivoRechazo } = req.body;

    if (!estado || !["aprobada", "rechazada"].includes(estado)) {
      return res
        .status(400)
        .json({ mensaje: "Estado debe ser aprobada o rechazada" });
    }

    if (estado === "rechazada" && !motivoRechazo) {
      return res
        .status(400)
        .json({ mensaje: "Debe indicar el motivo del rechazo" });
    }

    const reserva = await Reservation.findById(req.params.id);
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    if (reserva.estado !== "pendiente") {
      return res
        .status(400)
        .json({ mensaje: "Esta reserva ya fue verificada" });
    }

    reserva.estado = estado;
    reserva.motivoRechazo = estado === "rechazada" ? motivoRechazo : null;
    await reserva.save();

    res.json({
      mensaje: estado === "aprobada" ? "Reserva aprobada" : "Reserva rechazada",
      reserva,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Cancelar reserva (residente)
// @route   PUT /api/reservas/:id/cancelar
// @access  Private
const cancelarReserva = async (req, res) => {
  try {
    const reserva = await Reservation.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    if (reserva.residenteId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ mensaje: "No puedes cancelar una reserva que no es tuya" });
    }

    if (!["pendiente", "aprobada"].includes(reserva.estado)) {
      return res
        .status(400)
        .json({ mensaje: "Esta reserva no puede ser cancelada" });
    }

    reserva.estado = "cancelada";
    await reserva.save();

    res.json({ mensaje: "Reserva cancelada correctamente", reserva });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Registrar incidente post-evento
// @route   PUT /api/reservas/:id/incidente
// @access  Private/Admin
const registrarIncidente = async (req, res) => {
  try {
    const { incidente } = req.body;

    if (!incidente) {
      return res
        .status(400)
        .json({ mensaje: "La descripción del incidente es requerida" });
    }

    const reserva = await Reservation.findByIdAndUpdate(
      req.params.id,
      { incidente },
      { new: true },
    );

    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    res.json({ mensaje: "Incidente registrado", reserva });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = {
  crearReserva,
  getReservas,
  getMisReservas,
  getCalendario,
  verificarReserva,
  cancelarReserva,
  registrarIncidente,
};

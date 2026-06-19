const Payment = require("../models/Payment");
const Fee = require("../models/Fee");
const Apartment = require("../models/Apartment");
const Fine = require("../models/Fine");

// @desc    Reportar pago (residente sube comprobante)
// @route   POST /api/pagos
// @access  Private
const reportarPago = async (req, res) => {
  try {
    const { cuotaId, apartamentoId, monto } = req.body;

    if (!cuotaId || !apartamentoId || !monto) {
      return res.status(400).json({ mensaje: "Faltan campos requeridos" });
    }

    if (!req.file) {
      return res.status(400).json({ mensaje: "El comprobante es obligatorio" });
    }

    // Verificar que la cuota existe
    const cuota = await Fee.findById(cuotaId);
    if (!cuota) {
      return res.status(404).json({ mensaje: "Cuota no encontrada" });
    }

    // Verificar que el apartamento existe
    const apartamento = await Apartment.findById(apartamentoId);
    if (!apartamento) {
      return res.status(404).json({ mensaje: "Apartamento no encontrado" });
    }

    // Verificar que no haya un pago pendiente o aprobado para esta cuota/apartamento
    const pagoExiste = await Payment.findOne({
      cuotaId,
      apartamentoId,
      estado: { $in: ["pendiente", "aprobado"] },
    });

    if (pagoExiste) {
      return res.status(400).json({
        mensaje: "Ya existe un pago pendiente o aprobado para esta cuota",
      });
    }

    const pago = await Payment.create({
      cuotaId,
      apartamentoId,
      residenteId: req.user._id,
      monto,
      comprobante: req.file.path,
      estado: "pendiente",
    });

    res.status(201).json({ mensaje: "Pago reportado correctamente", pago });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener pagos pendientes de verificar
// @route   GET /api/pagos/pendientes
// @access  Private/Admin
const getPagosPendientes = async (req, res) => {
  try {
    const pagos = await Payment.find({ estado: "pendiente" })
      .populate({
        path: "apartamentoId",
        populate: { path: "edificioId", select: "numero nombre" },
      })
      .populate("residenteId", "nombre email telefono")
      .populate("cuotaId", "descripcion mes anio monto tipo")
      .sort({ createdAt: 1 });

    res.json(pagos);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Aprobar o rechazar pago
// @route   PUT /api/pagos/:id/verificar
// @access  Private/Admin
const verificarPago = async (req, res) => {
  try {
    const { estado, motivoRechazo } = req.body;

    if (!estado || !["aprobado", "rechazado"].includes(estado)) {
      return res
        .status(400)
        .json({ mensaje: "Estado debe ser aprobado o rechazado" });
    }

    if (estado === "rechazado" && !motivoRechazo) {
      return res
        .status(400)
        .json({ mensaje: "Debe indicar el motivo del rechazo" });
    }

    const pago = await Payment.findById(req.params.id);
    if (!pago) {
      return res.status(404).json({ mensaje: "Pago no encontrado" });
    }

    if (pago.estado !== "pendiente") {
      return res.status(400).json({ mensaje: "Este pago ya fue verificado" });
    }

    pago.estado = estado;
    pago.motivoRechazo = estado === "rechazado" ? motivoRechazo : null;
    pago.verificadoPor = req.user._id;
    pago.verificadoEn = new Date();
    await pago.save();

    const mensaje =
      estado === "aprobado" ? "Pago aprobado correctamente" : "Pago rechazado";

    res.json({ mensaje, pago });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener pagos de un apartamento
// @route   GET /api/pagos/apartamento/:apartamentoId
// @access  Private
const getPagosPorApartamento = async (req, res) => {
  try {
    const pagos = await Payment.find({
      apartamentoId: req.params.apartamentoId,
    })
      .populate("cuotaId", "descripcion mes anio monto tipo")
      .populate("verificadoPor", "nombre")
      .sort({ createdAt: -1 });

    res.json(pagos);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Verificar si un apartamento es moroso (debe 2+ meses)
// @route   GET /api/pagos/moroso/:apartamentoId
// @access  Private
const verificarMoroso = async (req, res) => {
  try {
    const { apartamentoId } = req.params;

    // Obtener las últimas 3 cuotas mensuales
    const ultimasCuotas = await Fee.find({ tipo: "mensual" })
      .sort({ anio: -1, mes: -1 })
      .limit(3);

    if (ultimasCuotas.length === 0) {
      return res.json({ esMoroso: false, mesesDeuda: 0 });
    }

    // Verificar cuáles no tienen pago aprobado
    let mesesDeuda = 0;
    const detalle = [];

    for (const cuota of ultimasCuotas) {
      const pago = await Payment.findOne({
        cuotaId: cuota._id,
        apartamentoId,
        estado: "aprobado",
      });

      if (!pago) {
        mesesDeuda++;
        detalle.push({
          mes: cuota.mes,
          anio: cuota.anio,
          descripcion: cuota.descripcion,
          monto: cuota.monto,
        });
      }
    }

    // Verificar multas pendientes
    const multasPendientes = await Fine.countDocuments({
      apartamentoId,
      estado: "pendiente",
    });

    const esMoroso = mesesDeuda >= 2 || multasPendientes > 0;

    res.json({
      esMoroso,
      mesesDeuda,
      multasPendientes,
      detalle,
      mensaje: esMoroso
        ? `Tiene ${mesesDeuda} mes(es) de deuda y ${multasPendientes} multa(s) pendiente(s)`
        : "Al día con sus pagos",
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener mis pagos (residente logueado)
// @route   GET /api/pagos/mispagos
// @access  Private
const getMisPagos = async (req, res) => {
  try {
    const user = req.user;

    if (!user.apartamentoId) {
      return res
        .status(400)
        .json({ mensaje: "No tienes apartamento asignado" });
    }

    const pagos = await Payment.find({ apartamentoId: user.apartamentoId })
      .populate("cuotaId", "descripcion mes anio monto tipo")
      .populate("verificadoPor", "nombre")
      .sort({ createdAt: -1 });

    // Verificar estado de morosidad
    const ultimasCuotas = await Fee.find({ tipo: "mensual" })
      .sort({ anio: -1, mes: -1 })
      .limit(3);

    let mesesDeuda = 0;
    for (const cuota of ultimasCuotas) {
      const pago = pagos.find(
        (p) =>
          p.cuotaId &&
          p.cuotaId._id.toString() === cuota._id.toString() &&
          p.estado === "aprobado",
      );
      if (!pago) mesesDeuda++;
    }

    const multasPendientes = await Fine.countDocuments({
      apartamentoId: user.apartamentoId,
      estado: "pendiente",
    });

    res.json({
      pagos,
      resumen: {
        esMoroso: mesesDeuda >= 2 || multasPendientes > 0,
        mesesDeuda,
        multasPendientes,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = {
  reportarPago,
  getPagosPendientes,
  verificarPago,
  getPagosPorApartamento,
  verificarMoroso,
  getMisPagos,
};

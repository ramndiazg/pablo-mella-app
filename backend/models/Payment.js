const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    cuotaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fee",
      required: true,
    },
    apartamentoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
    },
    residenteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    monto: {
      type: Number,
      required: true,
    },
    comprobante: {
      type: String,
      required: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "aprobado", "rechazado"],
      default: "pendiente",
    },
    motivoRechazo: {
      type: String,
      default: null,
    },
    verificadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verificadoEn: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);

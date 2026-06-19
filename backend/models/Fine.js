const mongoose = require("mongoose");

const fineSchema = new mongoose.Schema(
  {
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
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    monto: {
      type: Number,
      required: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "pagada", "anulada"],
      default: "pendiente",
    },
    comprobantePago: {
      type: String,
      default: null,
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fechaPagada: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Fine", fineSchema);

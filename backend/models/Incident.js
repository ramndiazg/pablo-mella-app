const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    anonimo: {
      type: Boolean,
      default: false,
    },
    reportadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    apartamentoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "en_proceso", "resuelto"],
      default: "pendiente",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Incident", incidentSchema);

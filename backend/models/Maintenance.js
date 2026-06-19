const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    tipo: {
      type: String,
      enum: ["electrico", "plomeria", "limpieza", "estructura", "otro"],
      required: true,
    },
    foto: {
      type: String,
      default: null,
    },
    estado: {
      type: String,
      enum: ["pendiente", "en_proceso", "resuelto"],
      default: "pendiente",
    },
    nota: {
      type: String,
      default: null,
    },
    solicitadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    apartamentoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);

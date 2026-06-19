const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    espacio: {
      type: String,
      enum: ["gazebo", "salon"],
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
    fecha: {
      type: Date,
      required: true,
    },
    horaInicio: {
      type: String,
      required: true,
    },
    horaFin: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "aprobada", "rechazada", "cancelada"],
      default: "pendiente",
    },
    motivoRechazo: {
      type: String,
      default: null,
    },
    incidente: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Reservation", reservationSchema);

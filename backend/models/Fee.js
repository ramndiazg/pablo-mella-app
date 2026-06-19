const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ["mensual", "extraordinaria"],
      required: true,
    },
    mes: {
      type: Number,
      min: 1,
      max: 12,
    },
    anio: {
      type: Number,
      required: true,
    },
    monto: {
      type: Number,
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    fechaLimite: {
      type: Date,
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Fee", feeSchema);

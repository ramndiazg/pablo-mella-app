const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema(
  {
    numero: {
      type: Number,
      required: true,
      unique: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    aptasPorPiso: {
      type: Number,
      enum: [2, 4],
      required: true,
    },
    totalPisos: {
      type: Number,
      default: 4,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Building", buildingSchema);

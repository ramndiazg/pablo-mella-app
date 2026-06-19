const mongoose = require("mongoose");

const assemblySchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    hora: {
      type: String,
      required: true,
    },
    lugar: {
      type: String,
      required: true,
      trim: true,
    },
    agenda: {
      type: String,
      required: true,
    },
    actaUrl: {
      type: String,
      default: null,
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assembly", assemblySchema);

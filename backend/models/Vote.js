const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    asambleaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assembly",
      required: true,
    },
    pregunta: {
      type: String,
      required: true,
      trim: true,
    },
    opciones: {
      type: [String],
      default: ["Sí", "No", "Abstención"],
    },
    abierta: {
      type: Boolean,
      default: true,
    },
    votos: [
      {
        residenteId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        opcion: {
          type: String,
          required: true,
        },
        votadoEn: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Vote", voteSchema);

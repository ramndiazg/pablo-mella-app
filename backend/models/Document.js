const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    tipo: {
      type: String,
      enum: ["reglamento", "acta", "circular", "otro"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    subidoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Document", documentSchema);

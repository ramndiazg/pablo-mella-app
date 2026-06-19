const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    contenido: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: ["normal", "emergencia"],
      default: "normal",
    },
    activo: {
      type: Boolean,
      default: true,
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Announcement", announcementSchema);

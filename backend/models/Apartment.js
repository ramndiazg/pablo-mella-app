const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema(
  {
    edificioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true,
    },
    numero: {
      type: String,
      required: true,
      trim: true,
    },
    piso: {
      type: Number,
      required: true,
    },
    residenteActualId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Apartment", apartmentSchema);

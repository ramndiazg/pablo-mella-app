const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      enum: ["admin", "residente"],
      default: "residente",
    },
    apartamentoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      default: null,
    },
    esDirectiva: {
      type: Boolean,
      default: false,
    },
    cargoDirectiva: {
      type: String,
      enum: ["presidente", "tesorero", "secretario", null],
      default: null,
    },
    telefono: {
      type: String,
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);

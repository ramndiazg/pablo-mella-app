const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    monto: {
      type: Number,
      required: true,
    },
    categoria: {
      type: String,
      enum: [
        "electricidad",
        "plomeria",
        "limpieza",
        "materiales",
        "jardineria",
        "seguridad",
        "otro",
      ],
      required: true,
    },
    factura: {
      type: String,
      default: null,
    },
    fecha: {
      type: Date,
      required: true,
    },
    registradoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expense", expenseSchema);

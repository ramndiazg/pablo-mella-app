const express = require("express");
const router = express.Router();
const {
  crearEdificio,
  getEdificios,
  getEdificio,
  actualizarEdificio,
} = require("../controllers/buildingController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", protect, getEdificios);
router.get("/:id", protect, getEdificio);
router.post("/", protect, adminOnly, crearEdificio);
router.put("/:id", protect, adminOnly, actualizarEdificio);

module.exports = router;

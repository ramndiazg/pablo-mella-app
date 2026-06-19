const express = require("express");
const router = express.Router();
const {
  crearAsamblea,
  getAsambleas,
  getAsamblea,
  subirActa,
} = require("../controllers/assemblyController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", protect, getAsambleas);
router.get("/:id", protect, getAsamblea);
router.post("/", protect, adminOnly, crearAsamblea);
router.put("/:id/acta", protect, adminOnly, upload.single("acta"), subirActa);

module.exports = router;

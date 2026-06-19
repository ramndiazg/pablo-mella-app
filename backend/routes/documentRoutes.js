const express = require("express");
const router = express.Router();
const {
  subirDocumento,
  getDocumentos,
  eliminarDocumento,
} = require("../controllers/documentController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", protect, getDocumentos);
router.post("/", protect, adminOnly, upload.single("archivo"), subirDocumento);
router.delete("/:id", protect, adminOnly, eliminarDocumento);

module.exports = router;

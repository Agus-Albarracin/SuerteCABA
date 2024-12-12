const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nombre del archivo
  }
});

// Filtros para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png)'));
  }
};

// Inicializa Multer con la configuración de almacenamiento y filtro de archivos
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Límite de 5MB
  fileFilter: fileFilter
});

// Ruta de carga de archivos
router.post('/', upload.single('image'), (req, res) => {
  try {
    res.status(200).json({
      message: 'Imagen subida correctamente',
      file: req.file
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
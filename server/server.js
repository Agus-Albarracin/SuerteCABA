const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const http = require('http');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const { initializeSocket, getIo } = require('./Socket');

const app = express();
const server = http.createServer(app);

initializeSocket(server);

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'user-login'],
  }));
  app.use(express.json());

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Rutas de subida y eliminación de archivos
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files were uploaded.' });
  }
  const files = req.files.map(file => ({ filename: file.filename }));
  res.json({ files });
});

app.delete('/api/delete/:filename', (req, res) => {
  const fs = require('fs');
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).json({ error: 'Error deleting file' });
    }
    res.json({ message: 'File deleted successfully' });
  });
});

app.get('/api/images', (req, res) => {
  const fs = require('fs');
  const directoryPath = path.join(__dirname, 'uploads');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan directory');
    }
    const imagePaths = files.map(file => `https://skarybet.com/uploads/${file}`);
    res.json(imagePaths);
  });
});

// Configuración de MongoDB
const username = encodeURIComponent(process.env.DB_USERNAME);
const password = encodeURIComponent(process.env.DB_PASSWORD);
const dbName = process.env.DB_NAME;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;

const uri = `mongodb://${username}:${password}@${host}:${port}/${dbName}?authSource=dbskary`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err.message));

app.use('/api', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'client/dist', 'index.html'));
});


server.listen(3000, () => {
  console.log('Server is running on port 3000');
});


const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('gallery'));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'gallery/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Basic auth middleware
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  const [username, password] = Buffer.from(auth?.split(' ')[1] || '', 'base64').toString().split(':');
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

// Routes
app.post('/admin/upload', authenticate, upload.single('image'), (req, res) => {
  res.json({ message: 'Image uploaded successfully!' });
});

app.get('/api/gallery', (req, res) => {
  fs.readdir('./gallery', (err, files) => {
    if (err) return res.status(500).send('Error loading gallery');
    res.json(files.map(file => '/' + file));
  });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Contact form received: ${name} (${email}) - ${message}`);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: '/public/uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}${ext}`;

    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Solo se aceptan archivos de imagen'), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // <---- 5MB
  },
});

module.exports = upload;
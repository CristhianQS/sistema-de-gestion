const fs = require('fs');
const path = require('path');

const UploadController = {
  uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      res.status(201).json({
        url: imageUrl,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Upload failed' });
    }
  },

  deleteImage(req, res) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'Image URL required' });
      }

      const filename = url.split('/uploads/')[1];

      if (!filename) {
        return res.status(400).json({ error: 'Invalid image URL' });
      }

      const filePath = path.join('uploads', filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      fs.unlinkSync(filePath);

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Delete failed' });
    }
  },
};

module.exports = UploadController;
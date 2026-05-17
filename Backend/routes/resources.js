const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');
const User = require('../models/User');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|ppt|pptx|jpeg|jpg|png/;
  const allowedMimetypes = /pdf|ms-powerpoint|presentation|jpeg|jpg|png/;
  
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, PPT, and Image files are allowed!'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('file');

// Wrapper middleware to handle Multer errors
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Get resources for a room
router.get('/:roomId', async (req, res) => {
  try {
    const resources = await Resource.find({ roomId: req.params.roomId }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources', error: error.message });
  }
});

// Upload a new resource
router.post('/upload', uploadMiddleware, async (req, res) => {
  try {
    const { title, topic, roomId, uploadedBy } = req.body;
    
    if (!req.file || !title || !topic || !roomId || !uploadedBy) {
      return res.status(400).json({ message: 'Missing required fields or file' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const newResource = new Resource({
      title,
      topic,
      roomId,
      uploadedBy,
      fileUrl,
      fileName: req.file.originalname
    });

    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading resource', error: error.message });
  }
});

// Vote on a resource
router.post('/:id/vote', async (req, res) => {
  try {
    const { userId, voteType } = req.body; // voteType should be 'upvote' or 'downvote'
    
    if (!userId || !voteType) {
      return res.status(400).json({ message: 'Missing user ID or vote type' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const wasUpvoted = resource.upvotes.includes(userId);
    const wasDownvoted = resource.downvotes.includes(userId);

    // Remove user from both arrays first to prevent double voting
    resource.upvotes = resource.upvotes.filter(id => id !== userId);
    resource.downvotes = resource.downvotes.filter(id => id !== userId);

    let xpChange = 0;
    if (wasUpvoted) xpChange -= 10;
    if (wasDownvoted) xpChange += 5;

    if (voteType === 'upvote') {
      resource.upvotes.push(userId);
      xpChange += 10;
    } else if (voteType === 'downvote') {
      resource.downvotes.push(userId);
      xpChange -= 5;
    }

    const updatedResource = await resource.save();

    // Update uploader's XP if it changed
    if (xpChange !== 0) {
      await User.findOneAndUpdate(
        { username: updatedResource.uploadedBy },
        { $inc: { xp: xpChange } }
      );
    }

    res.json(updatedResource);
  } catch (error) {
    res.status(500).json({ message: 'Error voting', error: error.message });
  }
});

// Delete a resource
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Optional: delete file from filesystem
    const filePath = path.join(__dirname, '..', resource.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting resource', error: error.message });
  }
});

module.exports = router;

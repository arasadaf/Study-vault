const express = require('express');
const router = express.Router();
const Doubt = require('../models/Doubt');
const User = require('../models/User');

// Get all doubts for a room
router.get('/:roomId', async (req, res) => {
  try {
    const doubts = await Doubt.find({ roomId: req.params.roomId }).sort({ createdAt: -1 });
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doubts', error: error.message });
  }
});

// Create a new doubt
router.post('/', async (req, res) => {
  try {
    const { question, description, roomId, askedBy, bountyPoints } = req.body;
    
    if (!question || !roomId || !askedBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newDoubt = new Doubt({
      question,
      description,
      roomId,
      askedBy,
      bountyPoints: bountyPoints || 0
    });

    const savedDoubt = await newDoubt.save();
    res.status(201).json(savedDoubt);
  } catch (error) {
    res.status(500).json({ message: 'Error creating doubt', error: error.message });
  }
});

// Add an answer to a doubt
router.post('/:id/answers', async (req, res) => {
  try {
    const { answer, answeredBy } = req.body;
    
    if (!answer || !answeredBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    doubt.answers.push({ answer, answeredBy });
    const updatedDoubt = await doubt.save();

    // Award base XP for answering
    await User.findOneAndUpdate(
      { username: answeredBy },
      { $inc: { xp: 5 } }
    );

    res.json(updatedDoubt);
  } catch (error) {
    res.status(500).json({ message: 'Error adding answer', error: error.message });
  }
});

// Mark doubt as resolved
router.patch('/:id/resolve', async (req, res) => {
  try {
    const doubt = await Doubt.findByIdAndUpdate(
      req.params.id,
      { isResolved: true },
      { new: true }
    );
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }
    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Error resolving doubt', error: error.message });
  }
});

// Accept an answer and award bounty
router.patch('/:id/answers/:answerId/accept', async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    const answer = doubt.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (doubt.isResolved) {
      return res.status(400).json({ message: 'Doubt is already resolved' });
    }

    answer.isAccepted = true;
    doubt.isResolved = true;

    const updatedDoubt = await doubt.save();

    // Award bounty + bonus to the user who answered
    const totalAward = doubt.bountyPoints + 50;
    await User.findOneAndUpdate(
      { username: answer.answeredBy },
      { $inc: { xp: totalAward } }
    );

    res.json(updatedDoubt);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting answer', error: error.message });
  }
});

module.exports = router;

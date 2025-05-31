import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
// Get users with whom the current user has chats or can start one
router.get('/users', authenticate, async (req, res) => {
  try {
    const currentUserId = req.userId;

    // Find all messages where current user is part of roomId
    const messages = await Message.find({
      roomId: { $regex: currentUserId }
    });

    // Extract other user IDs from roomId (format assumed: user1_user2)
    const userIds = new Set();

    messages.forEach((msg) => {
      const [user1, user2] = msg.roomId.split('_');
      if (user1 !== currentUserId) userIds.add(user1);
      if (user2 !== currentUserId) userIds.add(user2);
    });

    // Fetch chatted users (those who have messaged with current user)
    const chattedUsers = await User.find({ _id: { $in: [...userIds] } })
      .select('_id name username email'); // include username field if exists

    // Fetch all other users except current user
    const allUsers = await User.find({ _id: { $ne: currentUserId } })
      .select('_id name username email');

    res.json({
      chattedUsers,
      allUsers,
    });
  } catch (err) {
    console.error('Error fetching users for chat:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/messages/:otherId', authenticate, async (req, res) => {
  const userId = req.userId;
  const { otherId } = req.params;
  const roomId = [userId, otherId].sort().join('_');

  try {
    let room = await Message.findOne({ roomId });

    if (!room) {
      room = await Message.create({ roomId, messages: [] });
    }

    res.json(room.messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



export default router;

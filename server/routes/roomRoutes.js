import express from 'express';
import Room from '../models/Room.js';

const router = express.Router();

// Create or get room between two users
router.post('/room', async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;

    const users = [userId1, userId2].sort(); // enforce consistent order

    let room = await Room.findOne({ users });

    if (!room) {
      room = await Room.create({ users });
    }

    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all chat partners for a user
router.get('/room/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const rooms = await Room.find({ users: userId }).populate('users', 'name email');

    const chatList = rooms.map((room) => {
      const otherUser = room.users.find((u) => u._id.toString() !== userId);
      return {
        roomId: room._id,
        user: otherUser,
      };
    });

    res.status(200).json(chatList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

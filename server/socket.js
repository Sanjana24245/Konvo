
import jwt from 'jsonwebtoken';
import Message from './models/Message.js';

const users = {}; // userId => socket.id map

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('login',async ({ token }) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
   


        users[userId] = socket.id;
        socket.userId = userId;
      

        console.log(`User logged in: ${userId}`);

      } catch (err) {
        console.error('Login failed:', err.message);
      }
    });



    socket.on('sendMessage', async ({ receiverId, content, file }) => {
      const senderId = socket.userId;
    
      // Check if senderId, receiverId, and at least one of content or file is present
      if (!senderId || !receiverId || (!content && !file)) {
        console.log('Message content is empty or invalid');
        return;
      }
    
      console.log('Message received:', content); // Debugging message
    
      const roomId = [senderId, receiverId].sort().join('_');
    
      const newMessage = {
        senderId,
        receiverId,
         
        message: content || '', // Use content if available, otherwise an empty string
        file: file || null, // Include file if available
        timestamp: new Date(),
      };
    
      // Save message in DB
      await Message.findOneAndUpdate(
        { roomId },
        { $push: { messages: newMessage } },
        { upsert: true }
      );
    
      // Emit message to both sender and receiver
      [senderId, receiverId].forEach((id) => {
        const sockId = users[id];
        if (sockId) {
          io.to(sockId).emit('receive_message', newMessage);
        }
      });
    });
    
    socket.on('typing', ({ toUserId, username }) => {
      const receiverSocket = users[toUserId];
      if (receiverSocket) {
        io.to(receiverSocket).emit('user_typing', {
          fromUserId: socket.userId,
          username: username || socket.username,
        });
      }
    });

     // ---- Video/Voice Call Signaling ----

    // User A calls User B, send offer SDP to B
    socket.on('call_user', ({ toUserId, fromUserId, fromUsername, roomID }) => {
    // Find socket ID of callee (toUserId) — implement your own lookup logic here
    const calleeSocketId = users[toUserId];


    if (calleeSocketId) {
      io.to(calleeSocketId).emit('incoming_call', {
        fromUserId,
        fromUsername,
        roomID,
      });
    }
  });

    // User B accepts call, send answer SDP to A
   socket.on('accept_call', ({ toUserId, fromUserId, roomID }) => {
const callerSocketId = users[toUserId];


  if (callerSocketId) {
    io.to(callerSocketId).emit('call_accepted', { roomID });
  }
});

socket.on('reject_call', ({ toUserId, fromUserId }) => {
  const callerSocketId = users[toUserId];

  if (callerSocketId) {
    io.to(callerSocketId).emit('call_rejected', { fromUserId });
  }
});


    // Exchange ICE candidates
    socket.on('ice-candidate', ({ to, candidate }) => {
      const toSocketId = users[to];
      if (toSocketId) {
        io.to(toSocketId).emit('ice-candidate', candidate);
      }
    });

    // End call notification
    socket.on('end-call', ({ to }) => {
      const toSocketId = users[to];
      if (toSocketId) {
        io.to(toSocketId).emit('call-ended');
      }
    });

    // ---- End of Call Signaling ----

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
      for (const [uid, sid] of Object.entries(users)) {
        if (sid === socket.id) {
          delete users[uid];
          break;
        }
      }
    });
  });
};

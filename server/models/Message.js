// models/Message.js
import mongoose from 'mongoose';

const singleMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  file: { // Add this field to store file information
    url: { type: String, required: false },
    name: { type: String, required: false },
    type: { type: String, required: false },
  },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },


  
});

const messageSchema = new mongoose.Schema({
  roomId: {
  type: String,
  required: true,
},

  messages: [singleMessageSchema],
});

const Message = mongoose.model('Message', messageSchema);
export default Message;


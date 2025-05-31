import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure a room is unique for a pair of users (sorted to prevent duplicates)
roomSchema.index({ users: 1 }, { unique: true });

// Middleware to sort user IDs before saving
roomSchema.pre('save', function (next) {
  this.users.sort(); // Sort user IDs to enforce uniqueness for any pair
  next();
});

const Room = mongoose.model('Room', roomSchema);

export default Room;

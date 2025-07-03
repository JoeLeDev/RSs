const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  firebaseUid: String,
  role: {
    type: String,
    default: "user"
  },
  imageUrl: {
    type: String,
    default: ""
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

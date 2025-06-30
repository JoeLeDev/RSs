const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  meetingDay: { type: String, required: true },
  meetingLocation: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  roles: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["pilote", "membre"], default: "membre" }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);
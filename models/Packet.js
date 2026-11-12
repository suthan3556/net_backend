
const mongoose = require("mongoose");

const packetSchema = new mongoose.Schema({
  sourceIP: {
    type: String,
    required: true
  },
  destinationIP: {
    type: String,
    required: true
  },
  protocol: {
    type: String,
    required: true
  },
  port: {
    type: mongoose.Schema.Types.Mixed,
    default: ""
  },
  classification: {
    type: String,
    default: "UNKNOWN"
  },
  status: {
    type: String,
    enum: ["Valid", "Invalid"],
    required: true
  },
  errors: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports =
  mongoose.models.Packet ||
  mongoose.model("Packet", packetSchema);

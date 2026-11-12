
const express = require("express");
const router = express.Router();

const Packet = require("../models/Packet");

const { validatePacket } =
  require("../utils/regexValidator");

const { classifyProtocol } =
  require("../utils/automataClassifier");

// Add and validate packet
router.post("/", async (req, res) => {
  try {
    const packet = req.body;

    const result = validatePacket(packet);

    const classification =
      classifyProtocol(packet.protocol);

    const savedPacket = await Packet.create({
      ...packet,
      classification,
      status: result.valid ? "Valid" : "Invalid",
      errors: result.errors
    });

    res.status(201).json(savedPacket);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Get all packets
router.get("/", async (req, res) => {
  try {
    const packets = await Packet.find()
      .sort({ createdAt: -1 });

    res.json(packets);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Search packets
router.get("/search", async (req, res) => {
  try {
    const search = req.query.q || "";

    const packets = await Packet.find({
      $or: [
        { sourceIP: { $regex: search, $options: "i" } },
        { destinationIP: { $regex: search, $options: "i" } },
        { protocol: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        { classification: { $regex: search, $options: "i" } }
      ]
    }).sort({ createdAt: -1 });

    res.json(packets);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Delete packet
router.delete("/:id", async (req, res) => {
  try {
    await Packet.findByIdAndDelete(req.params.id);

    res.json({ message: "Packet deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;

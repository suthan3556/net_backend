
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Import Packet Model
const Packet = require("./models/Packet");

// Import Validation Functions
const { validatePacket } = require("./utils/regexValidator");
const { classifyProtocol } = require("./utils/automataClassifier");

// Home Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Network Packet Validator API is Running!",
    server: "Connected",
    database:
      mongoose.connection.readyState === 1
        ? "MongoDB Atlas Connected"
        : "MongoDB Not Connected",
    databaseName: mongoose.connection.name || null
  });
});

// Database Status Route
app.get("/db-status", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    database: connected ? "Connected" : "Disconnected",
    databaseName: mongoose.connection.name || null,
    host: mongoose.connection.host || null
  });
});

// Get All Packets
app.get("/api/packets", async (req, res) => {
  try {
    const packets = await Packet.find().sort({
      createdAt: -1
    });

    res.status(200).json(packets);

  } catch (err) {
    res.status(500).json({
      message: "Could not fetch packets",
      error: err.message
    });
  }
});

// Add and Validate New Packet
app.post("/api/packets", async (req, res) => {
  try {
    const packet = req.body;

    const validation = validatePacket(packet);

    const classification = classifyProtocol(
      packet.protocol
    );

    const newPacket = await Packet.create({
      ...packet,
      classification,
      status: validation.valid ? "Valid" : "Invalid",
      errors: validation.errors
    });

    res.status(201).json({
      message: "Packet processed successfully",
      packet: newPacket,
      status: newPacket.status,
      classification: newPacket.classification,
      errors: newPacket.errors
    });

  } catch (err) {
    res.status(400).json({
      message: "Could not process packet",
      error: err.message
    });
  }
});

// Search Packets
app.get("/api/packets/search", async (req, res) => {
  try {
    const search = req.query.q || "";

    const packets = await Packet.find({
      $or: [
        { sourceIP: { $regex: search, $options: "i" } },
        { destinationIP: { $regex: search, $options: "i" } },
        { protocol: { $regex: search, $options: "i" } },
        { classification: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(packets);

  } catch (err) {
    res.status(500).json({
      message: "Search failed",
      error: err.message
    });
  }
});

// Update Packet
app.patch("/api/packets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid packet ID"
      });
    }

    const validation = validatePacket(req.body);

    const classification = classifyProtocol(
      req.body.protocol
    );

    const updatedPacket = await Packet.findByIdAndUpdate(
      id,
      {
        ...req.body,
        classification,
        status: validation.valid ? "Valid" : "Invalid",
        errors: validation.errors
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!updatedPacket) {
      return res.status(404).json({
        message: "Packet not found"
      });
    }

    res.status(200).json({
      message: "Packet updated successfully",
      packet: updatedPacket
    });

  } catch (err) {
    res.status(400).json({
      message: "Could not update packet",
      error: err.message
    });
  }
});

// Delete Packet
app.delete("/api/packets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid packet ID"
      });
    }

    const deletedPacket = await Packet.findByIdAndDelete(id);

    if (!deletedPacket) {
      return res.status(404).json({
        message: "Packet not found"
      });
    }

    res.status(200).json({
      message: "Packet deleted successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: "Could not delete packet",
      error: err.message
    });
  }
});

// MongoDB Atlas Connection
async function startServer() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(MONGO_URI);

    console.log("==================================");
    console.log("MongoDB Atlas Connected Successfully");
    console.log("Database:", mongoose.connection.name);
    console.log("==================================");

    app.listen(PORT, () => {
      console.log("==================================");
      console.log("Network Packet Validator Started");
      console.log("Server Port:", PORT);
      console.log("API Base Path: /api/packets");
      console.log("Database Status: /db-status");
      console.log("==================================");
    });

  } catch (err) {
    console.error(
      "MongoDB Atlas Connection Error:",
      err.message
    );

    process.exit(1);
  }
}

startServer();

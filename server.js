
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Network Packet Validator API Running",
    database: mongoose.connection.readyState === 1
      ? "MongoDB Atlas Connected"
      : "Database Not Connected",
    endpoints: {
      allPackets: "/api/packets",
      searchPackets: "/api/packets/search?q=TCP",
      addPacket: "POST /api/packets",
      deletePacket: "DELETE /api/packets/:id"
    }
  });
});

// Packet routes
app.use(
  "/api/packets",
  require("./routes/packetRoutes")
);

// MongoDB Atlas connection
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas Connected Successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
}

startServer();

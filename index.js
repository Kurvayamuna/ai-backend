require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // Added this import
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);

// Combined the connection and server listening safely
mongoose.connect("mongodb+srv://yamunalinux12_db_user:yamuna12@cluster0.s6caphd.mongodb.net/")
  .then(() => {
    console.log("DB Connected");
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error("Database connection error:", err));
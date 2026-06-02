require("dotenv").config();
const express = require("express");

const app = express();


const cors = require("cors");

const connectDB = require("./confiq/db");

const userRoutes = require("./routes/userRoutes");

app.use(cors());

app.use(express.json());

connectDB();

app.use("/api", userRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});


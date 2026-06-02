const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const User = require("../models/userModel");
const authMiddleware = require("../middleware/authMiddleware");


// REGISTER
router.post("/register", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User Registered Successfully",
      user
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "User Not Found",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({
      message: "Wrong Password",
    });
  }

const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

  res.json({
    token,
    user,
  });
});


// READ USERS
router.get("/users", authMiddleware, async (req, res) => {
  const users = await User.find();

  res.json(users);
});


// UPDATE USER
router.put("/users/:id", authMiddleware, async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
});


// DELETE USER
router.delete("/users/:id", authMiddleware, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);

  res.json({
    message: "User Deleted",
  });
});


// AI CHAT API
router.post("/chat", authMiddleware, async (req, res) => {

  try {

    const { message } = req.body;

    // Validation
    if (!message || message.trim() === "") {
      return res.status(400).json({
        message: "Message is required"
      });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",

        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "MERN AI Chatbot",
        },
      }
    );

    res.json({
      reply: response.data.choices[0].message.content,
    });

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.status(500).json({
      message: "AI Error",
      error: error.response?.data || error.message,
    });
  }
});
module.exports = router;

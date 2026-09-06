const mongoose = require("mongoose");

// Only ONE collection for users, as required.
// Passwords are always stored hashed (see routes/auth.js).
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true, // stored as a bcrypt hash, never plain text
    },
    avatarColor: {
      type: String,
      default: "#5865F2",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

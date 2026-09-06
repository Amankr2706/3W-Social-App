const mongoose = require("mongoose");

// Comments are embedded inside the post document (sub-schema) rather than
// living in their own collection, keeping us to the required 2 collections
// (users + posts) while still saving the username of every commenter.
const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true }, // denormalized for fast feed rendering
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true }, // denormalized so the feed doesn't need a join/populate every time

    // Either text or image must be present - both aren't mandatory (enforced in the route).
    text: { type: String, trim: true, maxlength: 2000 },
    imageUrl: { type: String, trim: true },

    // Likes store the liking user's id + username so we can show "who liked this"
    // and also easily check whether the current user has already liked a post.
    likes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        username: { type: String, required: true },
      },
    ],

    comments: [commentSchema],
  },
  { timestamps: true }
);

// Simple validation: a post must have text and/or an image.
postSchema.pre("validate", function (next) {
  if (!this.text && !this.imageUrl) {
    next(new Error("A post must contain text, an image, or both."));
  } else {
    next();
  }
});

module.exports = mongoose.model("Post", postSchema);

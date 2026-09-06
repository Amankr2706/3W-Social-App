const express = require("express");
const path = require("path");
const multer = require("multer");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

const router = express.Router();

// --- Image upload setup -----------------------------------------------
// Images are stored on local disk under /uploads and served statically
// (see server.js). Note: on Render's free tier the filesystem is ephemeral,
// so uploaded images won't survive a redeploy - fine for a demo/assignment,
// but swap this for S3/Cloudinary storage for a production app.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

// @route  POST /api/posts
// @desc   Create a post (text and/or image). Requires auth.
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { text } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || undefined;

    if (!text && !imageUrl) {
      return res.status(400).json({ message: "A post needs text, an image, or both." });
    }

    const post = await Post.create({
      author: req.user.id,
      username: req.user.username,
      text,
      imageUrl,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Could not create post.", error: err.message });
  }
});

// @route  GET /api/posts?page=1&limit=10&search=keyword&sort=recent|liked|discussed
// @desc   Public feed of all posts, paginated, with optional search and sort.
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    const { search, sort } = req.query;

    // Search matches either the post's text or the author's username, case-insensitive.
    const filter = search
      ? {
          $or: [
            { text: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // "liked" and "discussed" need the array size, which a plain .sort() on a
    // stored field can't do - $addFields computes it first, then we sort on it.
    let posts, total;
    if (sort === "liked" || sort === "discussed") {
      const countField = sort === "liked" ? "likes" : "comments";
      const pipeline = [
        { $match: filter },
        { $addFields: { _count: { $size: `$${countField}` } } },
        { $sort: { _count: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ];
      [posts, total] = await Promise.all([
        Post.aggregate(pipeline),
        Post.countDocuments(filter),
      ]);
    } else {
      [posts, total] = await Promise.all([
        Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Post.countDocuments(filter),
      ]);
    }

    res.json({
      posts,
      page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load feed.", error: err.message });
  }
});

// @route  POST /api/posts/:id/like
// @desc   Toggle a like on a post. Requires auth.
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const alreadyLiked = post.likes.some((like) => like.user.toString() === req.user.id);

    if (alreadyLiked) {
      post.likes = post.likes.filter((like) => like.user.toString() !== req.user.id);
    } else {
      post.likes.push({ user: req.user.id, username: req.user.username });
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Could not update like.", error: err.message });
  }
});

// @route  POST /api/posts/:id/comment
// @desc   Add a comment to a post. Requires auth.
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    post.comments.push({ user: req.user.id, username: req.user.username, text: text.trim() });
    await post.save();

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Could not add comment.", error: err.message });
  }
});

module.exports = router;

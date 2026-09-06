import React, { useState } from "react";
import {
  Paper,
  Box,
  Avatar,
  Typography,
  IconButton,
  Collapse,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val} ${name}${val > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const liked = post.likes.some((like) => like.user === user?.id || like.user?._id === user?.id);

  const toggleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      onUpdate(data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/comment`, { text: commentText.trim() });
      onUpdate(data);
      setCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const imageSrc = post.imageUrl?.startsWith("http") ? post.imageUrl : `${API_ROOT}${post.imageUrl}`;

  return (
    <Paper sx={{ p: 3, mb: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Avatar sx={{ bgcolor: "#4C8DFF" }}>{post.username[0]?.toUpperCase()}</Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {post.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {timeAgo(post.createdAt)}
          </Typography>
        </Box>
      </Box>

      {post.text && (
        <Typography variant="body1" sx={{ mb: post.imageUrl ? 1.5 : 0, whiteSpace: "pre-wrap" }}>
          {post.text}
        </Typography>
      )}

      {post.imageUrl && (
        <Box
          component="img"
          src={imageSrc}
          alt="post"
          sx={{ width: "100%", maxHeight: 420, objectFit: "cover", borderRadius: 2, mb: 1 }}
        />
      )}

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton onClick={toggleLike} color={liked ? "error" : "default"} size="small">
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <Typography variant="body2">{post.likes.length}</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton onClick={() => setShowComments((s) => !s)} size="small">
            <ChatBubbleOutlineIcon />
          </IconButton>
          <Typography variant="body2">{post.comments.length}</Typography>
        </Box>
      </Box>

      {post.likes.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          Liked by {post.likes.map((l) => l.username).join(", ")}
        </Typography>
      )}

      <Collapse in={showComments}>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.5 }}>
          {post.comments.map((c) => (
            <Box key={c._id}>
              <Typography variant="body2">
                <strong>{c.username}</strong> {c.text}
              </Typography>
            </Box>
          ))}
          {post.comments.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No comments yet. Be the first to comment.
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            size="small"
            placeholder="Write a comment..."
            fullWidth
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitComment()}
          />
          <Button variant="contained" onClick={submitComment} disabled={submitting}>
            Send
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
}

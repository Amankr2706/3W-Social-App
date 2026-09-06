import React, { useState, useRef } from "react";
import { Paper, TextField, Box, IconButton, Button, Avatar, Typography, Alert } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    setError("");
    if (!text.trim() && !imageFile) {
      setError("Write something or add an image before posting.");
      return;
    }

    setPosting(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (imageFile) formData.append("image", imageFile);

      const { data } = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onPostCreated(data);
      setText("");
      clearImage();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create post.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Create Post
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Avatar sx={{ bgcolor: user?.avatarColor }}>{user?.username?.[0]?.toUpperCase()}</Avatar>
        <Box sx={{ flex: 1 }}>
          <TextField
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            variant="standard"
            InputProps={{ disableUnderline: true }}
          />

          {preview && (
            <Box sx={{ position: "relative", display: "inline-block", mt: 1 }}>
              <Box
                component="img"
                src={preview}
                alt="preview"
                sx={{ maxWidth: 220, maxHeight: 220, borderRadius: 2, display: "block" }}
              />
              <IconButton
                size="small"
                onClick={clearImage}
                sx={{ position: "absolute", top: 4, right: 4, bgcolor: "rgba(0,0,0,0.6)" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <IconButton component="label" color="primary">
              <PhotoCameraIcon />
              <input ref={fileInputRef} hidden type="file" accept="image/*" onChange={handleFileChange} />
            </IconButton>

            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSubmit}
              disabled={posting}
            >
              {posting ? "Posting..." : "Post"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

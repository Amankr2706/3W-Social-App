import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Avatar,
  Button,
  Pagination,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  InputBase,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../context/AuthContext";
import { useColorMode } from "../context/ColorModeContext";
import api from "../api";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

const SORT_TABS = [
  { value: "recent", label: "All Posts" },
  { value: "liked", label: "Most Liked" },
  { value: "discussed", label: "Most Commented" },
];

export default function Feed() {
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("recent");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  const loadFeed = useCallback(async (pageNum, sortVal, searchVal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum, limit: 10, sort: sortVal });
      if (searchVal) params.set("search", searchVal);
      const { data } = await api.get(`/posts?${params.toString()}`);
      setPosts(data.posts);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(page, sort, search);
  }, [page, sort, search, loadFeed]);

  // Debounce search input so we're not firing a request on every keystroke.
  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearch(value);
    }, 400);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handlePostCreated = (newPost) => {
    // New posts appear at the top instantly, no refetch needed.
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.default" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h5">3W Social</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton onClick={toggleColorMode} size="small">
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Avatar sx={{ bgcolor: user?.avatarColor, width: 36, height: 36 }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2">{user?.username}</Typography>
            <Button variant="outlined" size="small" onClick={logout}>
              Log Out
            </Button>
          </Box>
        </Toolbar>

        {/* Sort tabs (left) + expandable inline search (right) */}
        <Toolbar
          variant="dense"
          sx={{ justifyContent: "space-between", borderTop: "1px solid", borderColor: "divider" }}
        >
          <Tabs
            value={sort}
            onChange={(e, v) => {
              setSort(v);
              setPage(1);
            }}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
          >
            {SORT_TABS.map((t) => (
              <Tab key={t.value} value={t.value} label={t.label} sx={{ minHeight: 44 }} />
            ))}
          </Tabs>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            {searchOpen && (
              <InputBase
                autoFocus
                placeholder="Find a post or person..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                sx={{
                  width: { xs: 120, sm: 200 },
                  mr: 0.5,
                  borderBottom: "2px solid",
                  borderColor: "primary.main",
                  fontSize: 14,
                }}
              />
            )}
            <IconButton size="small" onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}>
              {searchOpen ? <CloseIcon fontSize="small" /> : <SearchIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        <CreatePost onPostCreated={handlePostCreated} />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>
            {search ? `Nothing matches "${search}" yet.` : "No posts yet. Be the first to share something!"}
          </Typography>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} onUpdate={handlePostUpdated} />)
        )}

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}

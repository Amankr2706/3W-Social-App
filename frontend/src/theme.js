import { createTheme } from "@mui/material/styles";

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      background:
        mode === "dark"
          ? { default: "#0A0E1A", paper: "#131A2B" }
          : { default: "#F5F6FA", paper: "#FFFFFF" },
      primary: {
        main: "#4C8DFF",
      },
      secondary: {
        main: "#F5C518", // gold accent, like the star/points pill in the reference
      },
      text:
        mode === "dark"
          ? { primary: "#F1F3F9", secondary: "#8B93A7" }
          : { primary: "#12131A", secondary: "#5B6272" },
      divider: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    },
    typography: {
      fontFamily: "'Poppins', 'Roboto', sans-serif",
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 24,
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
      },
    },
  });

export default getTheme;

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6366f1" },
    secondary: { main: "#f59e0b" },
    background: { default: "#f8fafc", paper: "#ffffff" },
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica", sans-serif',
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #f1f5f9",
        },
      },
    },
  },
});

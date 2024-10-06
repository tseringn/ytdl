import React from "react";
import "./App.css";
import { YoutubeDownloader } from "./pages/DownloadPage";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
const theme = createTheme({
  palette: {
    mode: "light",
  },
});
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <YoutubeDownloader />
    </ThemeProvider>
  );
}

export default App;

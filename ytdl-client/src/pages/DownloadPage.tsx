import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  LinearProgress,
  Container,
  Paper,
  Alert,
} from "@mui/material";

const API_BASE_URL = "http://localhost:3000/api/youtube";

interface VideoInfo {
  valid: boolean;
  title: string;
  thumbnail: string;
  duration: string;
}

export const YoutubeDownloader: React.FC = () => {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateUrl = async () => {
    try {
      setError("");
      setSuccess("");
      setVideoInfo(null);

      const response = await axios.get(`${API_BASE_URL}/validate`, {
        params: { url },
      });

      setVideoInfo(response.data);
    } catch (err) {
      setError("Invalid YouTube URL");
    }
  };

  const downloadVideo = async () => {
    try {
      setIsDownloading(true);
      setError("");
      setSuccess("");

      const response = await axios.post(`${API_BASE_URL}/download`, null, {
        params: { url },
      });

      if (response.data.success) {
        setSuccess("Download completed successfully!");
      }
    } catch (err) {
      setError("Download failed");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isDownloading && videoInfo) {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/progress`, {
            params: { videoId: url.split("v=")[1] },
          });

          setDownloadProgress(response.data.progress);

          if (response.data.progress >= 100) {
            clearInterval(intervalId);
            setIsDownloading(false);
          }
        } catch (err) {
          console.error("Error fetching progress:", err);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isDownloading, url, videoInfo]);

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          YouTube Video Downloader
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="YouTube URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={validateUrl} disabled={!url || isDownloading}>
            Validate URL
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {videoInfo && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {videoInfo.title}
            </Typography>
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              style={{ maxWidth: "100%", height: "auto" }}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={downloadVideo}
                disabled={isDownloading}
              >
                {isDownloading ? "Downloading..." : "Download Video"}
              </Button>
            </Box>

            {isDownloading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Download Progress: {Math.round(downloadProgress)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={downloadProgress}
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

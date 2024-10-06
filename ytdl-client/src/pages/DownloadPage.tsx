import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

const API_BASE_URL = "http://localhost:3000/api/youtube";

interface VideoFormat {
  itag: number;
  quality: string;
  mimeType: string;
}

interface VideoInfo {
  valid: boolean;
  title: string;
  thumbnail: string;
  duration: string;
  videoId: string;
  formats: VideoFormat[];
}

interface DownloadProgress {
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  status: "preparing" | "downloading" | "completed" | "error" | "not_found";
}

export const YoutubeDownloader: React.FC = () => {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<number | "">("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const progressInterval = useRef<NodeJS.Timeout>();

  const clearProgressInterval = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = undefined;
    }
  };

  useEffect(() => {
    return () => {
      clearProgressInterval();
    };
  }, []);

  const validateUrl = async () => {
    try {
      setError("");
      setSuccess("");
      setVideoInfo(null);
      setDownloadProgress(null);
      setSelectedFormat("");
      clearProgressInterval();

      const response = await axios.get(`${API_BASE_URL}/validate`, {
        params: { url },
      });

      setVideoInfo(response.data);
    } catch (err) {
      setError("Invalid YouTube URL");
    }
  };

  const checkProgress = useCallback(async (videoId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/progress`, {
        params: { videoId },
      });

      setDownloadProgress(response.data);

      if (response.data.status === "completed") {
        setIsDownloading(false);
        setSuccess("Download completed successfully!");
        clearProgressInterval();
        return true;
      } else if (response.data.status === "error") {
        setIsDownloading(false);
        setError("Download failed");
        clearProgressInterval();
        return true;
      }

      return false;
    } catch (err) {
      console.error("Error fetching progress:", err);
      return false;
    }
  }, []);

  const downloadVideo = async () => {
    if (!videoInfo) return;

    try {
      setIsDownloading(true);
      setError("");
      setSuccess("");
      setDownloadProgress({
        progress: 0,
        downloadedBytes: 0,
        totalBytes: 0,
        status: "preparing",
      });

      // Start progress polling
      clearProgressInterval();
      progressInterval.current = setInterval(() => {
        checkProgress(videoInfo.videoId);
      }, 1000);

      // Create download URL with format if selected
      const downloadUrl = `${API_BASE_URL}/download?url=${encodeURIComponent(url)}${
        selectedFormat ? `&itag=${selectedFormat}` : ""
      }`;

      // Create an invisible anchor element to trigger the download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError("Download failed to start");
      setIsDownloading(false);
      clearProgressInterval();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    return `${bytes.toFixed(1)} MB`;
  };

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

            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel>Video Quality</InputLabel>
              <Select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as number)}
                label="Video Quality"
                disabled={isDownloading}
              >
                {videoInfo.formats.map((format) => (
                  <MenuItem key={format.itag} value={format.itag}>
                    {format.quality} - {format.mimeType.split(";")[0]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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

            {downloadProgress && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  {downloadProgress.status === "preparing" ? (
                    "Preparing download..."
                  ) : downloadProgress.status === "downloading" ? (
                    <>
                      Downloaded: {formatBytes(downloadProgress.downloadedBytes)} /{" "}
                      {formatBytes(downloadProgress.totalBytes)}(
                      {Math.round(downloadProgress.progress)}%)
                    </>
                  ) : null}
                </Typography>
                <LinearProgress
                  variant={
                    downloadProgress.status === "preparing" ? "indeterminate" : "determinate"
                  }
                  value={downloadProgress.progress}
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

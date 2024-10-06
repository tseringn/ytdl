import React, { useState } from "react";
import { Skeleton } from "../containers/Skeleton";
import { PageTitle } from "../components/PageTitle";
import { UrlInput } from "../components/UrlInput";
import { DownloadButton } from "../components/DownloadButton";
import { ProgressSlider } from "../components/ProgressSlider";
export const DownloadPage = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [progress, setProgress] = useState(0);

  const handleDownload = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 10;
      });
    }, 1000);
  };

  return (
    <Skeleton>
      <PageTitle>YouTube Video Downloader</PageTitle>
      <UrlInput
        type="text"
        placeholder="Enter YouTube video URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
      />
      <DownloadButton onClick={handleDownload}>Download Video</DownloadButton>
      <ProgressSlider type="range" value={progress} readOnly />
    </Skeleton>
  );
};

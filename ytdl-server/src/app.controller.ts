// src/youtube/youtube.controller.ts
import {
  Controller,
  Get,
  Query,
  Res,
  Header,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import * as ytdl from 'ytdl-core';

@Controller('api/youtube')
export class YTDLController {
  private downloads = new Map<string, any>();

  @Get('validate')
  async validateUrl(@Query('url') url: string) {
    try {
      if (!ytdl.validateURL(url)) {
        throw new HttpException('Invalid YouTube URL', HttpStatus.BAD_REQUEST);
      }

      const info = await ytdl.getInfo(url, {
        requestOptions: {
          headers: {
            // Add common browser headers to avoid detection
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            Connection: 'keep-alive',
          },
        },
      });

      return {
        valid: true,
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[0].url,
        duration: info.videoDetails.lengthSeconds,
        videoId: info.videoDetails.videoId,
        formats: info.formats
          .filter((format) => format.hasAudio && format.hasVideo)
          .map((format) => ({
            itag: format.itag,
            quality: format.qualityLabel,
            mimeType: format.mimeType,
          })),
      };
    } catch (error) {
      console.error('Validation error:', error);
      throw new HttpException('Invalid YouTube URL', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('download')
  @Header('Content-Disposition', 'attachment')
  async downloadVideo(
    @Query('url') url: string,
    @Query('itag') itag: string,
    @Res() res: Response,
  ) {
    try {
      const info = await ytdl.getInfo(url, {
        requestOptions: {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            Connection: 'keep-alive',
          },
        },
      });

      const videoId = info.videoDetails.videoId;
      const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_');

      const format = itag
        ? info.formats.find((f) => f.itag === parseInt(itag))
        : ytdl.chooseFormat(info.formats, { quality: 'highest' });

      if (!format) {
        throw new HttpException(
          'No suitable format found',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Set response headers
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${title}.mp4"`,
      );

      // Initialize download progress
      this.downloads.set(videoId, {
        progress: 0,
        downloadedBytes: 0,
        totalBytes: format.contentLength,
        status: 'downloading',
      });

      const video = ytdl(url, {
        format: format,
        requestOptions: {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            Connection: 'keep-alive',
          },
        },
      });

      // Handle progress
      video.on('progress', (_, downloaded, total) => {
        const progress = (downloaded / total) * 100;
        this.downloads.set(videoId, {
          progress,
          downloadedBytes: downloaded,
          totalBytes: total,
          status: 'downloading',
        });
      });

      // Handle download completion
      video.on('end', () => {
        this.downloads.set(videoId, {
          progress: 100,
          status: 'completed',
        });
      });

      // Handle errors
      video.on('error', (error) => {
        console.error('YouTube download error:', error);
        this.downloads.set(videoId, {
          status: 'error',
          error: error.message,
        });

        if (!res.headersSent) {
          res.status(500).json({ error: 'Download failed' });
        }
      });

      // Pipe the video stream to response
      video.pipe(res);
    } catch (error) {
      console.error('Download setup error:', error);
      if (!res.headersSent) {
        throw new HttpException(
          'Download failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('progress')
  getProgress(@Query('videoId') videoId: string) {
    const downloadProgress = this.downloads.get(videoId);

    if (!downloadProgress) {
      return {
        progress: 0,
        downloadedBytes: 0,
        totalBytes: 0,
        status: 'not_found',
      };
    }

    return {
      ...downloadProgress,
      downloadedBytes: Math.floor(
        downloadProgress.downloadedBytes / 1024 / 1024,
      ), // Convert to MB
      totalBytes: Math.floor(downloadProgress.totalBytes / 1024 / 1024), // Convert to MB
    };
  }
}

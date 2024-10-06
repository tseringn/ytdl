// src/app.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import * as ytdl from 'ytdl-core';

@Controller()
export class AppController {
  @Get('download')
  async download(@Query('url') url: string, @Res() res: Response) {
    const videoInfo = await ytdl.getInfo(url);
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');

    const videoStream = ytdl(url, {
      quality: 'highest',
      format: ytdl.chooseFormat(videoInfo.formats, {
        quality: 'highest',
        filter: 'videoandaudio',
      }),
    });

    videoStream.pipe(res);
  }
  @Get('validate')
  async validateUrl(@Query('url') url: string, @Res() res: Response) {
    return res.status(200).send({ valid: ytdl.validateURL(url) });
  }

  @Get('progress')
  async progress(@Query('url') url: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const videoInfo = await ytdl.getInfo(url);

    const video = ytdl(url, {
      format: ytdl.chooseFormat(videoInfo.formats, {
        quality: 'highest',
        filter: 'videoandaudio',
      }),
    });

    let downloaded = 0;
    let totalSize = 0;

    video.on('response', (response) => {
      totalSize = parseInt(response.headers['content-length'], 10);
    });

    video.on('data', (chunk) => {
      downloaded += chunk.length;
      const percent = (downloaded / totalSize) * 100;
      res.write(`data: ${Math.floor(percent)}\n\n`);
    });

    video.on('end', () => {
      res.write('data: complete\n\n');
      res.end();
    });

    video.on('error', (err) => {
      console.error('Error downloading video:', err);
      res.end();
    });
  }
}

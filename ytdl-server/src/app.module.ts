import { Module } from '@nestjs/common';
import { YTDLController } from './app.controller';

@Module({
  imports: [],
  controllers: [YTDLController],
})
export class AppModule {}

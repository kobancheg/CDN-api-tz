import { Controller, Get, Post, Req, Res, Query } from '@nestjs/common'
import { FastifyRequest, FastifyReply } from 'fastify'
import { AppService } from './app.service'

import * as zlib from 'zlib';
import * as pump from 'pump';

type Request = FastifyRequest
type Response = FastifyReply

@Controller()
export class AppController {
   constructor(private readonly appService: AppService) { }

   @Post('upload')
   async uploadFile(
      @Query('key') key: string,
      @Req() request: Request): Promise<{ id: Object }> {
      const data = await request.file()

      return this.appService.upload(key, data)
   }

   @Get('download:id')
   async downloadFile(
      @Query('key') key: string,
      @Query('id') id: string,
      @Res() response: Response) {

      const gzip = zlib.createGunzip();
      const [decrypt, file, metaInfo] = await this.appService.download(id, key);

      response.raw.writeHead(200, {
         'Content-Type': metaInfo.type,
         'Content-Disposition': 'attachment; filename=' + metaInfo.name
      })

      return await pump(file, gzip, decrypt, response.raw)
   }
}

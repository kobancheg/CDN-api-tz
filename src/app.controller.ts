import { Controller, Get, Post, Req, Res, Query } from '@nestjs/common'
import { FastifyRequest, FastifyReply } from 'fastify'
import { CryptoService } from './files/crypto.service'
import { MetaInfoService } from './files/meta.service'

import * as zlib from 'zlib';
import * as pump from 'pump';

type Request = FastifyRequest
type Response = FastifyReply

@Controller()
export class AppController {
   constructor(private readonly cryptoService: CryptoService,
      private readonly metaInfoService: MetaInfoService,
   ) { }

   @Post('upload')
   async uploadFile(
      @Query('key') key: string,
      @Req() request: Request): Promise<{ id: Object }> {

      const data = await request.file();
      const [id, iv] = await this.cryptoService.upload(key, data);
      await this.metaInfoService.writeMetaInfo(id, data, iv, key);

      return { id: id }
   }

   @Get('download:id')
   async downloadFile(
      @Query('key') key: string,
      @Query('id') id: string,
      @Res() response: Response) {

      const gzip = zlib.createGunzip();
      const metaInfo = await this.metaInfoService.readMetaInfo(id);
      const [decrypt, file] = await this.cryptoService.download(key, metaInfo);

      response.raw.writeHead(200, {
         'Content-Type': metaInfo.type,
         'Content-Disposition': 'attachment; filename=' + metaInfo.name
      })

      return await pump(file, gzip, decrypt, response.raw)
   }
}

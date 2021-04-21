import { Controller, Get, Post, Req, Res, Query, Delete, Param } from '@nestjs/common'
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
      @Query('pass') pass: string,
      @Req() request: Request): Promise<{ id: Object }> {

      const data = await request.file();
      const [id, iv, key] = await this.cryptoService.upload(pass, data);
      await this.metaInfoService.writeMetaInfo(id, data, iv, key);

      return { id: id }
   }

   @Get('download:id:pass')
   async downloadFile(
      @Query('pass') pass: string,
      @Query('id') id: string,
      @Res() response: Response) {

      const unzip = zlib.createGunzip();
      const metaInfo = await this.metaInfoService.readMetaInfo(id);
      const [decrypt, file] = await this.cryptoService.download(pass, metaInfo);

      response.raw.writeHead(200, {
         'Content-Type': metaInfo.type,
         'Content-Disposition': 'attachment; filename=' + metaInfo.name
      })

      return await pump(file, unzip, decrypt, response.raw)
   }

   @Delete('delete:id')
   async removeFile(
      @Query('id') id: string) {

      await this.cryptoService.delete(id);
      const resault = await this.metaInfoService.removeMetaInfo(id);

      return resault;
   }
}

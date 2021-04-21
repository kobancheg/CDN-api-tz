import {
   Controller,
   Get,
   Post,
   Req,
   Res,
   Query,
   Delete,
   HttpException,
   HttpStatus
} from '@nestjs/common'

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
      @Req() request: Request): Promise<any> {

      if (!pass) return new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
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

      if (!metaInfo) return response.code(404).send('Not found');
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

      const resault = await this.metaInfoService.removeMetaInfo(id);
      const { deletedCount } = resault;

      if (!id) return new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      if (!deletedCount) return new HttpException('Not found', HttpStatus.NOT_FOUND);

      await this.cryptoService.delete(id);

      return resault;
   }
}

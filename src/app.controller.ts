import { Controller, Get, Param, Post, Req, Res } from '@nestjs/common'
import { AppService } from './app.service'

import { FastifyRequest, FastifyReply } from 'fastify'
import { File } from './models/file.entity'

type Request = FastifyRequest
type Response = FastifyReply

@Controller()
export class AppController {
   constructor(private readonly appService: AppService) { }

   @Post('upload')
   uploadFile(@Req() request: Request): Promise<{ id: string }> {
      return this.appService.upload(request)
   }

   @Get('download')
   getAllFiles(): Promise<File[]> {
      return this.appService.getList()
   }

   @Get('download:id')
   downloadFile(
      @Param('id') id: string,
      @Req() request: Request,
      @Res() response: Response,
   ) {
      this.appService.download(id, request, response)
   }
}

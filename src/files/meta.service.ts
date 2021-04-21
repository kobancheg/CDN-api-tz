import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Multipart } from 'fastify-multipart'
import { Model } from 'mongoose'
import { File } from '../models/file.entity'

@Injectable()
export class MetaInfoService {
   constructor(
      @InjectModel('metainfo') private fileModel: Model<File>) { }

   async writeMetaInfo(id: string, data: Multipart, iv: Buffer, key: Buffer) {
      try {
         const metaInfo = new this.fileModel({
            iv: iv,
            name: data.filename,
            type: data.mimetype,
            idName: id,
            keyCrypt: key
         });
         await metaInfo.save();
      } catch (err) {
         throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   async readMetaInfo(id: string): Promise<File> {
      try {
         const metaInfo = await this.fileModel.findOne({ idName: id });

         return metaInfo;
      } catch (err) {
         throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   async removeMetaInfo(id: string): Promise<any> {
      try {
         const resault = await this.fileModel.deleteOne({ idName: id });

         return resault;
      } catch (err) {
         throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }
}

import * as fs from 'fs';
import * as crypto from 'crypto';
import * as uuid from 'uuid';
import * as zlib from 'zlib';
import * as pump from 'pump';
import * as path from 'path';

import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Multipart } from 'fastify-multipart'
import configuration from '../config/configuration';
import { File } from '../models/file.model'

@Injectable()
export class CryptoService {
   private storePath: string;

   constructor() {
      this.storePath = configuration().storePath;
   }

   async upload(pass: string, data: Multipart)
      : Promise<[id: string, iv: Buffer, key: Buffer]> {

      try {
         const id = uuid.v4();
         const iv = crypto.randomBytes(16);
         const key = crypto.createHash('sha256').update(pass).digest();
         const encrypt = crypto.createCipheriv('aes-256-ctr', key, iv);
         const gzip = zlib.createGzip();

         const file = fs.createWriteStream(path.resolve(this.storePath, `${id}.gz`));
         await pump(data.file, encrypt, gzip, file);

         return [id, iv, key];

      } catch (err) {
         throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   async download(pass: string, metaInfo: File)
      : Promise<[decrypt: crypto.Decipher, file: fs.ReadStream]> {
      try {
         const iv = metaInfo.iv;
         const key = crypto.createHash('sha256').update(pass).digest();
         const decrypt = crypto.createDecipheriv('aes-256-ctr', key, iv);
         const file = fs.createReadStream(path.resolve(this.storePath, `${metaInfo.idName}.gz`));

         return [decrypt, file];

      } catch (err) {
         throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   async delete(id: string): Promise<any> {
      try {
         fs.unlink(path.resolve(this.storePath, `${id}.gz`), (err) => {
            if (err) throw err;
         });

      } catch (err) {
         throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }
}

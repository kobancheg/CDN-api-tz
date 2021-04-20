import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Multipart } from 'fastify-multipart'
import { Model } from 'mongoose'
import { File } from './models/file.entity'
import { createReadStream, createWriteStream } from 'fs';

import * as crypto from 'crypto';
import * as uuid from 'uuid';
import * as zlib from 'zlib';
import * as pump from 'pump';
import * as path from 'path';

@Injectable()
export class AppService {

  constructor(
    @InjectModel('metainfo') private fileModel: Model<File>) { }

  async upload(key: string, data: Multipart): Promise<{ id: string }> {
    try {
      const id = uuid.v4()
      const iv = crypto.randomBytes(16)
      const encrypt = crypto.createCipheriv('aes-256-ctr', key, iv)
      const gzip = zlib.createGzip()

      const filePath = path.resolve(__dirname, '..', 'store');
      const file = createWriteStream(path.resolve(filePath, `${id}.gz`));
      await pump(data.file, encrypt, gzip, file)

      const metaInfo = new this.fileModel({
        iv: iv,
        name: data.filename,
        type: data.mimetype,
        idName: id,
        keyCrypt: key
      });
      await metaInfo.save();

      return { id: id };
    } catch (err) {
      console.error(err)
    }
  }

  async download(id: string, key: string): Promise<any[]> {
    try {
      const metaInfo = await this.fileModel.findOne({ idName: id });
      const iv = metaInfo.iv;

      const filePath = path.resolve(__dirname, '..', 'store');
      const decrypt = crypto.createDecipheriv('aes-256-ctr', key, iv);
      const file = createReadStream(path.resolve(filePath, `${metaInfo.idName}.gz`));
      const resault = [decrypt, file, metaInfo]

      return resault;

    } catch (err) {
      console.log(err);
    }
  }
}

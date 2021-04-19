import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { FastifyReply, FastifyRequest } from 'fastify'
import { GridFSBucket, ObjectId } from 'mongodb'
import { Connection, Model, mongo } from 'mongoose'
import { File, FileModel } from './models/file.entity'
import { createReadStream, createWriteStream } from 'fs';
import { Stream } from 'stream'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import * as zlib from 'zlib';
import * as path from 'path';
import * as uuid from 'uuid';

type Request = FastifyRequest
type Response = FastifyReply

@Injectable()
export class AppService {
  private readonly bucket: GridFSBucket

  constructor(
    @InjectModel('fs.files') private fileModel: Model<File>,
    @InjectConnection() private connection: Connection
  ) {
    // this.bucket = new mongo.GridFSBucket(this.connection.db)
  }

  async upload(key, request: Request): Promise<{ id: string }> {
    return new Promise((resolve, reject) => {
      try {
        request.multipart(
          async (fields, file: Stream, fieldname, encoding, mimetype) => {
            const idName = uuid.v4();
            const filePath = path.resolve(__dirname, '..', 'uploads');
            const algorithm = 'aes-256-ctr';
            const iv = randomBytes(16);
            const gzip = zlib.createGzip();

            const createdCat = new this.fileModel({
              buffer: iv,
              idName: idName,
              keyCrypt: key
            });
            await createdCat.save();

            const encrypt = createCipheriv(algorithm, key, iv);
            const output = createWriteStream(path.resolve(filePath, `${idName}.gz`));

            file.pipe(encrypt)
              .pipe(gzip)
              .pipe(output);

            file.on('end', () => {
              resolve({
                id: idName,
              })
            })
          },
          (err) => {
            console.error(err)
            reject(new ServiceUnavailableException())
          },
        )
      } catch (e) {
        console.error(e)
        reject(new ServiceUnavailableException())
      }
    })
  }

  async download(id: string, key: string, response: Response) {
    return new Promise(async (resolve, reject) => {
      try {
        const algorithm = 'aes-256-ctr';
        const { idName, buffer } = await this.fileModel.findOne({ idName: id });
        const iv = buffer;
        const unzip = zlib.createGunzip();

        const filePath = path.resolve(__dirname, '..', 'uploads');
        const decrypt = createDecipheriv(algorithm, key, iv);
        const input = createReadStream(path.resolve(filePath, `${idName}.gz`));
        const output = createWriteStream('test.txt');

        input.pipe(unzip)
          .pipe(decrypt)
          .pipe(output)


        input.on('end', () => {
          resolve({
            id: 'test',
          })
        })
      } catch (err) {
        console.log(err);
      }
    })
  }

  getList() {
    return this.fileModel.find().exec()
  }
}

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
import { File } from './models/file.entity'
import { createReadStream, createWriteStream } from 'fs';
import { Stream, pipeline } from 'stream'
import { scrypt, createCipheriv, createDecipheriv, randomBytes, randomFill } from 'crypto';
import * as path from 'path'
import * as uuid from 'uuid';

type Request = FastifyRequest
type Response = FastifyReply

@Injectable()
export class AppService {
  private readonly bucket: GridFSBucket

  constructor(
    @InjectModel('fs.files') private readonly fileModel: Model<File>,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.bucket = new mongo.GridFSBucket(this.connection.db)
  }

  async upload(key, request: Request): Promise<{ id: string }> {
    return new Promise((resolve, reject) => {
      try {
        request.multipart(
          (fields, file: Stream, fieldname, encoding, mimetype) => {
            console.log(fields);
            console.log(fieldname);
            console.log(encoding);
            console.log(mimetype);


            const idName = uuid.v4();
            const filePath = path.resolve(__dirname, '..', 'uploads');
            const algorithm = 'aes-256-ctr';
            const iv = randomBytes(16);

            const encrypt = createCipheriv(algorithm, key, iv);
            const output = createWriteStream(path.resolve(filePath, `${idName}.enc`));

            file.pipe(encrypt).pipe(output);

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

  async download(id: string, request: Request, response: Response) {
    console.log(id);
    return new Promise((resolve, reject) => {
      try {
        const key = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
        const algorithm = 'aes-256-ctr';
        const iv = randomBytes(16);

        const filePath = path.resolve(__dirname, '..', 'uploads');
        const decrypt = createDecipheriv(algorithm, key, iv);
        const input = createReadStream(path.resolve(filePath, '9e6b9d6a-0d85-44ec-984a-e54dd6877f05.enc'));
        const output = createWriteStream('test.txt');

        input.pipe(decrypt)
          .pipe(output);

        input.on('end', () => {
          resolve({
            id: 'test',
          })
        })

      } catch (err) {
        console.log(err);
      }
    })
    // try {
    // if (!ObjectId.isValid(id)) {
    //   throw new BadRequestException(null, 'InvalidVideoId')
    // }

    // const oId = new ObjectId(id)
    // const fileInfo = await this.fileModel.findOne({ _id: id }).exec()

    // if (!fileInfo) {
    //   throw new NotFoundException(null, 'VideoNotFound')
    // }

    // if (request.headers.range) {
    //   const range = request.headers.range.substr(6).split('-')
    //   const start = parseInt(range[0], 10)
    //   const end = parseInt(range[1], 10) || null
    //   const readstream = this.bucket.openDownloadStream(oId, {
    //     start,
    //     end,
    //   })

    //   response.status(206)
    //   response.headers({
    //     'Accept-Ranges': 'bytes',
    //     'Content-Type': fileInfo.contentType,
    //     'Content-Range': `bytes ${start}-${end ? end : fileInfo.length - 1}/${fileInfo.length
    //       }`,
    //     'Content-Length': (end ? end : fileInfo.length) - start,
    //     'Content-Disposition': `attachment; filename="${fileInfo.filename}"`,
    //   })

    //   response.raw.on('close', () => {
    //     readstream.destroy()
    //   })

    //   response.send(readstream)
    // } else {
    //   const readstream = this.bucket.openDownloadStream(oId)

    //   response.raw.on('close', () => {
    //     readstream.destroy()
    //   })

    //   response.status(200)
    //   response.headers({
    //     'Accept-Range': 'bytes',
    //     'Content-Type': fileInfo.contentType,
    //     'Content-Length': fileInfo.length,
    //     'Content-Disposition': `attachment; filename="${fileInfo.filename}"`,
    //   })

    //   response.send(readstream)
    // }
    // } catch (e) {
    //   console.error(e)
    //   throw new ServiceUnavailableException()
    // }
  }

  getList() {
    return this.fileModel.find().exec()
  }
}

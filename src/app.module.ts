import configuration from './config/configuration';
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { CryptoService } from './files/crypto.service'
import { MetaInfoService } from './files/meta.service'
import { FileModel } from './models/file.model'

@Module({
   imports: [
      ConfigModule.forRoot({ load: [configuration] }),
      MongooseModule.forRoot(
         `mongodb://${configuration().database.host}
         :${configuration().database.port}
         /${configuration().database.db}`,
         {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
         },
      ),
      MongooseModule.forFeature([{ name: 'metainfo', schema: FileModel }])
   ],
   controllers: [AppController],
   providers: [CryptoService, MetaInfoService],
})
export class AppModule { }

import { Module } from '@nestjs/common'
import { ConfigModule } from './config/config.module';
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { CryptoService } from './files/crypto.service'
import { MetaInfoService } from './files/meta.service'
import { FileModel } from './models/file.entity'

@Module({
   imports: [
      MongooseModule.forRoot(
         `mongodb://localhost:27017/cdn`,
         {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
         },
      ),
      MongooseModule.forFeature([{ name: 'metainfo', schema: FileModel }]),
      ConfigModule.register({ folder: './config' })
   ],
   controllers: [AppController],
   providers: [CryptoService, MetaInfoService],
})
export class AppModule { }

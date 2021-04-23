import { NestFactory } from '@nestjs/core'
import {
   FastifyAdapter,
   NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import fastifyMulipart from 'fastify-multipart'
import configuration from './config/configuration'

async function bootstrap() {
   const { port, host } = configuration();

   const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
   )

   app.enableShutdownHooks()
   app.register(fastifyMulipart)

   await app.listen(port, host, () => {
      console.log(`Server listening at ${host}:${port}`)
   })
}
bootstrap()

import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import fastifyMulipart from 'fastify-multipart'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )

  app.enableShutdownHooks()
  app.register(fastifyMulipart)

  await app.listen(3001, '0.0.0.0', () => {
    console.log('Server listening at http://0.0.0.0:' + 3001)
  })
}
bootstrap()

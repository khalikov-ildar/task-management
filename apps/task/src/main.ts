import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app/app.module'
import { ConfigService } from '@nestjs/config'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { buildRmqConnectionString } from '@app/rabbitmq'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { REFRESH_COOKIE_TOKEN } from './auth/auth.constants'

async function bootstrap() {
  const app = await NestFactory.create(AppModule.setEnvironment('prod'))
  const configService = app.get(ConfigService)
  const logger = new Logger(Logger.name)

  const rmqUrl = buildRmqConnectionString(
    configService.getOrThrow('RABBITMQ_DEFAULT_USER'),
    configService.getOrThrow('RABBITMQ_DEFAULT_PASS'),
    configService.getOrThrow('RABBITMQ_PORT')
  )
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      queue: configService.getOrThrow('RABBITMQ_WORKER'),
      noAck: true,
      urls: [rmqUrl],
      queueOptions: {
        durable: true
      }
    }
  })
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  const config = new DocumentBuilder()
    .setTitle('Task Management App')
    .setDescription('The Task Management Application API')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth(REFRESH_COOKIE_TOKEN)
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)

  app.enableShutdownHooks()

  await app.listen(3000)
  logger.log('Application is running on http://localhost:3000')
}

bootstrap()

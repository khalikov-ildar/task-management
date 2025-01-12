import helmet from 'helmet'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app/app.module'
import { ConfigService } from '@nestjs/config'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { buildRmqConnectionString } from '@app/rabbitmq'
import { helmetConfig } from './app/config/helmet.config'
import { LoggerService } from './app/logger/logger.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule.setEnvironment('prod'), {
    logger: new LoggerService()
  })

  app.enableShutdownHooks()
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.use(helmet(helmetConfig))

  const configService = app.get(ConfigService)

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      queue: configService.getOrThrow('RABBITMQ_WORKER'),
      noAck: true,
      urls: [
        buildRmqConnectionString(
          configService.getOrThrow('RABBITMQ_DEFAULT_USER'),
          configService.getOrThrow('RABBITMQ_DEFAULT_PASS'),
          configService.getOrThrow('RABBITMQ_PORT')
        )
      ],
      queueOptions: {
        durable: true
      }
    }
  })

  await app.listen(3000)
}

bootstrap()

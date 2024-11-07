import { NestFactory } from '@nestjs/core';
import { buildRmqConnectionString } from '@app/rabbitmq';
import { WorkerModule } from './worker.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WorkerModule,
    {
      transport: Transport.RMQ,
      options: {
        noAck: false,
        queue: process.env.RABBITMQ_WORKER,
        queueOptions: { durable: true },
        urls: [
          buildRmqConnectionString(
            process.env.RABBITMQ_DEFAULT_USER,
            process.env.RABBITMQ_DEFAULT_PASS,
            process.env.RABBITMQ_HOST,
          ),
        ],
      },
    },
  );
  await app.listen();
}
bootstrap();

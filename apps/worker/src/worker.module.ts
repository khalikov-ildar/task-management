import { Module } from '@nestjs/common';
import { MailingController } from './mailing/worker.controller';
import { MailingModule } from './mailing/mailing.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogModule } from './audit-log/audit-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailingModule.forRootAsync(async (config: ConfigService) => {
      return {
        auth: {
          user: config.getOrThrow('EMAIL_USER'),
          pass: config.getOrThrow('EMAIL_PASSWORD'),
        },
        host: config.getOrThrow('EMAIL_HOST'),
        port: Number(config.getOrThrow('EMAIL_PORT')),
        secure: JSON.parse(config.getOrThrow('EMAIL_IS_SECURE')),
        senderAddress: config.getOrThrow('EMAIL_SENDER_ADDRESS'),
      };
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: 'mongodb://localhost:27017',
          user: configService.getOrThrow('MONGO_INITDB_ROOT_USERNAME'),
          pass: configService.getOrThrow('MONGO_INITDB_ROOT_PASSWORD'),
          dbName: configService.getOrThrow('MONGO_INITDB_DATABASE'),
        };
      },
    }),
    AuditLogModule,
  ],
  controllers: [MailingController],
  providers: [],
})
export class WorkerModule {}

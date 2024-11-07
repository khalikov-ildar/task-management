import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class RabbitmqService {
  private proxy: ClientProxy;
  constructor(url: string, queue: string) {
    this.proxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        noAck: true,
        queue,
        urls: [url],
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  emit(pattern: { cmd: string }, data: any) {
    return this.proxy.emit(pattern, data);
  }

  send(pattern: { cmd: string }, data: any) {
    return this.proxy.send(pattern, data);
  }
}

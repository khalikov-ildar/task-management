import { Injectable } from '@nestjs/common';
import { IHashingService } from './i-hashing.service';
import { compare, hash } from 'bcrypt';

@Injectable()
export class HashingService implements IHashingService {
  async hash(data: string): Promise<string> {
    return await hash(data, 12);
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return await compare(data, encrypted);
  }
}

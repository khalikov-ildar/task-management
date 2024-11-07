import { UUID } from 'crypto';
import { Roles } from '../users/enums/roles.enum';

export interface AlsStructure {
  traceId: UUID;
  userId: number;
  role: Roles;
  jti?: UUID;
}

export type AlsStore = Map<
  keyof AlsStructure,
  AlsStructure[keyof AlsStructure]
>;

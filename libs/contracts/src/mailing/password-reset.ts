import { UUID } from 'crypto';

export const PASSWORD_RESET_EVENT = { cmd: 'password_reset_event' };

export type PasswordResetPayload = { email: string; token: UUID };

import { UUID } from 'crypto';

export const EMAIL_CONFIRMATION_EVENT = { cmd: 'email_confirmation_event' };

export type EmailConfirmationPayload = { email: string; token: UUID };

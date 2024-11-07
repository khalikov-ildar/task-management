export abstract class IMailingService {
  abstract sendConfirmationEmail(
    userEmail: string,
    token: string,
  ): Promise<void>;
  abstract sendPasswordResetEmail(
    userEmail: string,
    token: string,
  ): Promise<void>;
}

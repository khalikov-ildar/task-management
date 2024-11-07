import { Controller, Logger } from '@nestjs/common';
// import { IMailingService } from './mailing/i-mailing.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { EMAIL_CONFIRMATION_EVENT, PASSWORD_RESET_EVENT } from '@app/contracts';
import type {
  EmailConfirmationPayload,
  PasswordResetPayload,
} from '@app/contracts';
import { MailingService } from './mailing.service';

@Controller()
export class MailingController {
  private logger = new Logger(MailingController.name);

  constructor(private readonly mailingService: MailingService) {}

  @EventPattern(EMAIL_CONFIRMATION_EVENT)
  async sendEmailConfirmation(
    @Ctx() ctx: RmqContext,
    @Payload() { email, token }: EmailConfirmationPayload,
  ) {
    this.logger.log('Received the event : ' + EMAIL_CONFIRMATION_EVENT.cmd);
    try {
      await this.mailingService.sendConfirmationEmail(email, token);
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      this.logger.error(e);
    }
    const channel = ctx.getChannelRef();
    const msg = ctx.getMessage();
    channel.ack(msg);
  }

  @EventPattern(PASSWORD_RESET_EVENT)
  async sendPasswordReset(
    @Ctx() ctx: RmqContext,
    @Payload() { email, token }: PasswordResetPayload,
  ) {
    this.logger.log('Received the event : ' + PASSWORD_RESET_EVENT.cmd);
    try {
      await this.mailingService.sendPasswordResetEmail(email, token);
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      this.logger.error(e);
    }
    const channel = ctx.getChannelRef();
    const msg = ctx.getMessage();
    channel.ack(msg);
  }
}

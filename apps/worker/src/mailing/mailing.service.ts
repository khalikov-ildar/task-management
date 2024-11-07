import { IMailingService } from './i-mailing.service';
import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { MailingModuleOptions } from './options';
import {
  getHtmlForEmailConfirmation,
  getHtmlForPasswordReset,
} from './assets/html';

@Injectable()
export class MailingService implements IMailingService {
  private _transporter: Transporter;
  private _senderAddress: string;

  constructor(private options: MailingModuleOptions) {
    this._transporter = createTransport({
      host: this.options.host,
      port: this.options.port,
      secure: this.options.secure,
      auth: this.options.auth,
    });
    this._senderAddress = options.senderAddress;
  }

  async sendConfirmationEmail(userEmail: string, token: string): Promise<void> {
    await this._transporter.sendMail({
      from: this._senderAddress,
      to: userEmail,
      subject: 'Your email confirmation mail',
      html: getHtmlForEmailConfirmation(token),
    });
  }
  async sendPasswordResetEmail(
    userEmail: string,
    token: string,
  ): Promise<void> {
    await this._transporter.sendMail({
      from: this._senderAddress,
      to: userEmail,
      subject: 'Your password reset mail',
      html: getHtmlForPasswordReset(token),
    });
  }
}

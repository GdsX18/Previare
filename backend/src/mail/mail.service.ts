import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PreviareContact } from '@prisma/client';
import nodemailer, { type Transporter } from 'nodemailer';
import type { Env } from '../config/env.validation.js';
import { buildLeadNotificationEmail } from './templates/lead-notification.template.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;

  constructor(private readonly config: ConfigService<Env, true>) {
    const host = this.config.get('MAIL_HOST', { infer: true });
    const port = this.config.get('MAIL_PORT', { infer: true });
    const user = this.config.get('MAIL_USER', { infer: true });

    this.transporter = host
      ? nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: user ? { user, pass: this.config.get('MAIL_PASS', { infer: true }) } : undefined,
        })
      : null;
  }

  /**
   * Envia a notificação do lead para a caixa da banca (MAIL_TO).
   * Lança em caso de falha SMTP — quem chama decide se a falha é tolerável.
   * @returns false quando o SMTP não está configurado (nada foi enviado).
   */
  async sendLeadNotification(lead: PreviareContact): Promise<boolean> {
    const email = buildLeadNotificationEmail(lead);

    if (!this.transporter) {
      this.logger.warn(
        `MAIL_HOST não configurado — notificação do lead ${lead.id} não enviada.` +
          (this.config.get('NODE_ENV', { infer: true }) === 'production' ? '' : `\n${email.text}`),
      );
      return false;
    }

    const to = this.config.get('MAIL_TO', { infer: true });
    const from =
      this.config.get('MAIL_FROM', { infer: true }) ||
      `"Previare Notificações" <${this.config.get('MAIL_USER', { infer: true }) || to}>`;

    await this.transporter.sendMail({
      from,
      to,
      replyTo: { name: lead.nome, address: lead.email },
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    return true;
  }
}

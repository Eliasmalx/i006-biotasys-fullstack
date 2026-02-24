import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import config from '../../../config/dotenv.config';
import {
  generateAdminInvitationEmail,
  generateUserInvitationEmail,
} from '../template';

@Injectable()
export class EmailService {
  private transporter: Transporter | undefined;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Inicializa el transporter de nodemailer con la configuración del .env
   */
  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });

    // Verificar conexión
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Error en configuración de email:', error);
      } else {
        this.logger.log('Servidor SMTP conectado correctamente');
      }
    });
  }

  /**
   * Envía un email simple
   * @param to Destinatario
   * @param subject Asunto
   * @param html Contenido HTML
   */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }
      await this.transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.user}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email enviado a ${to}`);
    } catch (error) {
      this.logger.error(`Error al enviar email a ${to}:`, error);
      throw error;
    }
  }

  /**
   * Envía un email a múltiples destinatarios
   * @param to Lista de destinatarios
   * @param subject Asunto
   * @param html Contenido HTML
   */
  async sendEmailToMultiple(
    to: string[],
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }
      await this.transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.user}>`,
        to: to.join(','),
        subject,
        html,
      });

      this.logger.log(`Email enviado a ${to.length} destinatarios`);
    } catch (error) {
      this.logger.error(`Error al enviar email múltiple:`, error);
      throw error;
    }
  }

  /**
   * Envía un email con adjuntos
   * @param to Destinatario
   * @param subject Asunto
   * @param html Contenido HTML
   * @param attachments Array de adjuntos
   */
  async sendEmailWithAttachments(
    to: string,
    subject: string,
    html: string,
    attachments: any[],
  ): Promise<void> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }
      await this.transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.user}>`,
        to,
        subject,
        html,
        attachments,
      });

      this.logger.log(`Email con adjuntos enviado a ${to}`);
    } catch (error) {
      this.logger.error(`Error al enviar email con adjuntos a ${to}:`, error);
      throw error;
    }
  }

  /**
   * Envía email de invitación a administrador de organización
   * @param to Email del admin invitado
   * @param adminFullName Nombre completo del admin
   * @param invitationLink Link para aceptar la invitación
   */
  async sendOrgAdminInvitationEmail(
    to: string,
    adminFullName: string,
    invitationLink: string,
  ): Promise<void> {
    const html = generateAdminInvitationEmail({
      adminEmail: to,
      organizationName: 'Tu Organización',
      invitationLink,
      expiryDays: 7,
    });

    await this.sendEmail(to, 'Invitación de Administrador - Biotasys', html);
  }

  /**
   * Envía email de invitación a profesional o lab operator
   * @param to Email del usuario invitado
   * @param organizationName Nombre de la organización
   * @param userRole Rol del usuario ('professional' | 'lab_operator')
   * @param invitationLink Link para aceptar la invitación
   */
  async sendUserInvitationEmail(
    to: string,
    organizationName: string,
    userRole: 'professional' | 'lab_operator',
    invitationLink: string,
  ): Promise<void> {
    const html = generateUserInvitationEmail({
      userEmail: to,
      organizationName,
      userRole,
      invitationLink,
      expiryDays: 7,
    });

    await this.sendEmail(to, 'Invitación para Biotasys', html);
  }
}

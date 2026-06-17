import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private app: any = null;

  constructor() {
    this.init();
  }

  private async init() {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT_JSON no configurado — notificaciones desactivadas');
      return;
    }
    try {
      const admin = await import('firebase-admin');
      if (!admin.default.apps.length) {
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.default.initializeApp({
          credential: admin.default.credential.cert(serviceAccount),
        });
      }
      this.app = admin.default;
      this.logger.log('Firebase Admin inicializado');
    } catch (e) {
      this.logger.error('Error inicializando Firebase Admin', e);
    }
  }

  async send(token: string, title: string, body: string, data?: Record<string, string>) {
    if (!this.app || !token) return;
    try {
      await this.app.messaging().send({
        token,
        notification: { title, body },
        data: data ?? {},
        android: { priority: 'high' },
      });
    } catch (e) {
      this.logger.error(`Error enviando notificación a ${token}`, e);
    }
  }
}

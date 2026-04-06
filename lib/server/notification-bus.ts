import { EventEmitter } from 'events';

export interface LiveNotificationPayload {
  id: string;
  type: string;
  title: string;
  text: string;
  href: string;
  createdAt: string;
}

export interface LiveNotificationEvent {
  userId: string;
  notification: LiveNotificationPayload;
}

class NotificationBus extends EventEmitter {}

export const notificationBus = new NotificationBus();

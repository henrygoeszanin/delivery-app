export interface Notification {
  id: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

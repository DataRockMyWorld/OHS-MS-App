export type NotificationType =
  | 'incident_assigned'
  | 'ca_assigned'
  | 'ca_overdue'
  | 'investigation_assigned'
  | 'investigation_overdue'
  | 'general';

export interface Notification {
  id: string;
  notification_type: NotificationType;
  title: string;
  body: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

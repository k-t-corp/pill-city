import User from "./User";

export default interface Notification {
  notified_summary: string;
  created_at_seconds: number;
  id: string;
  notified_href: string;
  notified_deleted: boolean;
  notifier: User;
  notifying_deleted: boolean;
  notifying_summary: string;
  unread: boolean;
  notifying_action: string;

}

import User from "./User";

export type NotifyingAction = 'comment' | 'mention' | 'reaction' | 'reshare' | 'follow'

export default interface Notification {
  notified_summary: string;
  created_at_seconds: number;
  id: string;
  notified_href: string;
  notified_deleted: boolean;
  notifier: User;
  notifier_blocked: boolean;
  notifying_deleted: boolean;
  notifying_summary: string;
  unread: boolean;
  notifying_action: NotifyingAction;
}

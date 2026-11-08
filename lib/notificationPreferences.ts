import { NotificationPriorities } from "./actions/notifications/notificationTypes";

export function normaliseNotificationPreferences(value: unknown): Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
export type NotificationPreferenceType = {
    enabled: boolean,
    priority: NotificationPriorities[],
}

export type NotificationPreferencesType = {
    [key: string]: NotificationPreferenceType
}
import { NotificationPriorities } from "./notificationTypes";

export function normaliseNotificationPreferences(value: unknown): Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
export type DefaultNotificationPreferenceType = {
    enabled: boolean,
    priority: NotificationPriorities[],
}

export type NotificationPreferencesType = {
    email: DefaultNotificationPreferenceType,
    telegram: DefaultNotificationPreferenceType & {
        chatId: string | null,
    }
}

export const defaultNotificationPreferences: NotificationPreferencesType = {
    email: {
        enabled: true,
        priority: ["high", "medium"],
    },
    telegram: {
        enabled: false,
        priority: ["high"],
        chatId: null,
    }
}
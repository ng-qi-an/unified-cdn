import { defaultNotificationPriorities } from "../notifications/defaultNotficationProrities"
import { NotificationPriorities, NotificationType } from "../notifications/notificationTypes"

export type SiteConfigType = {
    general: {
        timezone: string,
    },
    auth: {
        allowSignups: boolean,
        defaultUserRole: string,
    }
    notifications: {
        priorities: {
            [Type in NotificationType]: NotificationPriorities
        },
        methods: {
            email: {
                linked: boolean,
                resendApiKey: string | null,
                emailOrigin: string | null
            },
            telegram?: {
                linked: boolean,
                telegramBotToken: string | null,
                telegramBotUsername: string | null,
                webhookBaseUrl: string | null,
            }
        }
    },
}

export const defaultSiteConfig: SiteConfigType = {
    general: {
        timezone: "UTC",
    },
    auth: {
        allowSignups: false,
        defaultUserRole: "user",
    },
    notifications: {
        priorities: defaultNotificationPriorities,
        methods: {
            email: {
                linked: false,
                resendApiKey: null,
                emailOrigin: null
            },
            telegram: {
                linked: false,
                telegramBotToken: null,
                telegramBotUsername: null,
                webhookBaseUrl: null,
            }
        }
    },
}
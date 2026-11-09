export type SiteConfigType = {
    general: {
        timezone: string,
    },
    auth: {
        allowSignups: boolean,
        defaultUserRole: string,
    }
    notifications: {
        methods: {
            email: {
                resendApiKey: string | null,
                emailOrigin: string | null
            },
            telegram?: {
                telegramBotToken: string | null,
                webhookActive: boolean,
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
        methods: {
            email: {
                resendApiKey: null,
                emailOrigin: null
            },
            telegram: {
                telegramBotToken: null,
                webhookActive: false,
            }
        }
    },
}
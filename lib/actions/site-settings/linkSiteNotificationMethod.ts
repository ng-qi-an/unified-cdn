import { Resend } from "resend";
import getSiteConfig from "./getSiteConfig";
import saveSiteConfig from "./saveSiteConfig";
import { SiteConfigType } from "./siteConfigType";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";

export type LinkNotificationMethodArgs = 
    ["email", Omit<SiteConfigType["notifications"]["methods"]["email"], "linked">] | 
    ["telegram", Omit<NonNullable<SiteConfigType["notifications"]["methods"]["telegram"]>, "linked">];
 

export default async function linkSiteNotificationMethod(...[method, value]: LinkNotificationMethodArgs){
    const siteConfig = await getSiteConfig();
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user){
        throw new Error("Unauthorised.")
    }
    const hasPermission = await userHasPermissionServer({siteConfig: ["update"]}, session.user);
    if (!hasPermission.isAuthorised) {
        throw new Error("Unauthorised")
    }
    if (!value){
        throw new Error("Value must be provided for linking notification method.");
    }
    if (method == "email"){
        if (!value.resendApiKey || !value.emailOrigin){
            throw new Error("Resend API Key and Email Origin must be provided for linking email notification method.");
        }
        if (value.resendApiKey != siteConfig.notifications.methods.email.resendApiKey || value.emailOrigin != siteConfig.notifications.methods.email.emailOrigin){
            const resend = new Resend(value.resendApiKey!);
            const { error } = await resend.emails.send({
                from: (value).emailOrigin!,
                to: session.user.email,
                subject: "Unified CDN Email Notifications Test",
                html: `<h1>This is a test email</h1><p>This email was sent to verify that Resend was set up on Unified CDN correctly. You can safely ignore this email.</p>`
            });
            if (error){
                if (error.name == "validation_error"){
                    throw new Error(error.message);
                } else {
                    throw new Error(`An unknown error occured: ${error.name} - ${error.message}`);
                }
            }
        }
    } else if (method == "telegram"){
        if (!value.telegramBotToken || !value.webhookBaseUrl){
            throw new Error("Telegram Bot Token and Webhook Base URL must be provided for linking telegram notification method.");
        }
        try {
            const response = await fetch(`https://api.telegram.org/bot${value.telegramBotToken}/getMe`);
            if (!response.ok){
                if (response.status == 401){
                    throw new Error("Invalid Telegram Bot Token.");
                } else {
                    throw new Error("An error occurred while checking the Telegram Bot Token.");
                }
            }
            const data = await response.json();
            if (!data.result.is_bot){
                throw new Error("The provided token does not belong to a bot.");
            }
            if (!value.telegramBotUsername){
                value.telegramBotUsername = data.result.username;
            }
        } catch (error) {
            throw new Error("An error occurred while checking the Telegram Bot Token.");
        }

        if (value.webhookBaseUrl != siteConfig.notifications.methods.telegram?.webhookBaseUrl){
            try {
                const response = await fetch(`https://api.telegram.org/bot${value.telegramBotToken}/getMe`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url: `${value.webhookBaseUrl}/api/dashboard/notifications/telegram/webhook`
                    })
                });
                if (!response.ok){
                    if (response.status == 401){
                        throw new Error("Invalid Telegram Bot Token.");
                    } else if (response.status == 400){ 
                        const errorData = await response.json();
                        if (errorData.description.includes("Failed to resolve host")){
                            throw new Error("Invalid Webhook URL. Make sure your URL is publicly accessible and Unified CDN is updated.");
                        } else {
                            throw new Error("An error occurred while updating webhook: "+errorData.description);
                        }
                    } else {
                        throw new Error("An error occurred while updating webhook.");
                    }
                }
            } catch (error) {
                console.error("Error updating Telegram webhook:", error);
                throw new Error("An error occurred while updating the Telegram webhook.");
            }
        }
    } else {
        throw new Error("Invalid notification method.");
    }
    await saveSiteConfig("notifications", {
        notifications: {
            ...siteConfig.notifications,
            methods: {
                ...siteConfig.notifications.methods,
                [method]: {...value, linked: true}
            }
        }
    })
}
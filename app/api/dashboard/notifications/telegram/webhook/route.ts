import { defaultNotificationPreferences, NotificationPreferencesType } from "@/lib/actions/notifications/notificationPreferences";
import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";
import { db } from "@/lib/db";
import { InvalidConfigurationError } from "@/lib/errors";
import { errorToResponse } from "@/lib/permissions/serverPermissionHelpers";
import { user } from "@/lib/schema/auth-schema";
import { telegramLinkCodes } from "@/lib/schema/schema";
import { eq } from "drizzle-orm";

export const POST = async (req: Request) => {
    const siteConfig = await getSiteConfig();
    console.log("Received Telegram webhook");
    if (siteConfig.notifications.methods.telegram?.linked !== true) {
        return Response.json({success: false, error: "Telegram notifications are not enabled."}, {status: 200});
    }
    const data = await req.json();
    if (!data.message){
        return Response.json({success: false, error: "Invalid data received from Telegram webhook."}, {status: 200});
    }
    const text = data.message.text
    if (text.startsWith("/start")){
        const code = text.split(" ")[1];
        if (!code){
            console.log("No code provided in /start command.");
            return Response.json({success: false, error: "Invalid code provided."}, {status: 200});
        }
        const chatId = data.message.chat.id;
        try {
            const [codeData] = await db.select().from(telegramLinkCodes).where(eq(telegramLinkCodes.code, code));
            if (!codeData){
                console.log("Invalid code provided in /start command:", code);
                const response = await fetch(`https://api.telegram.org/bot${siteConfig.notifications.methods.telegram?.telegramBotToken}/sendMessage`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        parse_mode: "MarkdownV2",
                        text: `❌ Your code is invalid\\. Try running the link process again\\.`
                    })
                })
                if (!response.ok) {
                    const errorData = await response.json();
                    console.log(response)
                    console.error("Error sending message to Telegram:", errorData);
                    console.error("Error sending message to Telegram:", response.statusText);
                }
                return Response.json({success: false, error: "Invalid code provided."}, {status: 200});
            }
            await db.delete(telegramLinkCodes).where(eq(telegramLinkCodes.code, code));
            const [userData] = await db.select({name: user.name, notif_preferences: user.notif_preferences}).from(user).where(eq(user.id, codeData.userId));
            if (!userData){
                console.log("User data not found for code:", code);
                const response = await fetch(`https://api.telegram.org/bot${siteConfig.notifications.methods.telegram?.telegramBotToken}/sendMessage`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        parse_mode: "MarkdownV2",
                        text: `❌ Your code is invalid\\. Try running the link process again\\.`
                    })
                })
                if (!response.ok) {
                    console.error("Error sending message to Telegram:", response.statusText);
                }
                return Response.json({success: false, error: "User data not found."}, {status: 200});
            }
            const notifPreferences = userData.notif_preferences as NotificationPreferencesType || {};
            await db.update(user).set({notif_preferences: {
                ...notifPreferences,
                telegram: {
                    ...notifPreferences.telegram,
                    enabled: true,
                    chatId: chatId.toString(),
                    priority: notifPreferences.telegram?.priority || defaultNotificationPreferences.telegram.priority
                }
            }}).where(eq(user.id, codeData.userId));
            const response = await fetch(`https://api.telegram.org/bot${siteConfig.notifications.methods.telegram?.telegramBotToken}/sendMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    parse_mode: "MarkdownV2",
                    text: `✅ Welcome\\, ${userData.name}\\! You will now receive notifications from Unified CDN here\\.`
                })
            })
            if (!response.ok) {
                console.error("Error sending message to Telegram:", response.statusText);
            }
            return Response.json({success: true}, {status: 200});
        } catch (error) {
            console.error("Error processing Telegram webhook:", error);
            return Response.json({success: false, error: "An error occurred while processing the Telegram webhook."}, {status: 200});
        }
    }
    return Response.json({success: true}, {status: 200});
}
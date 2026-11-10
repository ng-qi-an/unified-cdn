'use server';
import { auth } from "@/lib/auth";
import { defaultNotificationPreferences, NotificationPreferencesType } from "./notificationPreferences";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user } from "@/lib/schema/auth-schema";
import { eq } from "drizzle-orm";

export default async function unlinkNotificationMethodClient(method: keyof NotificationPreferencesType) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Unauthorised");
    }
    await db.update(user).set({
        notif_preferences: {
            ...session.user.notif_preferences,
            [method]: defaultNotificationPreferences[method]
        }
    }).where(eq(user.id, session.user.id));
    return true;
}
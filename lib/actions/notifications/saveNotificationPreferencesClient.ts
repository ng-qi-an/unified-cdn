'use server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NotificationPreferencesType } from "./notificationPreferences";
import { db } from "@/lib/db";
import { user } from "@/lib/schema/auth-schema";
import { eq } from "drizzle-orm";

export default async function saveNotificationPreferencesClient<K extends keyof NotificationPreferencesType>(method: K, value: Partial<NotificationPreferencesType[K]>) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Unauthorised");
    }
    await db.update(user).set({
        notif_preferences: {
            ...session.user.notif_preferences,
            [method]: {
                ...session.user.notif_preferences[method],
                ...value
            }
        }
    }).where(eq(user.id, session.user.id));
    return true;
}
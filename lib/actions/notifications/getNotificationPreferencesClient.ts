'use server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function getNotificationPreferencesClient() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Unauthorised");
    }
    return session.user.notif_preferences;
}
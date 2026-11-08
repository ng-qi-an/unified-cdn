'use server';
import { db } from "@/lib/db";
import { notifications } from "@/lib/schema/schema";
import { eq } from "drizzle-orm";

export default async function markAllNotificationsReadClient(userId: string) {
    await db.update(notifications).set({read: true}).where(eq(notifications.userId, userId));
    return true;
}
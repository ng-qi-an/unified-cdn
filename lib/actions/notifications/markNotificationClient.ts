'use server';

import { db } from "@/lib/db";
import { notifications } from "@/lib/schema/schema";
import { eq } from "drizzle-orm";

export default async function markNotificationClient(notificationId: string, read: boolean) {
    await db.update(notifications).set({read}).where(eq(notifications.id, notificationId));
    return true;
}
'use server';

import { db } from "@/lib/db";
import { notifications } from "@/lib/schema/schema";
import { and, count, desc, eq, isNotNull } from "drizzle-orm";

export default async function getNotificationsClient(userId: string, {page=1, limit=0, showUnreadOnly=false}: {page: number, limit: number, showUnreadOnly?: boolean}) {
    const userNotifs = await db.select().from(notifications).where(and(eq(notifications.userId, userId), showUnreadOnly ? eq(notifications.read, false) : isNotNull(notifications.read))).orderBy(desc(notifications.createdAt)).limit(limit).offset((page - 1) * limit);
    const [{ total }] = await db.select({total: count(notifications.id)}).from(notifications).where(and(eq(notifications.userId, userId), showUnreadOnly ? eq(notifications.read, false) : isNotNull(notifications.read)));
    return {notifications: userNotifs, total};
}
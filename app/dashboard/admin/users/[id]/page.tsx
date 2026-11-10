import UserPageClient from "./client";
import { db } from "@/lib/db";
import { normaliseNotificationPreferences } from "@/lib/actions/notifications/notificationPreferences";
import { session, user } from "@/lib/schema/auth-schema";
import { desc, eq } from "drizzle-orm";

export const instant = false;

export default async function UserPage({params}: {params: Promise<{id: string}>}) {
    const { id } = await params;
    const [userRecord] = await db.select().from(user).where(eq(user.id, id));
    const sessions = await db.select().from(session).where(eq(session.userId, id)).orderBy(desc(session.createdAt))
    return <UserPageClient user={{...userRecord, notif_preferences: normaliseNotificationPreferences(userRecord.notif_preferences)}} sessions={sessions}/>;
}
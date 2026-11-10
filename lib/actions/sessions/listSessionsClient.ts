'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { session } from "@/lib/schema/auth-schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function listSessionsClient() {
    const data = await auth.api.getSession({
        headers: await headers()
    })
    if (!data || !data.user){
        throw new Error("Unauthorised")
    }
    const sessions = await db.select().from(session).where(eq(session.userId, data.user.id)).orderBy(desc(session.createdAt));
    return sessions;
}
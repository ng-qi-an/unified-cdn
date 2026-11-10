'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { telegramLinkCodes } from "@/lib/schema/schema";
import { generateId } from "better-auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function createTelegramCodeClient(){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Unauthorised");
    }
    const code = generateId(5).toUpperCase();
    await db.insert(telegramLinkCodes).values({
        code,
        userId: session.user.id
    }).onConflictDoUpdate({
        target: telegramLinkCodes.userId,
        set: {
            code,
        }
    })
    return code;
}

export async function deleteTelegramCodeClient(){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Unauthorised");
    }
    const res = await db.delete(telegramLinkCodes).where(eq(telegramLinkCodes.userId, session.user.id));
    if (res.rowCount === 0) {
        throw new Error("Code not found or unauthorised");
    }
    return true;
}
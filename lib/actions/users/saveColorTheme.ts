'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/schema/auth-schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function saveColorTheme(color: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Unauthorised");
    }
    await db.update(user).set({theme: color}).where(eq(user.id, session.user.id));
}
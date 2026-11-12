'use server';

import { auth } from "../auth";
import { db } from "../db";
import { user } from "../schema/auth-schema";

export default async function createFirstAdminClient({name, email, password}: {name: string, email: string, password: string}) {
    const users = await db.select().from(user);
    if (users.length > 0){
        throw new Error("First admin user already exists.");
    }
    const newUser = await auth.api.createUser({
        body: {
            email,
            password,
            name,
            role: "superAdmin",
        },
    });
    return newUser;
}
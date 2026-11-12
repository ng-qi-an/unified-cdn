import { db } from "@/lib/db";
import { user } from "@/lib/schema/auth-schema";
import { redirect } from "next/navigation";

export const instant = false;

export default async function SetupAdminLayout({children}: {children: React.ReactNode}) {
    const users = await db.select().from(user);
    if (users.length > 0){
        return redirect("/setup/general");
    } else {
        return children
    }
}
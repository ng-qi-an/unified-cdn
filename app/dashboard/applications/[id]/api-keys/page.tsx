import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import KeysList from "./KeysList";
import { db } from "@/lib/db";
import { apikey } from "@/lib/schema/auth-schema";
import { eq, isNotNull } from "drizzle-orm";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";

export const metadata = {
    title: 'API Keys',
};


export const instant = false;

export default async function APIKeysApplication({params}: {params: Promise<{id: string}>}){
    const {id: appId} = await params;

    const viewAllPerms = await userHasPermissionServer({
        applications: ["viewAll"]
    })
    const apiKeys = await db.select().from(apikey).where(viewAllPerms.isAuthorised ? isNotNull(apikey.id) : eq(apikey.referenceId, viewAllPerms.user.id));
    const filteredKeys = apiKeys.filter((key)=> JSON.parse(key.metadata ?? "{}").appId === appId);
    const appData = await db.query.applications.findFirst({
        where: {
            id: appId
        },
        columns: {
            status: true
        },
    })
    return <div className="pt-4">
        <KeysList appId={appId} disableCreate={appData!.status != "active"} apiKeys={filteredKeys as unknown as Omit<typeof apikey.$inferSelect, "key">[]}/>
    </div>
}
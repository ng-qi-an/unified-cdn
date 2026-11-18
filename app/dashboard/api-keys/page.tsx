import ClientApiKeysPage from "./client";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import { db } from "@/lib/db";
import { apikey } from "@/lib/schema/auth-schema";
import { Metadata } from "next";
import { checkUserHasHigherPerms } from "@/lib/permissions/permissionHelpers";

export const instant = false;

export const metadata: Metadata = {
    title: 'API Keys',
};

export default async function Apikeys({searchParams}: {searchParams: Promise<{view: string}>}){

    const {view} = await searchParams;
    const viewAllPerms = await userHasPermissionServer({
        applications: ["viewAll"]
    })
    const apiKeys = await db.query.apikey.findMany({
        where: {
            referenceId: viewAllPerms.isAuthorised && view == "admin" ? {isNotNull: true} : viewAllPerms.user.id
        },
        columns: {
            key: false
        }
    })
    const fetchedApps = (await db.query.applications.findMany({
        where: {
            ownerId: viewAllPerms.isAuthorised && view == "admin" ? { isNotNull: true } : viewAllPerms.user.id
        },
        columns: {
            id: true,
            name: true,
            status: true,
        },
        with: {
            owner: {
                columns: {
                    name: true,
                    id: true,
                    role: true
                }
            }
        }
    })).filter((app)=>{
        if (checkUserHasHigherPerms(viewAllPerms.user.role ?? "user", app.owner!.role ?? "user")){
            return true;
        }
    })
    const sortedApiKeys: {[appId: string]: Omit<typeof apikey.$inferSelect, "key">[]} = {}
    for (const app of fetchedApps) {
        sortedApiKeys[app.id] = apiKeys.filter(
            (key) => key.metadata && JSON.parse(key.metadata).appId === app.id
        )
    }
    return <ClientApiKeysPage sortedApiKeys={sortedApiKeys} showAllApps={viewAllPerms.isAuthorised && view == "admin"} fetchedApps={fetchedApps} userId={viewAllPerms.user.id} showAdmin={viewAllPerms.isAuthorised}/>;
}
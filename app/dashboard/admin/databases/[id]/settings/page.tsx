import { db } from "@/lib/db";
import AppSettingsRendered from "./rendered";
import { databases } from "@/lib/schema/schema";
import { Metadata } from "next";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import { redirect } from "next/navigation";
import { checkUserHasHigherPerms } from "@/lib/permissions/permissionHelpers";

export const instant = false;

export const metadata: Metadata = {
    title: 'Settings',
};

export default async function DbSettings({params}:{params: Promise<{id: string}>}){
    const { id } = await params;
    const dbData = await db.query.databases.findFirst({
        where: { id },
        with: {
            files: {
                columns: {
                    size: true
                }
            },
            owner: {
                columns: {
                    role: true
                }
            }
        }
    })
    const otherDbs = await db.select({name: databases.name, id: databases.id}).from(databases)
    const viewAllPerms = await userHasPermissionServer({databases: ["viewAll"]});
    if (dbData?.ownerId != viewAllPerms.user.id && !checkUserHasHigherPerms(viewAllPerms.user.role ?? "user", dbData?.owner?.role ?? "user")) {
        return redirect(`/dashboard/admin/databases/${id}`);
    }
    return <AppSettingsRendered dbData={dbData!} otherDbs={otherDbs}/>
}
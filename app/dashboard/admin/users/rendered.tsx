import { db } from "@/lib/db";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import { user } from "@/lib/schema/auth-schema";
import { normaliseNotificationPreferences } from "@/lib/actions/notifications/notificationPreferences";
import { desc } from "drizzle-orm";
import UsersClientPage from "./client";

export default async function RenderedUsers(){
    const users = await db.select().from(user).orderBy(desc(user.createdAt))
    const usersWithPreferences = users.map((userRecord) => ({...userRecord, notif_preferences: normaliseNotificationPreferences(userRecord.notif_preferences)}));
    const banUserPerms = await userHasPermissionServer({user: ["ban"]})
    const deleteUserPerms = await userHasPermissionServer({user: ["delete"]})
    return <UsersClientPage users={usersWithPreferences} banUserAuth={banUserPerms.isAuthorised} deleteUserAuth={deleteUserPerms.isAuthorised} user={deleteUserPerms.user}/>
}
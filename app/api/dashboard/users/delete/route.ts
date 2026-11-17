import { makeAuditLog } from "@/lib/actions/logs/makeAuditLog";
import sendNotification from "@/lib/actions/notifications/sendNotification";
import deleteUser from "@/lib/actions/users/deleteUser";
import { db } from "@/lib/db";
import { InsufficientPermissionsError, NotFoundError } from "@/lib/errors";
import { checkUserHasHigherPerms } from "@/lib/permissions/permissionHelpers";
import { errorToResponse, userHasPermissionServer, verifyUser } from "@/lib/permissions/serverPermissionHelpers";

export const DELETE = verifyUser(async(req: Request, ctx, user) => {
    const deleteUserPerms = await userHasPermissionServer({user: ["delete"]}, user);
    if (!deleteUserPerms.isAuthorised) {
        return errorToResponse(new InsufficientPermissionsError("You do not have permission to delete users."));
    }
    const data = await req.json();
    if (!data.userId) {
        return errorToResponse(new InsufficientPermissionsError("No user ID provided."));
    }
    const targetUserId = data.userId;
    if (targetUserId === user.id) {
        return errorToResponse(new InsufficientPermissionsError("You cannot delete yourself."));
    }
    const targetUser = await db.query.user.findFirst({
        where: {
            id: targetUserId
        },
        with: {
            applications: {
                with: {
                    files: {
                        columns: {
                            id: true,
                            key: true
                        }
                    },
                    database: {
                        columns: {
                            keys: true,
                            provider: true
                        }
                    }
                }
            },
            databases: {
                with: {
                    files: {
                        columns: {
                            id: true,
                            key: true
                        }
                    }
                }
            }
        }
    })
    if (!targetUser) {
        return errorToResponse(new NotFoundError("User not found."));
    }
    if (!checkUserHasHigherPerms(user.role!, targetUser.role!)) {
        return errorToResponse(new InsufficientPermissionsError("You do not have permission to delete this user."));
    }
    // Delete user applications first
    const response = await deleteUser(targetUser);
    if (response.error) {
        return Response.json({error: response.error, message: response.message, details: response.details}, {status: 500});
    }
    await makeAuditLog({userId: user.id, code: "USER_DELETED", data: {user: {id: targetUser.id, name: targetUser.name}}});
    await sendNotification("USER_DELETED_ADMIN", {user: {name: targetUser.name}, userGroup: "admins", triggerUser: {id: user.id, name: user.name}});
    await sendNotification("USER_DELETED_USER", {specificUsers: [targetUser], triggerUser: {id: user.id, name: user.name}});
    return Response.json({status: "success", message: "User and associated databases/applications deleted successfully.", details: response.details}, {status: 200});
})
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "@/components/ui/toast";
import { makeAuditLogClient } from "@/lib/actions/logs/makeAuditLogClient";
import sendNotificationClient from "@/lib/actions/notifications/sendNotificationsClient";
import { authClient } from "@/lib/auth-client";
import { generateId } from "better-auth";
import { Copy, RefreshCcw } from "lucide-react";
import { useState } from "react";

export default function ChangePasswordDialog({userId, userName, userEmail, userNotifPreferences,  open, onOpenChange}: {userId: string, userName: string, userEmail: string, userNotifPreferences: any, open: boolean, onOpenChange: (open: boolean) => void}){
    const [password, setPassword] = useState("");
    const [revokeSessions, setRevokeSessions] = useState(true);
    const [sendNewPassword, setSendNewPassword] = useState(true);
    const { data } = authClient.useSession();
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <form className="contents" onSubmit={async(e)=>{
                e.preventDefault();
                onOpenChange(false);
                const { error } = await authClient.admin.setUserPassword({
                    newPassword: password,
                    userId: userId,
                });
                if (error) {
                    return toast.add({
                        title: "Error changing password",
                        description: error.message,
                        type: "error",
                    })
                } else {
                    if (revokeSessions){
                        const { error: error2 } = await authClient.admin.revokeUserSessions({
                            userId: userId,
                        });
                        if (error2) {
                            toast.add({
                                title: "Error revoking sessions",
                                description: error2.message,
                                type: "error",
                            })
                        }
                    }
                    await makeAuditLogClient({userId: data!.user.id, code: "USER_PASSWORD_CHANGED", data: {user: {id: userId, name: userName}}});
                    await sendNotificationClient({type: "USER_PASSWORD_CHANGED_ADMIN", user: {name: userName}, triggerUser: {id: data!.user.id, name: data!.user.name}, userGroup: "admins", link: `/dashboard/admin/users/${userId}`});
                    await sendNotificationClient({type: "USER_PASSWORD_CHANGED_USER", newPassword: sendNewPassword ? password : undefined, triggerUser: {id: data!.user.id, name: data!.user.name}, specificUsers: [{name: userName, id: userId, email: userEmail, notif_preferences: userNotifPreferences}], link: `/auth/sign-in`});
                    return toast.add({
                        title: "Success",
                        description: "The user's password has been changed successfully.",
                        type: "success",
                    })
                }
            }}>
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <FieldGroup>
                    <Field>
                        <FieldLabel>New Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput required type="text" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton onClick={()=>{
                                    setPassword(generateId(16).toUpperCase())
                                }}>
                                    <RefreshCcw/>
                                </InputGroupButton>
                                <InputGroupButton onClick={()=>{
                                    navigator.clipboard.writeText(password)
                                    toast.add({
                                        title: "Copied to clipboard",
                                        type: "success",
                                    })
                                }}>
                                    <Copy/>
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                        <FieldDescription>This password will not be shown again. Copy it first.</FieldDescription>
                    </Field>
                    <Field orientation="horizontal">
                        <FieldLabel htmlFor="revokeSessionsCheck">Revoke sessions</FieldLabel>
                        <Checkbox id="revokeSessionsCheck" checked={revokeSessions} onCheckedChange={(x) => setRevokeSessions(x)}/>
                    </Field>
                    <Field orientation="horizontal">
                        <FieldLabel htmlFor="sendNewPasswordCheck">Send new password</FieldLabel>
                        <Checkbox id="sendNewPasswordCheck" checked={sendNewPassword} onCheckedChange={(x) => setSendNewPassword(x)}/>
                    </Field>
                </FieldGroup>
                <DialogFooter>
                    <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        Confirm
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}
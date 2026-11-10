import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import revalidateData from "@/lib/revalidateData";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-static";
import { useState } from "react";

export default function ChangePasswordDialog({open, onOpenChange}: {open: boolean, onOpenChange: (open: boolean) => void}){
    const [currentPassword, setCurrentPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [newPasswordBlured, setNewPasswordBlured] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    return <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <form className="contents" onSubmit={async(e)=>{
                e.preventDefault();
                setSubmitting(true);
                const {error} = await authClient.changePassword({
                    currentPassword,
                    newPassword
                })
                if (error){
                    console.log(error);
                    setSubmitting(false);
                    return toast.add({
                        title: "Error changing password",
                        description: error.message == "Invalid password" ? "Current password is incorrect." : error.message || "An unknown error occurred.",
                        type: "error"
                    })
                }
                setSubmitting(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setNewPasswordBlured(false);
                onOpenChange(false);
                toast.add({
                    title: "Password changed",
                    description: "Your password has been changed successfully.",
                    type: "success"
                })
                await revalidateData(window.location.pathname);
            }}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Change password</AlertDialogTitle>
                </AlertDialogHeader>
                <FieldGroup>
                    <Field>
                        <FieldLabel>Current password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} placeholder="Enter your current password"/>
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton onClick={()=>setShowCurrentPassword(!showCurrentPassword)}>{showCurrentPassword ? <EyeOff/> : <Eye/>}</InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                    </Field>
                    <Field>
                        <FieldLabel>New password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput onBlur={()=> setNewPasswordBlured(true)} minLength={8} type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="Enter your new password"/>
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton onClick={()=>setShowNewPassword(!showNewPassword)}>{showNewPassword ? <EyeOff/> : <Eye/>}</InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                        {newPasswordBlured && newPassword.length < 8 ? <FieldError>A minimum of 8 characters is required.</FieldError> :  confirmNewPassword.length > 0 && newPassword !== confirmNewPassword ? <FieldError>Passwords do not match</FieldError> : <FieldDescription>Must be at least 8 characters</FieldDescription>}
                    </Field>
                    <Field>
                        <FieldLabel>Confirm new password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput minLength={8} type={showConfirmNewPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e)=>setConfirmNewPassword(e.target.value)} placeholder="Confirm your new password"/>
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton onClick={()=>setShowConfirmNewPassword(!showConfirmNewPassword)}>{showConfirmNewPassword ? <EyeOff/> : <Eye/>}</InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                        {confirmNewPassword.length > 0 && newPassword !== confirmNewPassword && <FieldError>Passwords do not match</FieldError>}
                    </Field>
                </FieldGroup>
                <AlertDialogFooter>
                    <AlertDialogCancel type="button">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction type="submit" disabled={submitting || newPassword.length < 8 || newPassword !== confirmNewPassword}>
                        Change password
                    </AlertDialogAction>
                </AlertDialogFooter>
            </form>
        </AlertDialogContent>
    </AlertDialog>
}
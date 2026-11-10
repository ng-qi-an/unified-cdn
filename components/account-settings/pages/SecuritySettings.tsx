import { Button } from "@/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { User } from "@/lib/schema/schemaTypes";
import { useState } from "react";
import ChangePasswordDialog from "../dialogs/ChangePasswordDialog";

export default function SecuritySettings({user}: {user: User}){
    const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
    return <>
        <DialogHeader>
            <DialogTitle>Security</DialogTitle>
            <DialogDescription>Manage your authentication methods</DialogDescription>
        </DialogHeader>
        <ChangePasswordDialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog} />
        <div className="flex flex-col h-full overflow-auto scroll-fade pt-4 gap-4">
            <FieldGroup>
                <Field>
                    <FieldLabel>Password</FieldLabel>
                    <Button variant="outline" size="sm" className="w-max! mt-1" onClick={()=> setShowChangePasswordDialog(true)}>Change password</Button>
                </Field>
                <Field>
                    <FieldLabel>Two-factor authentication</FieldLabel>
                    <FieldDescription>Coming soon</FieldDescription>
                </Field>
                <Field>
                    <FieldLabel>Third-party providers</FieldLabel>
                    <FieldDescription>Coming soon</FieldDescription>
                </Field>
            </FieldGroup>
        </div>
    </>
}
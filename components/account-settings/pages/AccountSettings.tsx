import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { User } from "@/lib/schema/schemaTypes";
import { useState } from "react";

export default function AccountSettings({user}: {user: User}){
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    return <>
        <DialogHeader>
            <DialogTitle>Account</DialogTitle>
            <DialogDescription>Configure how your account appears</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-full overflow-auto scroll-fade pt-6 gap-4">
            <FieldGroup>
                <div>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </Field>
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Field>
                    </FieldGroup>
                </div>
            </FieldGroup>
        </div>
    </>
}
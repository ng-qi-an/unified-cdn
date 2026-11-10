import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/getInitials";
import revalidateData from "@/lib/revalidateData";
import { User } from "@/lib/schema/schemaTypes";
import { useEffect, useState } from "react";

export default function AccountSettings({user}: {user: User}){
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [changed, setChanged] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    useEffect(()=>{
        if (name !== user.name || email !== user.email){
            setChanged(true);
        } else {
            setChanged(false);
        }
    }, [name, email])
    return <>
        <DialogHeader>
            <DialogTitle>Account</DialogTitle>
            <DialogDescription>Configure how your account appears</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col h-full overflow-auto scroll-fade pt-4 gap-4" onSubmit={async(e)=>{
            e.preventDefault();
            if (!changed) return;
            setSubmitting(true);
            if (name !== user.name){
                const {data, error} = await authClient.updateUser({
                    name: name
                })
                if (error){
                    console.error(error);
                    setSubmitting(false);
                    return toast.add({
                        title: "Error updating name",
                        description: error.message,
                        type: "error"
                    })
                }
            }
            if (email !== user.email){
                const {data, error} = await authClient.changeEmail({
                    newEmail: email
                })
                if (error){
                    console.error(error);
                    setSubmitting(false);
                    return toast.add({
                        title: "Error updating email",
                        description: error.message,
                        type: "error"
                    })
                }
            }
            await revalidateData(window.location.pathname);
            toast.add({
                title: "Account updated",
                description: "Your account settings have been updated",
                type: "success"
            })
            setChanged(false);
            setSubmitting(false);
        }}>
            <FieldGroup>
                <div className="flex gap-6 flex-col sm:flex-row">
                    <Field className="w-auto">
                        <FieldLabel>Avatar</FieldLabel>
                        <Tooltip>
                            <TooltipTrigger>
                                <Avatar className="aspect-square w-full h-auto min-w-30 max-w-42 rounded-lg mt-3">
                                    <AvatarImage src={user.image || undefined} alt={user.name} />
                                    <AvatarFallback className="rounded-full">{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                Editing your avatar image is not supported yet.
                            </TooltipContent>
                        </Tooltip>
                    </Field>
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
            <div className="flex-1"/>
            <Button disabled={!changed || submitting} type="submit">
                Save
            </Button>
        </form>
    </>
}
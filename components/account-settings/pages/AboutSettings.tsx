import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { User } from "@/lib/schema/schemaTypes";

export default function AboutSettings({user}: {user: User}){
    return <>
        <DialogHeader>
            <DialogTitle>About</DialogTitle>
            <DialogDescription>Information about Unified CDN</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-full overflow-auto scroll-fade pt-4 gap-2">
            <FieldGroup>
                <Field>
                    <FieldLabel>Unified CDN</FieldLabel>
                    <FieldDescription>Version 1.0.0</FieldDescription>
                </Field>
            </FieldGroup>
        </div>
    </>
}
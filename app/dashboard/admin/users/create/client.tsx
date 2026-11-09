'use client';

import Dashboard from "@/components/navigation/Dashboard";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import DashboardSectionHeader from "@/components/navigation/DashboardSectionHeader";
import { useSiteConfig } from "@/components/providers/site-config-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { makeAuditLogClient } from "@/lib/actions/logs/makeAuditLogClient";
import sendNotificationClient from "@/lib/actions/notifications/sendNotificationsClient";
import { defaultSiteConfig } from "@/lib/actions/site-settings/siteConfigType";
import { authClient } from "@/lib/auth-client";
import { roles } from "@/lib/permissions/permissions";
import { generateId } from "better-auth";
import { Copy, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ClientUsersPage({fetchedUsers}: {fetchedUsers: {email: string}[]}){
    const siteConfig = useSiteConfig();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [sendPassword, setSendPassword] = useState(true);
    const [role, setRole] = useState<string>(siteConfig.auth.defaultUserRole);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { data } =  authClient.useSession();
    
    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Users", href: "/dashboard/admin/users"}, {name: "Create user"}]}/>
        <DashboardBody>
            <DashboardSectionHeader title="Create a user"/>
            <form className="w-full h-full flex flex-col min-h-0 mt-4" onSubmit={async(e)=>{
                e.preventDefault()
                if (!name  || name.trim() == "" || !email || email.trim() == "" || !password || password.trim() == ""){
                    return toast.add({
                        title: "Required fields missing or invalid",
                        description: "Please fill in all required fields and ensure there are no warnings before submitting.",
                        type: "error"
                    });
                }
                if (fetchedUsers.find(user => user.email == email)){
                    return;
                }
                setIsSubmitting(true);
                const { data: newUser, error } = await authClient.admin.createUser({
                    email: email.trim(),
                    password: password.trim(),
                    name: name.trim(),
                    role: role,
                });
                if (error){
                    setIsSubmitting(false);
                    return toast.add({
                        title: "Error creating user",
                        description: error.message || "An unknown error occurred while creating the user.",
                        type: "error"
                    });
                }
                setIsSubmitting(false);
                router.push("/dashboard/admin/users/"+newUser.user.id);
                await makeAuditLogClient({userId: data!.user.id, code: "USER_CREATED", data: {user: {id: newUser.user.id, name: newUser.user.name}}});
                await sendNotificationClient({type: "USER_CREATED_ADMIN", newUser: {name: newUser.user.name, role: role}, triggerUser: {id: data!.user.id, name: data!.user.name}, userGroup: "admins", link: `/dashboard/admin/users/${newUser.user.id}`});
                await sendNotificationClient({type: "USER_CREATED_USER", newUser: {name: newUser.user.name, email: newUser.user.email, password: sendPassword ? password : undefined}, triggerUser: {id: data!.user.id, name: data!.user.name}, specificUsers: [{...newUser.user, notif_preferences: {email: {enabled: true, priority: ["low", "medium", "high"]}}}], link: `/auth/sign-in`});
                return toast.add({
                    title: "User created",
                    description: "The user has been created successfully.",
                    type: "success"
                });
            }}>
                <div className="w-full h-full overflow-auto gap-1 space-y-2 xl:space-y-0 p-1">
                    <Card className="w-full h-max">
                        <CardHeader>
                            <CardTitle>General</CardTitle>
                            <CardDescription>Information about your new user</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Name</FieldLabel>
                                    <Input type="text" value={name} onChange={(e)=> setName(e.target.value)} required placeholder="John Doe"/>
                                </Field>
                                <Field>
                                    <FieldLabel>Email</FieldLabel>
                                    <Input type="email" value={email} onChange={(e)=> setEmail(e.target.value)} required placeholder="john.doe@gmail.com"/>
                                    {fetchedUsers.find((x)=> x.email == email.trim()) ? <FieldError>A user with this email already exists.</FieldError>: <FieldDescription>The email of your user. Must be unique.</FieldDescription>}
                                </Field>
                                <Field>
                                    <FieldLabel>Password</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput required type="text" placeholder="Enter a strong password" value={password} onChange={(e) => setPassword(e.target.value)}/>
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
                                </Field>
                                <Field orientation="horizontal">
                                    <div className="w-full space-y-1">
                                        <FieldLabel htmlFor="sendPassword">Send password</FieldLabel>
                                        <FieldDescription>Send the password to the new user's email</FieldDescription>
                                    </div>
                                    <Checkbox checked={sendPassword} id="sendPassword" onCheckedChange={(x) => setSendPassword(x)}/>
                                </Field>
                                <Field>
                                    <FieldLabel>Role</FieldLabel>
                                    <Select items={roles} onValueChange={(value)=> setRole(value!)} value={role} required>
                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role)=>{
                                                return <SelectItem value={role.value} key={role.value}>
                                                    <div className="flex flex-col">
                                                        <p className="font-medium">{role.label}</p>
                                                        <p className="text-muted-foreground">{role.description}</p>
                                                    </div>
                                                </SelectItem>
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <FieldDescription>{roles.find((r)=> r.value == role)?.description}</FieldDescription>
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <Link href="/dashboard/admin/users" className="w-full hidden md:block">
                        <Button disabled={isSubmitting} className="w-full" type="button" variant="secondary">
                            Cancel
                        </Button>
                    </Link>
                    <Button disabled={isSubmitting} className="w-full" type="submit">
                        Create User {isSubmitting && <Spinner/>}
                    </Button>
                </div>
            </form>
        </DashboardBody>
    </Dashboard>
}
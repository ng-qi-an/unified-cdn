'use client';

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/toast";
import createFirstAdminClient from "@/lib/setup/createFirstAdminClient";

export default function SetupAdmin(){
    const [step, setStep] = useState(0);
    const [mounted, setMounted] = useState(true);
    const router = useRouter();
    useEffect(()=> {
        setTimeout(()=> setMounted(true), 200)
    }, []);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    return <div className="flex flex-col h-screen w-full items-center justify-center">
        <AnimatePresence mode="wait">
            {mounted && <motion.div initial={{opacity: 0, y: 50}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 50, transition: {opacity: {duration: 0.1}}}} transition={{duration: 0.6, type: "spring"}} className="flex flex-col h-screen w-full items-center justify-center">
                <Card className="shrink-0 w-full max-w-[500px] bg-transparent ring-0">
                    <form className="contents" onSubmit={async(e)=>{
                        e.preventDefault();
                        if (step < 3){
                            setStep((step)=> step + 1)
                        } else {
                            if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || password != confirmPassword){
                                return toast.add({
                                    title: "Failed to submit",
                                    description: "Please fill out all fields and ensure no field is invalid.",
                                })
                            }
                            setSubmitting(true);
                            try {
                                await createFirstAdminClient({name, email, password})
                                toast.add({
                                    title: "Account created",
                                    description: "You can sign in later.",
                                    type: "success"
                                })
                                router.push("/setup/general")
                            } catch (e){
                                if (e instanceof Error){
                                    toast.add({
                                        title: "Failed to create admin",
                                        description: e.message,
                                    })
                                } else {
                                    console.error(e);
                                    toast.add({
                                        title: "Failed to create admin",
                                        description: "An unknown error occurred.",
                                    })
                                }
                            }
                            setSubmitting(false);
                        }
                    }}>
                        <CardHeader>
                            <CardTitle>Create an admin</CardTitle>
                            <CardDescription>Set up an account to manage the site.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <AnimatePresence mode="wait">
                                    <motion.div key={`admin-setup-step-${step}`} initial={{opacity: 0, y: 50}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -50, transition: {opacity: {duration: 0.1}}}} transition={{duration: 0.6, type: "spring"}} className="">
                                        {step == 0 ? <Field>
                                            <FieldLabel>Name</FieldLabel>
                                            <Input autoFocus placeholder="John Doe" required value={name} onChange={(e)=> setName(e.target.value)} />
                                        </Field>
                                        : step == 1 ? <Field>
                                            <FieldLabel>Email</FieldLabel>
                                            <Input autoFocus type="email" placeholder="john.doe@example.com" required value={email} onChange={(e)=> setEmail(e.target.value)}/>
                                        </Field>
                                        : step == 2 ? <Field>
                                            <FieldLabel>Password</FieldLabel>
                                            <Input autoFocus type="password" minLength={8} required value={password} onChange={(e)=> setPassword(e.target.value)}/>
                                            <FieldDescription>Password must be at least 8 characters long.</FieldDescription>
                                        </Field>
                                        : step == 3 && <Field>
                                            <FieldLabel>Confirm Password</FieldLabel>
                                            <Input autoFocus type="password" required value={confirmPassword} onChange={(e)=> setConfirmPassword(e.target.value)}/>
                                            {confirmPassword && confirmPassword != password && <FieldError>Passwords do not match.</FieldError>}
                                        </Field>}
                                    </motion.div>
                                </AnimatePresence>
                            </FieldGroup>
                        </CardContent>
                        <CardFooter>
                            <Button variant="ghost" type="button" disabled={submitting} onClick={()=> {
                                if (step == 0){
                                    setMounted(false);
                                    setTimeout(()=>{
                                        router.push("/setup");
                                    }, 200)
                                } else {
                                    setStep((step)=> step - 1)
                                }
                            }}>
                                Back
                            </Button>
                            <div className="flex-1"/>
                            <Button type="submit" disabled={submitting}>
                                Next
                                <ArrowRight/>
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>}
        </AnimatePresence>
    </div>
}
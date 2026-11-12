"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
export default function SignInPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  async function submitForm() {
    setSubmitting(true);
    try {
      console.log({name, email, password, verifyPassword})
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        notif_preferences: {
          email: {
            enabled: true,
            priority: ["high", "medium"],
          },
        },
      })
      if (error) {
        toast.add({
          title: "Error signing up",
          description: error.message || "An unknown error occurred.",
          type: "error",
        })
      } else {
        router.replace("/dashboard"); 
      }

    } catch (error) {
      console.log(error)
      toast.add({
        title: "Error signing up",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        type: "error",
      })
    } finally {
      setSubmitting(false);
    }
  }
  return <>
    <Dialog open={showVerifyPassword} onOpenChange={(open) => setShowVerifyPassword(open)}>
      <DialogContent>
        <form className="contents" onSubmit={(e) => {
          e.preventDefault();
          submitForm()
          setShowVerifyPassword(false);
        }}>
          <DialogHeader>
            <DialogTitle>Verify password</DialogTitle>
            <DialogDescription>
              Enter your new password again to verify.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={verifyPassword && verifyPassword !== password}>
              <FieldLabel htmlFor="verifyPassword">Password</FieldLabel>
              <Input id="verifyPassword" name="verifyPassword" type="password" value={verifyPassword} onChange={(e)=> setVerifyPassword(e.target.value)} required/>
              {verifyPassword && verifyPassword !== password && <FieldError>Passwords do not match.</FieldError>}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" onClick={()=> setShowVerifyPassword(false)} variant="outline">Cancel</Button>
            <Button type="submit" disabled={verifyPassword !== password}>Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <form onSubmit={(e)=> {
        e.preventDefault();
        setShowVerifyPassword(true);
    }} className="w-full max-w-100 absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Card className="">
        <CardHeader>
          <CardTitle>Sign up for an account</CardTitle>
          <CardDescription>
            Enter a name, email and create a password.
          </CardDescription>
        </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Display Name</FieldLabel>
                <Input id="name" name="name" type="text" placeholder="John Doe" value={name} onChange={(e)=> setName(e.target.value)} required/>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" placeholder="john.doe@example.com" value={email} onChange={(e)=> setEmail(e.target.value)} required/>
              </Field>
              <Field data-invalid={password && !passwordFocused && password.length < 8}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input minLength={8} name="password" id="password" type="password" value={password} onChange={(e)=> setPassword(e.target.value)} onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)} required/>
                {password && !passwordFocused && password.length < 8 ? <FieldError>At least 8 characters are required.</FieldError> : <FieldDescription>Minimum of 8 characters.</FieldDescription>}
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? <Spinner/> : "Sign Up"}
            </Button>
            <Link href="/auth/sign-in" className="w-full">
              <Button disabled={submitting} type="button" size="xs" variant="link" className="w-full text-xs mt-0 text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
          </CardFooter>
      </Card>
    </form>
  </>
}

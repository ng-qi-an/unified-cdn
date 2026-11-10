import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import listSessionsClient from "@/lib/actions/sessions/listSessionsClient";
import { authClient } from "@/lib/auth-client";
import revalidateData from "@/lib/revalidateData";
import { session } from "@/lib/schema/auth-schema";
import { User } from "@/lib/schema/schemaTypes";
import { SiAndroid, SiApple } from "@icons-pack/react-simple-icons";
import { LaptopMinimal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

export default function SessionsSettings({user}: {user: User}){
    const [sessions, setSessions] = useState<typeof session.$inferSelect[]>([]);
    const [loading, setLoading] = useState(true);
    const { data: currentSession } = authClient.useSession()
    const [revoking, setRevoking] = useState(false);
    useEffect(()=>{
        (async()=>{
            try {
                setLoading(true);
                const data = await listSessionsClient();
                setSessions(data);
                setLoading(false);
            } catch (e){
                if (e instanceof Error){
                    console.error(e);
                    toast.add({
                        title: "Error loading sessions",
                        description: e.message,
                        type: "error"
                    })
                } else {
                    toast.add({
                        title: "Error loading sessions",
                        description: "An unknown error occurred.",
                        type: "error"
                    })
                }
            }
        })();
    }, [])
    return <>
        <DialogHeader>
            <DialogTitle>Sessions</DialogTitle>
            <DialogDescription>Manage your active sessions on this account</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-full overflow-auto scroll-fade pt-4 gap-2">
            <Label className="mb-1">Active sessions</Label>
            {!loading &&<>
                {sessions.map((session)=>{
                    const parser = session.userAgent ? new UAParser(session.userAgent) : null;
                    const os = parser?.getOS().name ?? "Unknown OS";
                    const OsIcon = os.startsWith("Android") ? SiAndroid : (os == "iOS" || os == "macOS") ? SiApple :  LaptopMinimal;
                    return <Item key={session.id} variant="outline">
                        <ItemMedia variant="icon">
                            <OsIcon className="size-4"/>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>{parser?.getBrowser().name ?? "Unknown Browser"} on {os} {currentSession?.session.id == session.id && <Badge variant="outline" className="border px-1 py-0.5">Current</Badge>}</ItemTitle>
                            <ItemDescription>{session.ipAddress ? <>{session.ipAddress} | Registed in {session.cityName ?? "Unknown City"}, {session.countryName ?? "Unknown Country"}</> : "Unknown location"}</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button disabled={revoking || currentSession?.session.id == session.id} variant="ghost" size="icon-sm" onClick={async()=>{
                                setRevoking(true);
                                try {
                                    await authClient.revokeSession({token: session.token});
                                    setSessions(sessions.filter(s => s.id !== session.id));
                                } catch (e) {
                                    if (e instanceof Error) {
                                        console.error(e);
                                        toast.add({
                                            title: "Error revoking this session",
                                            description: e.message,
                                            type: "error"
                                        });
                                    } else {
                                        toast.add({
                                            title: "Error revoking this session",
                                            description: "An unknown error occurred.",
                                            type: "error"
                                        });
                                    }
                                }
                                setRevoking(false);
                            }}>
                                <X/>
                            </Button>
                        </ItemActions>
                    </Item>
                })}
                <Button disabled={revoking || sessions.length < 2} variant="secondary" size="sm" onClick={async ()=>{
                    setRevoking(true);
                    try {
                        await authClient.revokeOtherSessions();
                        setSessions(sessions.filter(s => s.id !== currentSession?.session.id));
                    } catch (e) {
                        if (e instanceof Error) {
                            console.error(e);
                            toast.add({
                                title: "Error revoking sessions",
                                description: e.message,
                                type: "error"
                            });
                        } else {
                            toast.add({
                                title: "Error revoking sessions",
                                description: "An unknown error occurred.",
                                type: "error"
                            });
                        }
                    }
                    setRevoking(false);
                }}>Revoke all other sessions</Button>
            </>}
        </div>
    </>
}
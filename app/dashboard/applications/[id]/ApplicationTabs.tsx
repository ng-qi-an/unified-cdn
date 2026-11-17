'use client';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FolderOpen, Key, LayoutGrid, Logs, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function ApplicationTabs({appId, disableManage}: {appId: string, disableManage?: boolean}){
    const pathname = usePathname();
    const router = useRouter();
    const normalisedPathname = pathname.split("/")[pathname.split("/").length - 1]
    
    return <div className="border-b overflow-auto scroll-fade-x scrollbar-none w-full shrink-0">
            <Tabs value={normalisedPathname} defaultValue={appId} onValueChange={(value) => {
            router.push(`/dashboard/applications/${appId}/${value == appId ? "" : value}`);
        }}> 
            <TabsList variant="line" className="mt-4 min-w-140 w-full">
                <TabsTrigger value={appId}><LayoutGrid/> Overview</TabsTrigger>
                <Tooltip disabled={!disableManage}>
                    <TooltipTrigger render={<span className="flex-1 flex">
                        <TabsTrigger value="files" disabled={disableManage}><FolderOpen/>Files</TabsTrigger>
                    </span>}/>
                    <TooltipContent side="bottom">
                        <p className="text-sm">{disableManage && "You do not have enough permissions to view the files of this database."}</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip disabled={!disableManage}>
                    <TooltipTrigger render={<span className="flex-1 flex">
                        <TabsTrigger value="api-keys" disabled={disableManage}><Key />API Keys</TabsTrigger>
                    </span>}/>
                    <TooltipContent side="bottom">
                        <p className="text-sm">{disableManage && "You do not have enough permissions to view the API keys of this application."}</p>
                    </TooltipContent>
                </Tooltip>
                <TabsTrigger value="logs"><Logs/>Logs</TabsTrigger>
                <Tooltip disabled={!disableManage}>
                    <TooltipTrigger render={<span className="flex-1 flex">
                        <TabsTrigger value="settings" disabled={disableManage}><Settings/>Settings</TabsTrigger>
                    </span>}/>
                    <TooltipContent side="bottom">
                        <p className="text-sm">{disableManage && "You do not have enough permissions to manage this application."}</p>
                    </TooltipContent>
                </Tooltip>
            </TabsList>
        </Tabs>
    </div>
}
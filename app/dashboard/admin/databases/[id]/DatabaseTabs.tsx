'use client';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FolderOpen, LayoutGrid, Logs, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function DatabaseTabs({dbId, disableManage}: {dbId: string, disableManage?: boolean}){
    const pathname = usePathname();
    const router = useRouter();
    const normalisedPathname = pathname.split("/")[pathname.split("/").length - 1]
    return <div className="border-b overflow-auto scroll-fade-x scrollbar-none w-full shrink-0">
            <Tabs value={normalisedPathname} defaultValue={dbId} onValueChange={(value) => {
            router.push(`/dashboard/admin/databases/${dbId}/${value == dbId ? "" : value}`);
        }}> 
            <TabsList variant="line" className="mt-4 min-w-140 w-full">
                <TabsTrigger value={dbId}><LayoutGrid/> Overview</TabsTrigger>
                <Tooltip disabled={!disableManage}>
                    <TooltipTrigger render={<span className="flex-1 flex">
                        <TabsTrigger value="files" disabled={disableManage}><FolderOpen/>Files</TabsTrigger>
                    </span>}/>
                    <TooltipContent side="bottom">
                        <p className="text-sm">{disableManage && "You do not have enough permissions to view the files of this database."}</p>
                    </TooltipContent>
                </Tooltip>
                <TabsTrigger value="logs"><Logs/>Logs</TabsTrigger>
                <Tooltip disabled={!disableManage}>
                    <TooltipTrigger render={<span className="flex-1 flex">
                        <TabsTrigger value="settings"  disabled={disableManage}><Settings/>Settings</TabsTrigger>
                    </span>}/>
                    <TooltipContent side="bottom">
                        <p className="text-sm">{disableManage && "You do not have enough permissions to manage this database."}</p>
                    </TooltipContent>
                </Tooltip>
            </TabsList>
        </Tabs>
    </div>
}
import { FilesDataTable } from "@/components/tables/files/data-table";
import { filesColumns } from "@/components/tables/files/columns";
import { db } from "@/lib/db";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import { checkUserHasHigherPerms } from "@/lib/permissions/permissionHelpers";
import { redirect } from "next/navigation";

export const metadata = {
    title: 'Files',
};


export const instant = false;

export default async function ApplicationFiles({params}: {params: Promise<{id: string}>}) {
    const {id} = await params;
    const appData = await db.query.applications.findFirst({
        where: {
            id
        },
        with: {
            files: true,
            owner: {
                columns: {
                    role: true
                }
            }
        },
        columns: {
            status: true,
            ownerId: true
        }
    })
    const viewAllPerms = await userHasPermissionServer({applications: ["viewAll"]});
    if (appData!.ownerId != viewAllPerms.user.id && !checkUserHasHigherPerms(viewAllPerms.user.role ?? "user", appData!.owner?.role ?? "user")) {
        return redirect(`/dashboard/applications/${id}`);
    }
    return <div className="pt-4 h-full relative min-w-0 max-w-full">
        <FilesDataTable disableFileUploads={appData!.status != "active"} columns={filesColumns} data={appData!.files} appId={id}/>
    </div>
}
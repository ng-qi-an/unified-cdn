import { FilesDataTable } from "@/components/tables/files/data-table";
import { filesColumns } from "@/components/tables/files/columns";
import { db } from "@/lib/db";
import { files } from "@/lib/schema/schema";
import { eq } from "drizzle-orm";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import { checkUserHasHigherPerms } from "@/lib/permissions/permissionHelpers";
import { redirect } from "next/navigation";

export const metadata = {
    title: 'Files',
};

export const instant = false;

export default async function ApplicationFiles({params}: {params: Promise<{id: string}>}) {
    const {id} = await params;
    const dbData = await db.query.databases.findFirst({
        where: { id },
        with: {
            files: true,
            owner: {
                columns: {
                    role: true
                }
            }
        }
    })
    const viewAllPerms = await userHasPermissionServer({databases: ["viewAll"]});
    if (dbData?.ownerId != viewAllPerms.user.id && !checkUserHasHigherPerms(viewAllPerms.user.role ?? "user", dbData?.owner?.role ?? "user")) {
        return redirect(`/dashboard/admin/databases/${id}`);
    }
    return <div className="pt-4 h-full relative min-w-0 max-w-full">
        <FilesDataTable disableFileUploads columns={filesColumns} data={dbData!.files} databaseId={id}/>
    </div>
}
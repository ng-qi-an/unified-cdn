import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
            headers: await headers()
        })
    if (!session || !session.user) {
        return "You are not logged in. Please log in to access the admin dashboard.";
    }
    const user = session.user;
    if (user.role !== "admin" && user.role !== "superAdmin") {
        return redirect("/dashboard");
    } else {
        return children
    }
}
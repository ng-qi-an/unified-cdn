import Dashboard from "@/components/navigation/Dashboard"
import DashboardBody from "@/components/navigation/DashboardBody"
import DashboardHeader from "@/components/navigation/DashboardHeader"
import DashboardSectionHeader from "@/components/navigation/DashboardSectionHeader"
import { Suspense } from "react"
import SiteSettingsRendered from "./rendered"

export const metadata = {
    title: "Site settings",
}

export default function SiteSettingsPage(){
    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Site settings"}]}/>
        <DashboardBody>
            <DashboardSectionHeader title="Site settings" description="Configure your site's keys and configurations."/>
            <Suspense>
                <SiteSettingsRendered/>
            </Suspense>
        </DashboardBody>
    </Dashboard>
}
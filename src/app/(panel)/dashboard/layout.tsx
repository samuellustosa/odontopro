import React from "react";
import { SidebarDashboard } from "./_components/sidebar";

export default function Dashboardlayout({
    children,
}: {
    children: React.ReactNode
}){
    return(
        <>
            <SidebarDashboard>
                {children}
            </SidebarDashboard>
        </>
    )
}
"use client";

import dynamic from "next/dynamic";

const SidebarWithContent = dynamic(
  () => import("@/components/sidebar-component").then((m) => m.SidebarWithContent),
  { ssr: false }
);

export function SummaryPageWrapper({ children }: { children: React.ReactNode }) {
  return <SidebarWithContent>{children}</SidebarWithContent>;
}

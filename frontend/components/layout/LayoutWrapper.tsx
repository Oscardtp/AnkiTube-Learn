"use client";

import { SideNavBar } from "./SideNavBar";
import { TopNavBar } from "./TopNavBar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SideNavBar />
      <TopNavBar />
      <main className="ml-64 pt-16 min-h-screen">{children}</main>
    </>
  );
}

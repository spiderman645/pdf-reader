"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { PerceptronLogo } from "@/components/icons/perceptron-logo"; // Keeping the logo component name
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-sidebar px-4 md:px-6 text-sidebar-foreground">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-accent-foreground" />
        <Link href="/pdf-insights" className="flex items-center gap-2">
          <PerceptronLogo className="h-7 w-7 text-sidebar-primary" />
          <h1 className="text-xl font-semibold text-sidebar-foreground">Special Learning</h1>
        </Link>
      </div>
      {/* Future additions like User Profile Dropdown can go here */}
    </header>
  );
}

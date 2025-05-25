"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { PerceptronLogo } from "@/components/icons/perceptron-logo";
import { ImageIcon, BookOpenCheck, Workflow } from "lucide-react"; // Changed FileText and BookOpenText to BookOpenCheck

export function AppSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/pdf-studio", label: "PDF Studio", icon: BookOpenCheck },
    { href: "/photo-analyzer", label: "Photo Analyzer", icon: ImageIcon },
  ];

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 flex items-center gap-2 justify-center group-data-[collapsible=icon]:justify-start group-data-[collapsible=icon]:px-2">
         <Workflow className="h-8 w-8 text-sidebar-primary flex-shrink-0" />
         <span className="text-2xl font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">Special Learning</span>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: "right", align: "center" }}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

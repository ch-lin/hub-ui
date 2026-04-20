"use client" // 👉 1. Declare as Client Component

import { PlaySquare, Tv, Tags, Settings, Wrench, LayoutDashboard } from "lucide-react"
import { usePathname, useRouter } from "next/navigation" // 👉 2. Use Hooks to control routing and state
 
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface SidebarGroupConfig {
  label: string;
  items: SidebarItem[];
}

const sidebarGroups: SidebarGroupConfig[] = [
  {
    label: "Youtube Hub",
    items: [
      { title: "Dashboard", url: "/youtube", icon: LayoutDashboard }, // Youtube Hub specific Dashboard
      { title: "Videos", url: "/youtube/videos", icon: PlaySquare },
      { title: "Channels", url: "/youtube/channels", icon: Tv },
      { title: "Tags", url: "/youtube/tags", icon: Tags },
      { title: "Configs", url: "/youtube/configs", icon: Settings },
      { title: "Tools", url: "/youtube/tools", icon: Wrench },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname() // Get current URL path
  const router = useRouter()     // Get router controller

  return (
    <Sidebar>
      <SidebarContent>
        {sidebarGroups.map((group) => (
          <SidebarGroup key={group.label}> {/* Use group label as key */}
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => { 
                  // Determine if the current button is active
                  const isActive = pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.title}>
                      {/* 👉 3. Remove asChild, use onClick directly for navigation, and add isActive styling */}
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => {
                          console.info(`[Sidebar Tracking] User navigated to: ${item.title} (${item.url})`);
                          router.push(item.url);
                        }}
                        tooltip={item.title}
                        className={isActive ? "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:hover:bg-primary/90 shadow-sm" : ""}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
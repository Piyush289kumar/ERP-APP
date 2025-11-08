"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Folder,
} from "lucide-react";
import { NavMain } from "~/components/nav-main";
import { NavProjects } from "~/components/nav-projects";
import { NavSecondary } from "~/components/nav-secondary";
import { NavUser } from "~/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { useUserProfile } from "~/features/user/userApi";
import { useSelector } from "react-redux";
import type { RootState } from "~/redux/store";
import { useLocation } from "react-router";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isLoading } = useUserProfile();
  const user = useSelector((state: RootState) => state.user);
  const location = useLocation();

  // ✅ Determine active route
  const isActive = (path: string) => location.pathname.includes(path);

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: SquareTerminal,
        isActive: isActive("/admin/dashboard"),
      },
      {
        title: "Models",
        url: "/admin/models",
        icon: Bot,
        isActive: isActive("/admin/models"),
        items: [
          { title: "All Categories", url: "/admin/category" },
          { title: "Create New", url: "/admin/category/new" },
          { title: "Manage", url: "/admin/category/manage" },
        ],
      },
      {
        title: "Categories",
        url: "/admin/category",
        icon: Folder,
        isActive: isActive("/admin/category"),
      },
      {
        title: "Documentation",
        url: "/docs",
        icon: BookOpen,
        isActive: isActive("/docs"),
      },
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings2,
        isActive: isActive("/admin/settings"),
      },
    ],
    navSecondary: [
      { title: "Support", url: "#", icon: LifeBuoy },
      { title: "Feedback", url: "#", icon: Send },
    ],
    projects: [
      { name: "Design Engineering", url: "#", icon: Frame },
      { name: "Sales & Marketing", url: "#", icon: PieChart },
      { name: "Travel", url: "#", icon: Map },
    ],
  };

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {import.meta.env.VITE_APP_NAME || "React App"}
                  </span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        {isLoading ? (
          <div className="p-2 text-xs text-muted-foreground">
            Loading user...
          </div>
        ) : user?.name ? (
          <NavUser
            user={{
              name: user.name!,
              email: user.email!,
              avatar: user.avatar || "/avatars/default.jpg",
            }}
          />
        ) : (
          <div className="p-2 text-xs text-muted-foreground">No user data</div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

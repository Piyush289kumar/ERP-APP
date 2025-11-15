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
  ChartBarStacked,
  Album,
  FileBadge,
  UserStar,
  ImageUp,
  Layers,
  NotebookTabs,
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
      // {
      //   title: "Models",
      //   url: "/admin/models",
      //   icon: Bot,
      //   isActive: isActive("/admin/models"),
      //   items: [
      //     { title: "All Categories", url: "/admin/category" },
      //     { title: "Create New", url: "/admin/category/new" },
      //     { title: "Manage", url: "/admin/category/manage" },
      //   ],
      // },

      {
        title: "App Configuration",
        url: "/admin/app-configuration",
        icon: Settings2,
        isActive: isActive("/admin/blog"),
      },

      {
        title: "Blogs",
        url: "/admin/blog",
        icon: Bot,
        isActive: isActive("/admin/blog"),
        items: [
          { title: "All Blogs", url: "/admin/blog?filter=all" },
          { title: "Active Blogs", url: "/admin/blog?filter=active" },
          { title: "Inactive Blogs", url: "/admin/blog?filter=inactive" },
          { title: "Featured Blogs", url: "/admin/blog?filter=featured" },
          {
            title: "Non-Featured Blogs",
            url: "/admin/blog?filter=nonfeatured",
          },
        ],
      },
      {
        title: "Policy",
        url: "/admin/policy",
        icon: FileBadge,
        isActive: isActive("/admin/policy"),
      },

      {
        title: "Categories",
        url: "/admin/category",
        icon: ChartBarStacked,
        isActive: isActive("/admin/category"),
      },
      {
        title: "Services",
        url: "/admin/service",
        icon: Album,
        isActive: isActive("/admin/service"),
      },
      {
        title: "Testimonials",
        url: "/admin/testimonial",
        icon: UserStar,
        isActive: isActive("/admin/testimonial"),
      },
      {
        title: "Gallery",
        url: "/admin/gallery",
        icon: ImageUp,
        isActive: isActive("/admin/gallery"),
      },
      {
        title: "Contact",
        url: "/admin/contact",
        icon: NotebookTabs,
        isActive: isActive("/admin/contact"),
      },
      // {
      //   title: "Documentation",
      //   url: "/docs",
      //   icon: BookOpen,
      //   isActive: isActive("/docs"),
      // },
      // {
      //   title: "Settings",
      //   url: "/admin/settings",
      //   icon: Settings2,
      //   isActive: isActive("/admin/settings"),
      // },
    ],

    navSecondary: [
      // { title: "Support", url: "#", icon: LifeBuoy },
      // { title: "Feedback", url: "#", icon: Send },
    ],
    projects: [
      // { name: "Design Engineering", url: "#", icon: Frame },
      // { name: "Sales & Marketing", url: "#", icon: PieChart },
      // { name: "Travel", url: "#", icon: Map },
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

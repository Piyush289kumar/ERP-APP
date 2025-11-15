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
  BookCopy,
  ChartPie,
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

    analyticsNav: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: ChartPie,
        isActive: isActive("/admin/dashboard"),
      },
    ],

    legalComplianceNav: [
      {
        title: "Policy",
        url: "/admin/policy",
        icon: FileBadge,
        isActive: isActive("/admin/policy"),
      },
    ],

    serviceManagementNav: [
      {
        title: "Services",
        url: "/admin/service",
        icon: Album,
        isActive: isActive("/admin/service"),
      },
    ],

    customerFeedbackNav: [
      {
        title: "Testimonials",
        url: "/admin/testimonial",
        icon: UserStar,
        isActive: isActive("/admin/testimonial"),
      },
    ],

    mediaLibraryNav: [
      {
        title: "Gallery",
        url: "/admin/gallery",
        icon: ImageUp,
        isActive: isActive("/admin/gallery"),
      },
    ],

    communicationCenterNav: [
      {
        title: "Contact",
        url: "/admin/contact",
        icon: NotebookTabs,
        isActive: isActive("/admin/contact"),
      },
    ],

    contentManagementNav: [
      {
        title: "Blogs",
        url: "/admin/blog",
        icon: BookCopy,
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
        title: "Categories",
        url: "/admin/category",
        icon: ChartBarStacked,
        isActive: isActive("/admin/category"),
      },
    ],

    appSettingsNav: [
      {
        title: "App Configuration",
        url: "/admin/app-configuration",
        icon: Settings2,
        isActive: isActive("/admin/blog"),
      },
    ],

    navSecondary: [
      { title: "Support", url: "#", icon: LifeBuoy },
      { title: "Feedback", url: "#", icon: Send },
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
      <SidebarContent className="scrollbar-hide">
        <NavMain items={data.analyticsNav} groupName="Analytics Center" />
        <NavMain
          items={data.contentManagementNav}
          groupName="Content Management"
        />
        <NavMain
          items={data.serviceManagementNav}
          groupName="Service Management"
        />
        <NavMain
          items={data.customerFeedbackNav}
          groupName="Customer Feedback"
        />

        <NavMain items={data.mediaLibraryNav} groupName="Media Library" />

        <NavMain
          items={data.communicationCenterNav}
          groupName="Communication Center"
        />
        <NavMain
          items={data.legalComplianceNav}
          groupName="Legal & Compliance"
        />

        <NavMain items={data.appSettingsNav} groupName="Application Settings" />

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

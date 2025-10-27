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
import { useNavigate } from "react-router";
import { getToken } from "~/utils/auth";
import axios from "axios";
import { useUserProfile } from "~/features/user/userApi";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "~/redux/store";
import { setUser } from "~/features/user/userSlice";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Fetch + Sync user profile (TanStack + Redux)
  const dispatch = useDispatch();
  const { isLoading } = useUserProfile();

  // Access user directly from Redux store
  const user = useSelector((state: RootState) => state.user);

  const handleTestDispatch = () => {
    const fakeUser = {
      name: "Test User",
      email: "test@example.com",
      avatar: "/avatars/test.jpg",
    };
    console.log("🧪 Dispatching fake user:", fakeUser);
    dispatch(setUser(fakeUser));
  };

  console.log("🧠 Redux user:", user);

  return (
    <Sidebar variant="inset" {...props}>
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
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {/* ✅ Show loading, then user */}
        {isLoading ? (
          <div className="p-2 text-xs text-muted-foreground">
            Loading user...
          </div>
        ) : user?.name ? (
          <NavUser
            user={{
              name: data.user.name,
              email: data.user.email,
              avatar: data.user.avatar,
            }}
          />
        ) : (
          <div className="p-2 text-xs text-muted-foreground">No user data</div>
        )}

        {/* 🧪 Temporary Test Button */}
        <button
          onClick={handleTestDispatch}
          className="m-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
        >
          Test Dispatch
        </button>
      </SidebarFooter>

      {/* <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter> */}
    </Sidebar>
  );
}

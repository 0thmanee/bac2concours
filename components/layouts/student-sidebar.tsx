"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  BookOpen,
  Video,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/lib/hooks/use-auth";
import { STUDENT_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

const navigation = [
  {
    name: "Tableau de bord",
    href: STUDENT_ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: "Écoles",
    href: STUDENT_ROUTES.SCHOOLS,
    icon: BookOpen,
  },
  {
    name: "Bibliothèque",
    href: STUDENT_ROUTES.BOOKS,
    icon: BookOpen,
  },
  {
    name: "Vidéos",
    href: STUDENT_ROUTES.VIDEOS,
    icon: Video,
  },
  {
    name: "Quiz QCM",
    href: STUDENT_ROUTES.QUIZ,
    icon: HelpCircle,
  },
];


export default function StudentSidebar() {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLinkClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar 
      className="border-r border-border bg-ops-surface"
    >
      {/* Header */}
      <SidebarHeader 
        className="h-16 px-6 py-0 border-b border-border flex-row! items-center justify-center"
      >
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="2BAConcours"
          width={160}
          height={60}
          className="h-10 w-auto brightness-0 dark:brightness-0 dark:invert"
          priority
        />
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={cn(
                        "h-9 px-3 text-sm font-medium",
                        isActive 
                          ? "bg-primary text-white"
                          : "text-muted-foreground"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3" onClick={handleLinkClick}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter 
        className="p-3 border-t border-border"
      >
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-9 text-sm font-medium text-ops-secondary"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

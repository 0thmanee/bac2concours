"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLogout } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AUTH_ROUTES, ADMIN_ROUTES } from "@/lib/routes";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface AdminHeaderProps {
  userName: string;
  userEmail: string;
}

export function AdminHeader({ userName, userEmail }: AdminHeaderProps) {
  const logoutMutation = useLogout();
  const router = useRouter();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push(AUTH_ROUTES.LOGIN);
      },
    });
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header 
      className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-ops bg-ops-surface px-4 md:px-6"
    >
      <SidebarTrigger className="md:hidden" />
      
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative hidden md:block">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ops-tertiary" 
          />
          <Input
            placeholder="Search..."
            className="ops-input pl-10 h-9 w-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback 
                  className="text-xs font-semibold bg-metric-purple-light text-metric-purple-dark"
                >
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-ops-primary">
                  {userName}
                </span>
                <span className="text-xs text-ops-tertiary">
                  Admin
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="ops-card">
            <DropdownMenuLabel className="text-ops-primary">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-ops-border" />
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-ops-primary">{userName}</p>
              <p className="text-xs text-ops-tertiary">{userEmail}</p>
            </div>
            <DropdownMenuSeparator className="bg-ops-border" />
            <DropdownMenuItem asChild>
              <Link href={ADMIN_ROUTES.PROFILE}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ADMIN_ROUTES.SETTINGS}>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-ops-border" />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Menu, LayoutDashboard, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { API_ROUTES } from "@/lib/constants";
import { ADMIN_ROUTES, STUDENT_ROUTES } from "@/lib/routes";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface SessionData {
  user?: SessionUser;
}

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch session to check if user is logged in
  const { data: session, isLoading: isLoadingSession } = useQuery<SessionData | null>({
    queryKey: ["session"],
    queryFn: async () => {
      const response = await fetch(API_ROUTES.AUTH_SESSION);
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";
  const dashboardHref = isAdmin ? ADMIN_ROUTES.DASHBOARD : STUDENT_ROUTES.DASHBOARD;

  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="2BAConcours"
              width={150}
              height={50}
              className="h-10 sm:h-12 w-auto brightness-0 dark:brightness-0 dark:invert"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
            {/* Auth action - Dashboard or Connexion */}
            {isLoadingSession ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : isLoggedIn ? (
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                Tableau de bord
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                Connexion
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden border-t border-border bg-white dark:bg-gray-900 overflow-hidden transition-all duration-300",
          mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              {link.name}
            </Link>
          ))}
          {/* Auth action - Dashboard or Connexion */}
          {isLoadingSession ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : isLoggedIn ? (
            <Link
              href={dashboardHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              Tableau de bord
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

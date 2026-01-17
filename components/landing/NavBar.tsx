"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaHome, FaPhoneAlt, FaTimes, FaBars } from "react-icons/fa";
import { SimpleThemeToggle } from "@/components/theme-toggle";

const NavBar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const handleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Accueil", href: "/", icon: <FaHome /> },
    { name: "Contact", href: "/contact", icon: <FaPhoneAlt /> },
  ];

  // Determine CTA button based on session
  const getCtaButton = () => {
    if (status === "loading") {
      return { text: "Chargement...", href: "#", disabled: true };
    }
    
    if (session?.user) {
      // User is logged in - redirect to their dashboard based on role
      const role = session.user.role;
      const dashboardPath = role === "ADMIN" ? "/admin" : "/student";
      return { text: "Tableau de bord", href: dashboardPath, disabled: false };
    }
    
    // User is not logged in
    return { text: "Commencer", href: "/login", disabled: false };
  };

  const ctaButton = getCtaButton();

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-card/90 backdrop-blur-md border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center">
              <Image 
                src="/logo.png" 
                alt="2BAConcours Logo" 
                width={140} 
                height={40} 
                className="h-14 w-auto invert dark:invert-0" 
              />
            </Link>

            {/* Desktop Navigation - All to the right */}
            <div className="hidden md:flex items-center gap-6 ml-auto">
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`nav-link ${
                    pathname === link.href ? "active" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Divider */}
              <div className="h-6 w-px bg-border" />
              
              {/* Theme Toggle */}
              <SimpleThemeToggle />
              
              {/* CTA Button */}
              <Link
                href={ctaButton.href}
                className={`btn btn-primary text-sm ${
                  ctaButton.disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-disabled={ctaButton.disabled}
                onClick={(e) => ctaButton.disabled && e.preventDefault()}
              >
                {ctaButton.text}
              </Link>
            </div>

            {/* Mobile menu button and theme toggle */}
            <div className="md:hidden flex items-center gap-2">
              <SimpleThemeToggle />
              <button
                onClick={handleMobileMenu}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                <FaBars className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={handleMobileMenu}
            />

            {/* Mobile menu panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-card shadow-xl overflow-y-auto border-l border-border">
              <div className="px-6 pt-6 pb-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" onClick={handleMobileMenu}>
                    <Image 
                      src="/logo.png" 
                      alt="2BAConcours Logo" 
                      width={140} 
                      height={40} 
                      className="h-10 w-auto invert dark:invert-0" 
                    />
                  </Link>
                  <button
                    onClick={handleMobileMenu}
                    className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none"
                  >
                    <span className="sr-only">Close menu</span>
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-8 flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={handleMobileMenu}
                      className={`flex items-center px-4 py-3 text-lg rounded-lg transition-colors ${
                        pathname === link.href
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="mt-auto pt-8 space-y-4">
                  <Link
                    href={ctaButton.href}
                    onClick={handleMobileMenu}
                    className={`btn btn-primary w-full ${
                      ctaButton.disabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    aria-disabled={ctaButton.disabled}
                  >
                    {ctaButton.text}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
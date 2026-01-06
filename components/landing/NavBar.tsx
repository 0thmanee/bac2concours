"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { FaBook, FaVideo, FaQuestionCircle, FaPhoneAlt, FaTimes, FaBars } from "react-icons/fa";
import { SimpleThemeToggle } from "@/components/theme-toggle";

const NavBar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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
    { name: "Livres", href: "/student/books", icon: <FaBook /> },
    { name: "Vidéos", href: "/student/videos", icon: <FaVideo /> },
    { name: "QCM", href: "/student/qcm", icon: <FaQuestionCircle /> },
    { name: "Contact", href: "/contact", icon: <FaPhoneAlt /> },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-gray-900/90 backdrop-blur-md shadow-md" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image 
                src="/logo.png" 
                alt="2BAConcours Logo" 
                width={140} 
                height={40} 
                className="h-14 w-auto" 
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
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
            </div>

            {/* CTA Button and Theme Toggle */}
            <div className="hidden md:flex items-center gap-3">
              <SimpleThemeToggle />
              <Link
                href="/login"
                className="btn btn-primary text-sm"
              >
                Commencer
              </Link>
            </div>

            {/* Mobile menu button and theme toggle */}
            <div className="md:hidden flex items-center gap-2">
              <SimpleThemeToggle />
              <button
                onClick={handleMobileMenu}
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none"
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
              className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm"
              onClick={handleMobileMenu}
            />

            {/* Mobile menu panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-gray-900 shadow-xl overflow-y-auto">
              <div className="px-6 pt-6 pb-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" onClick={handleMobileMenu}>
                    <Image 
                      src="/logo.png" 
                      alt="2BAConcours Logo" 
                      width={140} 
                      height={40} 
                      className="h-10 w-auto" 
                    />
                  </Link>
                  <button
                    onClick={handleMobileMenu}
                    className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none"
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
                      className={`flex items-center px-4 py-3 text-lg rounded-lg ${
                        pathname === link.href
                          ? "bg-primary-900/20 text-white"
                          : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      }`}
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="mt-auto pt-8 space-y-4">
                  <div className="flex justify-center">
                    <SimpleThemeToggle />
                  </div>
                  <Link
                    href="/login"
                    onClick={handleMobileMenu}
                    className="btn btn-primary w-full"
                  >
                    Commencer
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
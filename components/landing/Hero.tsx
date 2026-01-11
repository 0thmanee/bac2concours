"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaRegEnvelope, FaPhoneAlt, FaFacebookF, FaInstagram, FaArrowRight } from "react-icons/fa";
import { useSession } from "next-auth/react";

const Hero = () => {
  const { data: session, status } = useSession();
  const [redirectPage, setRedirectPage] = useState("/login");

  useEffect(() => {
    const getNextPage = () => {
      if (status === "loading") return "/login";
      if (!session) return "/login";
      if (session?.user.role === "ADMIN") return "/admin";
      return "/student";
    };

    const nextPage = getNextPage();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRedirectPage(nextPage);
  }, [session, status]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden public-background flex items-center justify-center">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-64 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="space-y-8">
            <div>
              <span className="inline-block px-4 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm mb-6">
                Préparation Concours 2025
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
              Réussissez vos{" "}
              <span className="text-gradient">
                Concours
              </span>{" "}
              avec confiance!
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
              Préparez-vous aux concours 2025 de MÉDECINE, DENTAIRE, PHARMACIE, 
              ENCG, ENA, ENSA, ENAM, IAV, ENSAM, ISPITS et ISCAE, au Maroc avec 
              notre plateforme de préparation en ligne complète.
            </p>
            
            {/* Features list */}
            <div className="grid grid-cols-2 gap-4 py-4">
              {[
                "Cours structurés",
                "QCM interactifs",
                "Correction détaillée",
                "Suivi personnalisé"
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={redirectPage}
                className="btn btn-primary group"
              >
                Commencer maintenant
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
              </Link>
              
              <Link
                href="/contact"
                className="btn btn-outline"
              >
                Nous contacter
              </Link>
            </div>
            
            <div className="pt-6 flex items-center gap-4">
              {[
                { icon: <FaRegEnvelope />, href: "mailto:bac2concours@gmail.com" },
                { icon: <FaPhoneAlt />, href: "tel:+212684528279" },
                { icon: <FaFacebookF />, href: "https://www.facebook.com/profile.php?id=100090164057717" },
                { icon: <FaInstagram />, href: "https://www.instagram.com/concours_bac2" }
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  target="_blank"
                  className="w-10 h-10 bg-muted hover:bg-primary/10 border border-border hover:border-primary rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-300 hover:shadow-glow"
                >
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right column - Image */}
          <div className="relative">
            <div className="relative h-125 lg:h-150 mx-auto">
              {/* Main image with glass effect border */}
              <div className="absolute inset-0 rounded-2xl glass-card overflow-hidden">
                <Image
                  src="/student/2.jpeg"
                  alt="Student preparing for exam on 2baconcours platform"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
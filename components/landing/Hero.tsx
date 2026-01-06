"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaRegEnvelope, FaPhoneAlt, FaFacebookF, FaInstagram, FaArrowRight } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Hero = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redirectPage, setRedirectPage] = useState("/login");

  useEffect(() => {
    const getNextPage = () => {
      if (status === "loading") return "/login";
      if (!session) return "/login";
      if (session?.user.role === "ADMIN") return "/admin";
      return "/student";
    };

    const nextPage = getNextPage();
    setRedirectPage(nextPage);
  }, [session, status]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background dark:bg-gray-950 flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/bcg.png')] bg-cover bg-center opacity-20 dark:opacity-30"></div>
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-purple-500/5 via-purple-400/5 to-background/90 dark:from-purple-500/10 dark:to-gray-950/80"></div>
      
      {/* Animated gradient circle */}
      <div className="absolute top-[-30%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-conic opacity-30 blur-3xl"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-conic opacity-20 blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-64 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <motion.div 
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
          >
            <motion.div variants={fadeIn}>
              <span className="inline-block px-4 py-1 bg-purple-900/30 border border-purple-600/30 rounded-full text-purple-300 font-medium text-sm mb-6">
                Préparation Concours 2025
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeIn}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-foreground"
            >
              Réussissez vos{" "}
              <span className="text-gradient animate-gradient-text">
                Concours
              </span>{" "}
              avec confiance!
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl"
            >
              Préparez-vous aux concours 2025 de MÉDECINE, DENTAIRE, PHARMACIE, 
              ENCG, ENA, ENSA, ENAM, IAV, ENSAM, ISPITS et ISCAE, au Maroc avec 
              notre plateforme de préparation en ligne complète.
            </motion.p>
            
            {/* Features list */}
            <motion.div 
              variants={fadeIn}
              className="grid grid-cols-2 gap-4 py-4"
            >
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
                  <span className="text-gray-200">{feature}</span>
                </div>
              ))}
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href={redirectPage}
                className="btn btn-primary group"
              >
                Commencer maintenant
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/contact"
                className="btn btn-outline"
              >
                Nous contacter
              </Link>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="pt-6 flex items-center gap-4"
            >
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
                  className="w-10 h-10 bg-gray-800/50 hover:bg-purple-900/50 border border-border hover:border-purple-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300 hover:shadow-glow"
                >
                  {item.icon}
                </Link>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Right column - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <div className="relative h-[500px] lg:h-[600px] mx-auto">
              {/* Main image with glass effect border */}
              <div className="absolute inset-0 rounded-2xl glass-card overflow-hidden animate-float">
                <Image
                  src="/student/2.jpeg"
                  alt="Student preparing for exam on 2baconcours platform"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              
              {/* Floating elements */}
              <motion.div 
                className="absolute -top-6 -right-2 sm:-right-6 p-4 glass-card rounded-xl shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Taux de réussite</p>
                    <p className="text-lg font-bold text-primary-300">95%</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute bottom-4 sm:bottom-12 -left-2 sm:-left-6 p-4 glass-card rounded-xl shadow-lg max-w-[200px]"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(num => (
                      <div key={num} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-border overflow-hidden">
                        <img
                          src={`/avatar-${num}.jpg`}
                          alt="Student avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-border flex items-center justify-center text-[0.6rem] text-white">
                      +346
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">
                    Rejoignez plus de 350 étudiants qui réussissent
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
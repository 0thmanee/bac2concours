"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Book, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Book,
    title: "Cours Structurés",
    description: "Contenus organisés et adaptés aux concours",
  },
  {
    icon: CheckCircle,
    title: "QCM Interactifs",
    description: "Milliers de questions pour vous entraîner",
  },
  {
    icon: TrendingUp,
    title: "Suivi Personnalisé",
    description: "Suivez votre progression en temps réel",
  },
];

const stats = [
  { value: "400+", label: "Étudiants" },
  { value: "100+", label: "Ressources" },
  { value: "500+", label: "QCM" },
  { value: "90%", label: "Réussite" },
];

export function HeroSection() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 pt-16 sm:pt-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[rgb(var(--brand-50))]/30 via-white to-white dark:from-[rgb(var(--brand-950))]/20 dark:via-gray-900 dark:to-gray-900" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-300/20 rounded-full blur-3xl" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero */}
        <div className="pt-20 pb-16 md:pt-32 md:pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/[0.03] border border-border rounded-full text-gray-700 dark:text-gray-300 font-medium text-sm mb-8 shadow-sm animate-fade-in">
            <GraduationCap className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Préparation Concours 2026</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight animate-fade-in-up">
            Réussissez vos{" "}
            <span className="bg-gradient-to-r from-[rgb(var(--brand-500))] to-[rgb(var(--brand-700))] bg-clip-text text-transparent">
              Concours
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 animate-fade-in-up animation-delay-100">
            Préparez-vous aux concours 2026 de MÉDECINE, DENTAIRE, PHARMACIE,
            ENCG, ENA, ENSA avec notre plateforme complète.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animation-delay-200">
            <Link href="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-[rgb(var(--brand-500))] to-[rgb(var(--brand-600))] hover:from-[rgb(var(--brand-600))] hover:to-[rgb(var(--brand-700))] text-white px-8 py-3 text-lg shadow-lg h-auto"
              >
                Commencer maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-2 border-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-8 py-3 text-lg h-auto"
              >
                Nous contacter
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="pb-20 md:pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-white dark:border-border dark:bg-white/[0.03] p-6 hover:border-border dark:hover:border-border transition-all duration-300 shadow-sm hover:shadow-md animate-fade-in-up"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950/30 rounded-xl flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

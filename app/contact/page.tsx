"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/marketing/public-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "contact@2baconcours.ma",
    href: "mailto:contact@2baconcours.ma",
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: "+212 6XX XXX XXX",
    href: "tel:+2126XXXXXXXX",
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "Rabat, Maroc",
    href: "#",
  },
];

const socialLinks = [
  {
    icon: Facebook,
    href: "https://facebook.com/2baconcours",
    label: "Facebook",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/2baconcours",
    label: "Instagram",
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Le message est requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);
  }

  return (
    <>
      <PublicHeader />
      <div className="relative min-h-screen bg-white dark:bg-[rgb(var(--neutral-900))] overflow-hidden pt-16 sm:pt-20">
        {/* Background */}
        <div className="absolute inset-0 bg-[rgb(var(--neutral-50))] dark:bg-[rgb(var(--neutral-900))]" />

        {/* Decorative elements */}
        <div className="absolute top-40 left-10 w-72 h-72 bg-[rgb(var(--brand-200))]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[rgb(var(--brand-300))]/10 rounded-full blur-3xl" />

        {/* Main content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left column - Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <span className="inline-block px-4 py-1.5 bg-[rgb(var(--brand-50))] dark:bg-[rgb(var(--brand-500))]/10 border border-[rgb(var(--brand-200))] dark:border-[rgb(var(--brand-500))]/20 rounded-full text-[rgb(var(--brand-600))] dark:text-[rgb(var(--brand-400))] font-medium text-sm mb-6">
                  Contactez-nous
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[rgb(var(--neutral-900))] dark:text-white">
                Nous sommes à votre{" "}
                <span className="bg-gradient-to-r from-[rgb(var(--brand-500))] to-[rgb(var(--brand-700))] bg-clip-text text-transparent">
                  écoute
                </span>
              </h1>

              <p className="text-lg text-gray-700 dark:text-gray-400 max-w-2xl">
                Notre équipe est disponible pour répondre à toutes vos questions
                concernant la préparation aux concours. N&apos;hésitez pas à nous
                contacter pour obtenir plus d&apos;informations sur nos services.
              </p>

              {/* Contact information */}
              <div className="space-y-4 pt-4">
                {contactInfo.map((item, i) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                          {item.label}
                        </p>
                        <Link
                          href={item.href}
                          className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium"
                        >
                          {item.value}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Suivez-nous
                </h3>
                <div className="flex items-center gap-4">
                  {socialLinks.map((item, i) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={i}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
                        aria-label={item.label}
                      >
                        <IconComponent className="w-5 h-5" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right column - Form */}
            <div
              className="relative animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Envoyez-nous un message
                </h2>

                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Message envoyé !
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Nous vous répondrons dans les plus brefs délais.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      variant="outline"
                      className="ops-btn-secondary"
                    >
                      Envoyer un autre message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nom complet <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="ops-input h-10"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="ops-input h-10"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Votre message..."
                        value={formData.message}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        rows={5}
                        className="ops-input resize-none"
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full ops-btn-primary h-10"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          Envoyer le message
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

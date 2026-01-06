"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaRegEnvelope, FaPhoneAlt, FaFacebookF, FaInstagram, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(event.target as HTMLFormElement);
    formData.append("access_key", "fef142dc-d44c-4462-8eca-08dc884249bd");
    
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);
    
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success('Message envoyé avec succès');
        (event.target as HTMLFormElement).reset();
      } else {
        toast.error('Erreur lors de l\'envoi du message');
        console.error(result);
      }
    } catch (error) {
      toast.error('Erreur de connexion');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

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
      
      {/* Animated gradient circles */}
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
                Contactez-nous
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeIn}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-foreground"
            >
              Nous sommes à votre{" "}
              <span className="text-gradient animate-gradient-text">
                écoute
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl"
            >
              Notre équipe est disponible pour répondre à toutes vos questions concernant 
              la préparation aux concours. N&apos;hésitez pas à nous contacter pour obtenir 
              plus d&apos;informations sur nos services.
            </motion.p>
            
            {/* Contact information */}
            <motion.div 
              variants={fadeIn}
              className="space-y-4 pt-4"
            >
              {[
                { icon: <FaRegEnvelope className="text-purple-400" />, label: "Email", value: "bac2concours@gmail.com", href: "mailto:bac2concours@gmail.com" },
                { icon: <FaPhoneAlt className="text-purple-400" />, label: "Téléphone", value: "+212 684 528 279", href: "tel:+212684528279" },
                { icon: <FaMapMarkerAlt className="text-purple-400" />, label: "Adresse", value: "Rabat, Maroc", href: "#" }
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800/50 border border-border flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">{item.label}</p>
                    <Link href={item.href} className="text-white hover:text-purple-300 transition-colors">
                      {item.value}
                    </Link>
                  </div>
                </div>
              ))}
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="pt-6"
            >
              <h3 className="text-xl font-semibold mb-4">Suivez-nous</h3>
              <div className="flex items-center gap-4">
                {[
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
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right column - Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <div className="glass-card rounded-2xl p-8 shadow-lg border border-border hover:border-purple-700/50 transition-all duration-300">
              <h2 className="text-2xl font-bold mb-6 text-gradient">
                Envoyez-nous un message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-sm text-gray-300">Nom complet</label>
                  <div className="relative">
                    <input
                      id="name"
                      type="text"
                      name="name"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 transition-all"
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm text-gray-300">Email</label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      name="email"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 transition-all"
                      placeholder="Votre email"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="message" className="text-sm text-gray-300">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 transition-all"
                    placeholder="Votre message"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary group w-full"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      Envoyer le message
                      <FaPaperPlane className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
              
              {/* Floating decoration element */}
              <motion.div 
                className="absolute -bottom-12 -right-2 sm:-right-6 p-4 glass-card rounded-xl shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <FaRegEnvelope className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Temps de réponse</p>
                    <p className="text-lg font-bold text-purple-300">24h</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <Toaster />
    </section>
  );
};

export default Contact;
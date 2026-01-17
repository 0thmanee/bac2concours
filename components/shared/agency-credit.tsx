"use client";

import { ExternalLink } from "lucide-react";

export function AgencyCredit() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a
        href="https://nevali.services"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-md border border-border rounded-full hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
      >
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          Conçu par
        </span>
        <span className="text-xs font-medium text-gradient">
          Nevali Services
        </span>
        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
      </a>
    </div>
  );
}
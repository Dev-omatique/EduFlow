"use client";

import Link from "next/link";
import { FileQuestion, ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
      {/* Illustration / Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-50 shadow-sm border border-slate-100">
          <FileQuestion className="h-12 w-12 text-primary" />
        </div>
      </div>

      {/* Texte */}
      <div className="max-w-md space-y-4">
        <h1 className="text-6xl font-black text-slate-800 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl font-bold text-slate-700">
          Oups ! Page introuvable
        </h2>
        <p className="text-slate-500 leading-relaxed">
          Il semble que la page que vous cherchez n'existe pas ou a été déplacée. 
          Vérifiez l'URL ou retournez à l'accueil.
        </p>
      </div>

      {/* Boutons d'action */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button
          asChild
          className="rounded-2xl bg-primary px-8 h-12 text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Tableau de bord
          </Link>
        </Button>
      </div>

      {/* Petit rappel décoratif style ENT */}
      <div className="mt-16 text-xs font-medium uppercase tracking-widest text-slate-300">
        EduFlow — Système de Gestion Scolaire
      </div>
    </div>
  );
}
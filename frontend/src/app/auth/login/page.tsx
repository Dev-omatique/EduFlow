"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { refetchUser } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mot de passe trop court.");
      return;
    }

    try {
      setLoading(true);

      const loginResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || "Erreur de connexion");
      }

      await refetchUser();
      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Panneau gauche — identité, visible à partir de md */}
      <div className="hidden md:flex relative flex-col justify-between bg-primary text-primary-foreground p-12 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, var(--primary-foreground) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <span className="text-lg font-semibold tracking-tight">EduFlow</span>
        </div>

        <div className="relative max-w-sm">
          <p className="text-2xl font-semibold leading-snug mb-3">
            Votre espace numérique de travail, réuni au même endroit.
          </p>
          <p className="text-sm text-primary-foreground/80">
            Notes, emploi du temps et communications — un seul compte pour tout suivre.
          </p>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="w-full max-w-sm mx-auto">
          <div className="relative mx-auto mb-3 h-24 w-24">
            <Image
              src="/eduflow-logo.png"
              alt="Logo EduFlow"
              width={96}
              height={96}
              className="absolute left-[48%] top-[54%] h-[155%] w-[155%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
            />
          </div>
          <h1 className="text-center text-xl font-semibold text-foreground">Connexion</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-8">
            Entrez vos identifiants pour accéder à votre espace ENT.
          </p>

          <form onSubmit={handleLogin} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Adresse email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="prenom.nom@etablissement.fr"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className="h-11 bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="h-11 bg-background"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Connexion en cours…" : "Se connecter"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-8 text-center">
            Besoin d&apos;aide ? Contactez l&apos;administration de votre établissement.
          </p>
        </div>
      </div>
    </div>
  );
}
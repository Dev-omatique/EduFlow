"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
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

      const profileResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(profileData.message || "Impossible de récupérer le profil");
      }

      const roleName = profileData.Role?.role?.toLowerCase();

      if (!roleName) {
        throw new Error("Rôle utilisateur introuvable");
      }

      router.push(`/${roleName}`);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      {/* Panneau gauche — identité, visible à partir de md */}
      <div className="hidden md:flex relative flex-col justify-between bg-primary text-white p-12 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          <span className="text-lg font-semibold tracking-tight">EduFlow</span>
        </div>

        <div className="relative max-w-sm">
          <p className="text-2xl font-semibold leading-snug mb-3">
            Votre espace numérique de travail, réuni au même endroit.
          </p>
          <p className="text-sm text-white/80">
            Notes, emploi du temps et communications — un seul compte pour tout suivre.
          </p>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo affiché uniquement sur mobile, remplace le panneau gauche */}
          <div className="flex md:hidden items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <span className="text-base font-semibold text-gray-900">EduFlow</span>
          </div>

          <h1 className="text-xl font-semibold text-gray-900">Connexion</h1>
          <p className="text-sm text-gray-500 mt-1 mb-8">
            Entrez vos identifiants pour accéder à votre espace ENT.
          </p>

          <form onSubmit={handleLogin} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="prenom.nom@etablissement.fr"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-md border border-gray-300 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 rounded-md border border-gray-300 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 border-l-2 border-red-500 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-white text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {loading ? "Connexion en cours…" : "Se connecter"}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-8 text-center">
            Besoin d'aide ? Contactez l'administration de votre établissement.
          </p>
        </div>
      </div>
    </div>
  );
}
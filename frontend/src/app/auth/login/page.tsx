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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur de connexion");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-10">

        {/* Logo + titre */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-3">
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">EduFlow</h1>
          <p className="text-sm text-gray-400 font-medium">Espace ENT</p>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-1">Bonjour 👋</h2>
        <p className="text-sm text-gray-500 mb-6">Connectez-vous à votre espace.</p>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-bold text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#1aaee8] focus:ring-2 focus:ring-[#1aaee8]/20 focus:bg-white transition"
            />
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-bold text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Votre mot de passe"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#1aaee8] focus:ring-2 focus:ring-[#1aaee8]/20 focus:bg-white transition"
            />
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 text-center">
              {error}
            </div>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>

      
        </form>
      </div>
    </div>
  );
}
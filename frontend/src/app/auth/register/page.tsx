"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    birthDate: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const { firstName, lastName, username, email, password, confirmPassword, address, birthDate } = formData;

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword || !address || !birthDate) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    if (username.length < 3) { setError("Le nom d'utilisateur doit faire au moins 3 caractères."); return; }
    if (firstName.length < 2) { setError("Le prénom doit faire au moins 2 caractères."); return; }
    if (lastName.length < 2) { setError("Le nom doit faire au moins 2 caractères."); return; }
    if (password.length < 6) { setError("Le mot de passe doit faire au moins 6 caractères."); return; }
    if (password !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }
    if (new Date(birthDate) >= new Date()) { setError("La date de naissance doit être dans le passé."); return; }

    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL est manquant dans ton .env");

      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ firstName, lastName, username, email, password, address, birthDate }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Erreur lors de l'inscription");

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#1aaee8] focus:ring-2 focus:ring-[#1aaee8]/20 focus:bg-white transition";

  const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-10">

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

        <h2 className="text-xl font-bold text-gray-800 mb-1">Créer un compte</h2>
        <p className="text-sm text-gray-500 mb-6">Rejoignez votre espace ENT.</p>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className={labelClass}>Prénom</label>
              <input id="firstName" name="firstName" type="text" placeholder="Prénom"
                value={formData.firstName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>Nom</label>
              <input id="lastName" name="lastName" type="text" placeholder="Nom"
                value={formData.lastName} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className={labelClass}>Nom d'utilisateur</label>
            <input id="username" name="username" type="text" placeholder="Nom d'utilisateur"
              value={formData.username} onChange={handleChange} className={inputClass} />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" name="email" type="email" placeholder="votre@email.com"
              value={formData.email} onChange={handleChange} autoComplete="email" className={inputClass} />
          </div>

          {/* Adresse */}
          <div>
            <label htmlFor="address" className={labelClass}>Adresse</label>
            <input id="address" name="address" type="text" placeholder="Adresse"
              value={formData.address} onChange={handleChange} className={inputClass} />
          </div>

          {/* Date de naissance */}
          <div>
            <label htmlFor="birthDate" className={labelClass}>Date de naissance</label>
            <input id="birthDate" name="birthDate" type="date"
              value={formData.birthDate} onChange={handleChange} className={inputClass} />
          </div>

          {/* Mot de passe + confirmation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="password" className={labelClass}>Mot de passe</label>
              <input id="password" name="password" type="password" placeholder="••••••"
                value={formData.password} onChange={handleChange} autoComplete="new-password" className={inputClass} />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirmer</label>
              <input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••"
                value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" className={inputClass} />
            </div>
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
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Inscription…" : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  );
}
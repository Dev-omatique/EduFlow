"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const handleRegister = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setError("Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule et un chiffre.");return;}
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

      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-card text-card-foreground rounded-2xl border p-6 shadow-md sm:p-10">

        {/* Logo + titre */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-3">
            <svg
              className="w-8 h-8 text-primary-foreground"
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
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">EduFlow</h1>
          <p className="text-sm text-muted-foreground font-medium">Espace ENT</p>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-1">Créer un compte</h2>
        <p className="text-sm text-muted-foreground mb-6">Rejoignez votre espace ENT.</p>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" name="firstName" type="text" placeholder="Prénom"
                value={formData.firstName} onChange={handleChange} className="h-11 bg-background" />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" name="lastName" type="text" placeholder="Nom"
                value={formData.lastName} onChange={handleChange} className="h-11 bg-background" />
            </div>
          </div>

          {/* Username */}
          <div>
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input id="username" name="username" type="text" placeholder="Nom d'utilisateur"
              value={formData.username} onChange={handleChange} className="h-11 bg-background" />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="votre@email.com"
              value={formData.email} onChange={handleChange} autoComplete="email" className="h-11 bg-background" />
          </div>

          {/* Adresse */}
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" name="address" type="text" placeholder="Adresse"
              value={formData.address} onChange={handleChange} className="h-11 bg-background" />
          </div>

          {/* Date de naissance */}
          <div>
            <Label htmlFor="birthDate">Date de naissance</Label>
            <Input id="birthDate" name="birthDate" type="date"
              value={formData.birthDate} onChange={handleChange} className="h-11 bg-background" />
          </div>

          {/* Mot de passe + confirmation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" placeholder="••••••"
                value={formData.password} onChange={handleChange} autoComplete="new-password" className="h-11 bg-background" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmer</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••"
                value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" className="h-11 bg-background" />
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Bouton */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Inscription…" : "S'inscrire"}
          </Button>
        </form>
      </div>
    </div>
  );
}
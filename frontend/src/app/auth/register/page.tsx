"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const {
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
      address,
      birthDate,
    } = formData;

    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !address ||
      !birthDate
    ) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    if (username.length < 3) {
      setError("Le nom d'utilisateur doit faire au moins 3 caractères.");
      return;
    }

    if (firstName.length < 2) {
      setError("Le prénom doit faire au moins 2 caractères.");
      return;
    }

    if (lastName.length < 2) {
      setError("Le nom doit faire au moins 2 caractères.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (new Date(birthDate) >= new Date()) {
      setError("La date de naissance doit être dans le passé.");
      return;
    }

    try {
      setLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL est manquant dans ton .env");
      }

      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          email,
          password,
          address,
          birthDate,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription");
      }

      console.log("Compte créé :", data);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Créer un compte
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Prénom"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Nom"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Nom d'utilisateur"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Adresse"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/auth/login"
              className="font-medium underline underline-offset-4"
            >
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
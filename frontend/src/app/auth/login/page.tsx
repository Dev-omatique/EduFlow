"use client";

import { includes, z } from "zod";
import DynamicForm from "@/components/auth/DynamicForm"; // Chemin vers ton composant
import Link from "next/link";

// 1. Schéma de validation pour le Login
const loginSchema = z.object({
  email: z.string()
    .email("Format d'email invalide")
    .min(1, "L'email est requis"),
  password: z.string()
    .min(6, "Le mot de passe doit faire au moins 6 caractères"),
});

export default function LoginPage() {
  
  // 2. Configuration des champs du formulaire
  const loginFields = [
    { 
      name: "email", 
      type: "email", 
      placeholder: "votre@email.com" 
    },
    { 
      name: "password", 
      type: "password", 
      placeholder: "Votre mot de passe" 
    },
  ];

  // 3. Logique de soumission vers ton backend Express (Port 3001)
  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include", // <--- OBLIGATOIRE pour recevoir le cookie
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Identifiants incorrects");
      }

      // Succès : Tu reçois ton Token ici
      console.log("Connecté ! Token :", data.token);
      
      // Exemple de redirection (si tu importes useRouter de next/navigation)
      // router.push("/dashboard");

    } catch (error: any) {
      console.error("Erreur login:", error.message);
      // Optionnel : Tu pourrais gérer un état d'erreur pour l'afficher dans l'UI
      alert(error.message); 
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <div className="w-full max-w-md">
        
        {/* Ton composant dynamique */}
        <DynamicForm
          title="Connexion"
          fields={loginFields}
          submitText="Se connecter"
          schema={loginSchema}
          onSubmit={handleLogin}
        />

        <div className="mt-4 text-center text-sm text-zinc-500">
          Pas encore de compte ?{" "}
          <Link 
            href="/auth/register" 
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-100"
          >
            Créer un compte
          </Link>
        </div>
        
      </div>
    </div>
  );
}
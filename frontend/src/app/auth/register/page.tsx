"use client";

import { z } from "zod";
import DynamicForm from "@/components/auth/DynamicForm";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Pour la redirection

// 1. Schéma de validation
const registerSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit faire au moins 3 caractères"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"], // L'erreur s'affichera sous ce champ
});

export default function RegisterPage() {
  const router = useRouter();

  // 2. Configuration des champs
  const registerFields = [
    { 
      name: "username", 
      type: "text", 
      placeholder: "Nom d'utilisateur" 
    },
    { 
      name: "email", 
      type: "email", 
      placeholder: "votre@email.com" 
    },
    { 
      name: "password", 
      type: "password", 
      placeholder: "Mot de passe" 
    },
    { 
      name: "confirmPassword", 
      type: "password", 
      placeholder: "Confirmer le mot de passe" 
    },
  ];

  // 3. Logique de soumission
  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
          // Nous n'envoyons pas 'confirmPassword' au backend
        }),
        credentials: "include", // ✅ Important pour recevoir le cookie
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription");
      }

      // Si tout est bon, l'utilisateur est inscrit ET connecté
      console.log("Compte créé et connecté !");
      router.push("/dashboard"); // Redirection vers ton dashboard ou page d'accueil

    } catch (error: any) {
      console.error("Erreur register:", error.message);
      alert(error.message); // En prod, tu pourrais utiliser un toast (sonner) ici
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <div className="w-full max-w-md">
        
        {/* Ton composant dynamique */}
        <DynamicForm
          title="Créer un compte"
          fields={registerFields}
          submitText="S'inscrire"
          schema={registerSchema}
          onSubmit={handleRegister}
        />

        <div className="mt-4 text-center text-sm text-zinc-500">
          Vous avez déjà un compte ?{" "}
          <Link 
            href="/auth/login" 
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-100"
          >
            Se connecter
          </Link>
        </div>
        
      </div>
    </div>
  );
}
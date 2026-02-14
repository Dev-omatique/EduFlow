"use client";

  import { z } from "zod";
  import DynamicForm from "@/components/auth/DynamicForm";
  import Link from "next/link";
import { join } from "path";

  const loginSchema = z.object({
    email: z.string()
      .email("Format d'email invalide")
      .min(1, "L'email est requis"),
    password: z.string()
      .min(6, "Le mot de passe doit faire au moins 6 caractères"),
  });

  export default function LoginPage() {

    const loginFields = [
      { name: "email", type: "email", placeholder: "votre@email.com" },
      { name: "password", type: "password", placeholder: "Votre mot de passe" },
    ];

    const handleLogin = async (values: z.infer<typeof loginSchema>) => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const apiUrl = `${baseUrl}/api/auth/login`;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Identifiants incorrects");
        }

        console.log("Connecté !");

      } catch (error: any) {
        console.error("Erreur login:", error.message);
        alert(error.message); 
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
        <div className="w-full max-w-md">

          <DynamicForm
            title="Connexion"
            fields={loginFields}
            submitText="Se connecter"
            schema={loginSchema}
            onSubmit={handleLogin}
          />
        </div>
      </div>
    );
  } 
"use client";

import { z } from "zod";
import { useRouter } from "next/navigation";
import DynamicForm from "@/components/auth/DynamicForm";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

export default function LoginPage() {
  const router = useRouter();

  async function handleLogin(values: any) {
    const res = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Erreur");
    }

    router.push("/");
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <DynamicForm
        title="Connexion"
        submitText="Se connecter"
        fields={[
          { name: "email", type: "email", placeholder: "Email" },
          { name: "password", type: "password", placeholder: "Mot de passe" },
        ]}
        schema={loginSchema}
        onSubmit={handleLogin}
      />
    </div>
  );
}

"use client";

import { z } from "zod";
import DynamicForm from "@/components/auth/DynamicForm";
import Link from "next/link";
import { useRouter } from "next/navigation";


const registerSchema = z.object({
username: z.string().min(3, "Le nom d'utilisateur doit faire au moins 3 caractères"),
email: z.string().email("Format d'email invalide"),
password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
message: "Les mots de passe ne correspondent pas",
path: ["confirmPassword"], 
});

export default function RegisterPage() {
const router = useRouter();

const registerFields = [
    { 
        name: "fristname", 
        type: "text", 
        placeholder: "prenom" 
    },
    { 
        name: "lastname", 
        type: "text", 
        placeholder: "nom" 
    },
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
    }
];

const handleRegister = async (values: z.infer<typeof registerSchema>) => {
        try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const apiUrl = `${baseUrl}/api/auth/register`;
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            username: values.username,
            email: values.email,
            password: values.password,
            fristName: values.fristname,
            lastName: values.lastname,
            
            }),
            credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Erreur lors de l'inscription");
        }

        console.log("Compte créé et connecté !");
        router.push("/dashboard");

        } catch (error: any) {
            console.error("Erreur register:", error.message);
            alert(error.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
            <div className="w-full max-w-md">
                
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
"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Newspaper, Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Composants shadcn/ui
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type NewsBackend = {
  id: number;
  title: string;
  description?: string;
  file?: string;
  responsibleId?: number;
  createdAt: string;
  updatedAt?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchNews() {
  const url = `${API_BASE_URL}/api/news`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<NewsBackend[]>;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function NewsWidget() {
  const { user, isLoading } = useAuth();
  const [news, setNews] = useState<NewsBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    fetchNews()
      .then((data) => setNews(data.slice(0, 4))) // 4 dernières actualités
      .catch((err) => {
        console.error("Failed to fetch news:", err);
        setError("Impossible de charger les actualités.");
      })
      .finally(() => setLoading(false));
  }, [isLoading, user]);

  if (loading || isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
          <span className="text-sm">Chargement des actualités...</span>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connexion requise</AlertTitle>
        <AlertDescription>
          Connectez-vous pour voir les actualités.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Actualités</CardTitle>
            <CardDescription className="mt-1">
              Annonces et vie de l'établissement
            </CardDescription>
          </div>
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Newspaper className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <Newspaper className="h-8 w-8 stroke-1 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium">Aucune actualité pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {news.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-3.5 transition-colors hover:bg-muted/50 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                {/* Affichage direct de la colonne description */}
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
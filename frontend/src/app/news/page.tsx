"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Newspaper, Plus, AlertCircle, Megaphone } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

// Composants shadcn/ui
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type NewsItem = {
  id: number;
  title: string;
  description: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function fetchNews() {
  const response = await fetch(`${API_BASE_URL}/api/news`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<NewsItem[]>;
}

async function createNews(payload: { title: string; description: string; responsibleId?: number }) {
  const response = await fetch(`${API_BASE_URL}/api/news`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json() as Promise<NewsItem>;
}

export default function NewsPage() {
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isVieScolaire = user?.Role?.role === "VIE_SCOLAIRE";

  useEffect(() => {
    fetchNews()
      .then((data) => setNews(data))
      .catch((err) => {
        console.error("Failed to fetch news:", err);
        setError("Impossible de charger les actualités.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreateNews(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newTitle.trim() || !newDescription.trim()) {
      setSubmitError("Le titre et la description sont obligatoires.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const created = await createNews({
        title: newTitle.trim(),
        description: newDescription.trim(),
        responsibleId: user?.id,
      });

      setNews((prev) => [created, ...prev]);
      setNewTitle("");
      setNewDescription("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create news:", err);
      setSubmitError("Impossible de créer la news.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Sidebar />
      <main className="min-h-screen bg-background p-4 lg:pl-[270px]">
        <div className="mx-auto w-full max-w-7xl space-y-6 py-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-6">
              <div>
                <CardTitle className="text-2xl font-bold">Actualités</CardTitle>
                <CardDescription className="mt-1">
                  Toutes les annonces et nouvelles publiées dans l&apos;établissement.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isVieScolaire && (
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Ajouter une news
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle>Créer une nouvelle news</DialogTitle>
                        <DialogDescription>
                          Rédigez le contenu visible par tous les utilisateurs de la plateforme.
                        </DialogDescription>
                      </DialogHeader>

                      <form id="create-news-form" onSubmit={handleCreateNews} className="space-y-4 py-2">
                        <div className="space-y-2">
                          <label htmlFor="news-title" className="text-sm font-medium leading-none">
                            Titre
                          </label>
                          <Input
                            id="news-title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Titre de la news"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="news-description" className="text-sm font-medium leading-none">
                            Description
                          </label>
                          <Textarea
                            id="news-description"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            rows={5}
                            placeholder="Écrivez le contenu de la news..."
                            className="resize-none"
                          />
                        </div>

                        {submitError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>{submitError}</AlertDescription>
                          </Alert>
                        )}

                        <DialogFooter className="pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                          >
                            Annuler
                          </Button>
                          <Button type="submit" disabled={submitting} className="gap-2">
                            {submitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Création...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4" />
                                Publier
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs font-medium">
                  <Newspaper className="h-4 w-4 text-primary" />
                  À jour
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex h-32 items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm">Chargement des actualités...</span>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : news.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                  <Megaphone className="h-10 w-10 stroke-1 mb-3 text-muted-foreground/60" />
                  <p className="text-sm font-medium">Aucune actualité publiée pour le moment.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {news.map((item) => (
                    <Card key={item.id} className="bg-muted/30 border-muted">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Page introuvable
      </p>
      <a
        href="/dashboard"
        className="mt-6 rounded-xl bg-primary px-6 py-3 text-white hover:bg-primary-hover"
      >
        Retour au dashboard
      </a>
    </div>
  );
}
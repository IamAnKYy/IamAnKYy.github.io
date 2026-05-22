import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/hooks/use-store";
import { isDue } from "@/lib/srs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const store = useStore();
  const totalCards = store.cards.length;
  const dueCount = store.cards.filter((c) => isDue(c.srs)).length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12">
        <p className="font-sans-ui text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          A quiet place to learn
        </p>
        <h1 className="font-display text-5xl md:text-6xl text-foreground leading-[1.05]">
          Inkwell.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground italic">
          Flashcards without the noise. No streaks. No points. No leaderboards.
          Just you, your material, and time.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3 mb-12">
        <Stat label="Decks" value={store.decks.length} />
        <Stat label="Cards" value={totalCards} />
        <Stat label="Due today" value={dueCount} accent />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/import" className="group">
          <Card className="h-full transition-colors hover:bg-secondary">
            <CardContent className="p-6">
              <Sparkles className="h-5 w-5 text-accent mb-4" />
              <h2 className="font-display text-2xl mb-1">Import with AI</h2>
              <p className="font-sans-ui text-sm text-muted-foreground mb-4">
                Paste text or upload a PDF. Get atomic flashcards, multiple-choice
                quizzes, and a memory aid for each card.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-sans-ui text-accent">
                Start importing <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="p-6">
            <Layers className="h-5 w-5 text-foreground mb-4" />
            <h2 className="font-display text-2xl mb-1">Recent decks</h2>
            {store.decks.length === 0 ? (
              <p className="font-sans-ui text-sm text-muted-foreground">
                Decks you create or import will appear here.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {store.decks
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .slice(0, 5)
                  .map((d) => {
                    const n = store.cards.filter((c) => c.deckId === d.id).length;
                    return (
                      <li key={d.id}>
                        <Link
                          to="/deck/$deckId"
                          params={{ deckId: d.id }}
                          className="flex justify-between font-sans-ui text-sm py-1.5 border-b border-border last:border-0 hover:text-accent"
                        >
                          <span>{d.name}</span>
                          <span className="text-muted-foreground text-xs">{n} cards</span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {dueCount > 0 && (
        <div className="mt-8">
          <Button asChild size="lg" variant="default">
            <Link to="/review">Review {dueCount} due cards</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="border-b border-border pb-4">
      <div className={`font-display text-4xl ${accent ? "text-accent" : "text-foreground"}`}>
        {value}
      </div>
      <div className="font-sans-ui text-xs uppercase tracking-wider text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}

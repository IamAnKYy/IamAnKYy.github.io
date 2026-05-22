import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteCard } from "@/lib/storage";
import { isDue } from "@/lib/srs";
import {
  Layers,
  Play,
  Keyboard,
  CheckSquare,
  Brain,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/deck/$deckId")({
  component: DeckPage,
});

function DeckPage() {
  const { deckId } = Route.useParams();
  const store = useStore();
  const navigate = useNavigate();
  const deck = store.decks.find((d) => d.id === deckId);
  const cards = store.cards.filter((c) => c.deckId === deckId);

  if (!deck) {
    return (
      <div className="p-12 text-center text-muted-foreground italic">
        That deck doesn't exist.{" "}
        <Link to="/" className="text-accent underline">
          Go home
        </Link>
      </div>
    );
  }

  const dueCount = cards.filter((c) => isDue(c.srs)).length;

  const modes: { to: "/study/$deckId/flashcard" | "/study/$deckId/typing" | "/study/$deckId/quiz" | "/study/$deckId/review"; label: string; desc: string; Icon: any }[] = [
    { to: "/study/$deckId/flashcard", label: "Flashcards", desc: "Flip to reveal", Icon: Layers },
    { to: "/study/$deckId/typing", label: "Typing", desc: "Type the exact answer", Icon: Keyboard },
    { to: "/study/$deckId/quiz", label: "Multiple choice", desc: "Pick the right option", Icon: CheckSquare },
    { to: "/study/$deckId/review", label: "Spaced review", desc: `${dueCount} due now`, Icon: Brain },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8">
        <p className="font-sans-ui text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Deck
        </p>
        <h1 className="font-display text-4xl">{deck.name}</h1>
        <p className="font-sans-ui text-sm text-muted-foreground mt-1">
          {cards.length} cards · {dueCount} due
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 mb-10">
        {modes.map(({ to, label, desc, Icon }) => (
          <button
            key={to}
            onClick={() => navigate({ to, params: { deckId } })}
            disabled={cards.length === 0}
            className="text-left disabled:opacity-50"
          >
            <Card className="transition-colors hover:bg-secondary h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-display text-xl">{label}</div>
                  <div className="font-sans-ui text-xs text-muted-foreground">{desc}</div>
                </div>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <div>
        <h2 className="font-display text-2xl mb-3">Cards</h2>
        {cards.length === 0 ? (
          <p className="text-muted-foreground italic font-sans-ui text-sm">
            No cards yet.{" "}
            <Link to="/import" className="text-accent underline">
              Import some with AI
            </Link>{" "}
            to fill this deck.
          </p>
        ) : (
          <div className="space-y-2">
            {cards.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-lg leading-snug">{c.question}</div>
                      <div className="font-sans-ui text-sm mt-1 text-foreground">
                        <span className="text-muted-foreground">Answer · </span>
                        {c.answer}
                      </div>
                      <div className="font-sans-ui text-xs mt-2 text-muted-foreground whitespace-pre-wrap border-l-2 border-accent/40 pl-3 italic">
                        {c.memoryAid}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="font-sans-ui text-[10px]">
                        Box {c.srs.box}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm("Delete this card?")) deleteCard(c.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudyShell, MemoryAid } from "@/components/study/StudyShell";

export const Route = createFileRoute("/study/$deckId/flashcard")({
  component: FlashcardMode,
});

function FlashcardMode() {
  const { deckId } = Route.useParams();
  const store = useStore();
  const cards = useMemo(() => store.cards.filter((c) => c.deckId === deckId), [store, deckId]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return <Empty deckId={deckId} />;
  }

  const card = cards[i];
  const done = i >= cards.length;

  return (
    <StudyShell deckId={deckId} title="Flashcards" index={i} total={cards.length}>
      {done ? (
        <Completion deckId={deckId} onRestart={() => { setI(0); setFlipped(false); }} />
      ) : (
        <>
          <Card
            className="min-h-[280px] cursor-pointer select-none"
            onClick={() => setFlipped((f) => !f)}
          >
            <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[280px]">
              {!flipped ? (
                <>
                  <p className="font-sans-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
                    Question
                  </p>
                  <p className="font-display text-2xl leading-snug">{card.question}</p>
                  <p className="font-sans-ui text-xs text-muted-foreground mt-8">Click to flip</p>
                </>
              ) : (
                <div className="w-full text-left">
                  <p className="font-sans-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    Answer
                  </p>
                  <p className="font-display text-2xl leading-snug">{card.answer}</p>
                  <MemoryAid text={card.memoryAid} />
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              disabled={i === 0}
              onClick={() => { setI((x) => x - 1); setFlipped(false); }}
            >
              Previous
            </Button>
            <Button onClick={() => { setI((x) => x + 1); setFlipped(false); }}>
              {i + 1 === cards.length ? "Finish" : "Next"}
            </Button>
          </div>
        </>
      )}
    </StudyShell>
  );
}

function Empty({ deckId }: { deckId: string }) {
  return (
    <div className="p-12 text-center text-muted-foreground italic">
      No cards in this deck.{" "}
      <Link to="/deck/$deckId" params={{ deckId }} className="text-accent underline">
        Back
      </Link>
    </div>
  );
}

function Completion({ deckId, onRestart }: { deckId: string; onRestart: () => void }) {
  return (
    <Card>
      <CardContent className="p-10 text-center">
        <p className="font-display text-3xl mb-3">Session complete.</p>
        <p className="font-sans-ui text-sm text-muted-foreground italic mb-6">
          Rest a moment. Learning is the pause as much as the work.
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={onRestart}>Study again</Button>
          <Button asChild>
            <Link to="/deck/$deckId" params={{ deckId }}>Back to deck</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
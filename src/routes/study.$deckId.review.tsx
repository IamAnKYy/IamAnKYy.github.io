import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudyShell, MemoryAid } from "@/components/study/StudyShell";
import { applyRating, isDue, type Rating } from "@/lib/srs";
import { updateCard } from "@/lib/storage";

export const Route = createFileRoute("/study/$deckId/review")({
  component: ReviewMode,
});

function ReviewMode() {
  const { deckId } = Route.useParams();
  return <ReviewSession scope={{ deckId }} backTo={{ to: "/deck/$deckId", params: { deckId } }} />;
}

export function ReviewSession({
  scope,
  backTo,
}: {
  scope: { deckId?: string };
  backTo: { to: "/" | "/deck/$deckId"; params?: { deckId: string } };
}) {
  const store = useStore();
  const queue = useMemo(() => {
    const filtered = scope.deckId
      ? store.cards.filter((c) => c.deckId === scope.deckId)
      : store.cards;
    return filtered.filter((c) => isDue(c.srs));
  }, [store, scope.deckId]);

  const [seenIds, setSeenIds] = useState<string[]>([]);
  const remaining = queue.filter((c) => !seenIds.includes(c.id));
  const card = remaining[0];
  const [showAnswer, setShowAnswer] = useState(false);

  const total = queue.length;
  const index = seenIds.length;
  const deckIdForShell = scope.deckId ?? "review";

  function rate(r: Rating) {
    if (!card) return;
    updateCard(card.id, { srs: applyRating(card.srs, r) });
    setSeenIds((s) => [...s, card.id]);
    setShowAnswer(false);
  }

  if (total === 0 || !card) {
    return (
      <StudyShell deckId={deckIdForShell} title="Spaced review" index={total} total={total}>
        <Card>
          <CardContent className="p-10 text-center">
            <p className="font-display text-3xl mb-3">Nothing due.</p>
            <p className="font-sans-ui text-sm text-muted-foreground italic mb-6">
              Cards will return when their next review is scheduled.
            </p>
            <Button asChild>
              {backTo.params ? (
                <Link to="/deck/$deckId" params={backTo.params}>Back</Link>
              ) : (
                <Link to="/">Home</Link>
              )}
            </Button>
          </CardContent>
        </Card>
      </StudyShell>
    );
  }

  return (
    <StudyShell deckId={deckIdForShell} title="Spaced review" index={index} total={total}>
      <Card className="min-h-[280px]">
        <CardContent className="p-8">
          <p className="font-sans-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Question</p>
          <p className="font-display text-2xl leading-snug">{card.question}</p>

          {showAnswer && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="font-sans-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Answer</p>
              <p className="font-display text-2xl leading-snug">{card.answer}</p>
              <MemoryAid text={card.memoryAid} />
            </div>
          )}
        </CardContent>
      </Card>

      {!showAnswer ? (
        <Button className="w-full mt-6" size="lg" onClick={() => setShowAnswer(true)}>
          Show answer
        </Button>
      ) : (
        <div className="grid grid-cols-3 gap-2 mt-6">
          <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/5" onClick={() => rate("hard")}>
            Hard
            <span className="block font-sans-ui text-[10px] text-muted-foreground">soon</span>
          </Button>
          <Button variant="outline" onClick={() => rate("good")}>
            Good
            <span className="block font-sans-ui text-[10px] text-muted-foreground">later</span>
          </Button>
          <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/5" onClick={() => rate("easy")}>
            Easy
            <span className="block font-sans-ui text-[10px] text-muted-foreground">much later</span>
          </Button>
        </div>
      )}
    </StudyShell>
  );
}
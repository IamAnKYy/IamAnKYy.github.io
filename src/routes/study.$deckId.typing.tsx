import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudyShell, MemoryAid } from "@/components/study/StudyShell";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/study/$deckId/typing")({
  component: TypingMode,
});

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,;:!?]$/, "");
}

function TypingMode() {
  const { deckId } = Route.useParams();
  const store = useStore();
  const cards = useMemo(() => store.cards.filter((c) => c.deckId === deckId), [store, deckId]);
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground italic">
        No cards.{" "}
        <Link to="/deck/$deckId" params={{ deckId }} className="text-accent underline">Back</Link>
      </div>
    );
  }

  const card = cards[i];
  const done = i >= cards.length;
  const correct = submitted && normalize(value) === normalize(card?.answer ?? "");

  if (done) {
    return (
      <StudyShell deckId={deckId} title="Typing" index={cards.length} total={cards.length}>
        <Card><CardContent className="p-10 text-center">
          <p className="font-display text-3xl mb-3">Session complete.</p>
          <Button asChild><Link to="/deck/$deckId" params={{ deckId }}>Back to deck</Link></Button>
        </CardContent></Card>
      </StudyShell>
    );
  }

  return (
    <StudyShell deckId={deckId} title="Typing" index={i} total={cards.length}>
      <Card>
        <CardContent className="p-8">
          <p className="font-sans-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Question</p>
          <p className="font-display text-2xl leading-snug mb-6">{card.question}</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={submitted}
              placeholder="Type the exact answer…"
              className="font-sans-ui text-base h-12"
            />
            {!submitted && (
              <Button type="submit" className="mt-4 w-full" disabled={!value.trim()}>
                Check answer
              </Button>
            )}
          </form>

          {submitted && (
            <div className="mt-5 space-y-3">
              <div
                className={`flex items-start gap-2 rounded-md p-3 border ${
                  correct
                    ? "border-green-600/30 bg-green-600/5 text-green-700"
                    : "border-destructive/30 bg-destructive/5 text-destructive"
                }`}
              >
                {correct ? <Check className="h-4 w-4 mt-0.5" /> : <X className="h-4 w-4 mt-0.5" />}
                <div className="font-sans-ui text-sm">
                  {correct ? (
                    "Exact match."
                  ) : (
                    <>
                      <span className="font-medium">Correct answer:</span> {card.answer}
                    </>
                  )}
                </div>
              </div>
              <MemoryAid text={card.memoryAid} />
              <Button
                className="w-full"
                onClick={() => {
                  setI((x) => x + 1);
                  setValue("");
                  setSubmitted(false);
                }}
              >
                {i + 1 === cards.length ? "Finish" : "Next card"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </StudyShell>
  );
}
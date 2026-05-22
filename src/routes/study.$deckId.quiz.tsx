import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudyShell, MemoryAid } from "@/components/study/StudyShell";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/study/$deckId/quiz")({
  component: QuizMode,
});

function QuizMode() {
  const { deckId } = Route.useParams();
  const store = useStore();
  const all = useMemo(() => store.cards.filter((c) => c.deckId === deckId), [store, deckId]);
  const cards = useMemo(() => all.filter((c) => c.quiz && c.quiz.choices?.length === 4), [all]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  if (all.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground italic">
        No cards.{" "}
        <Link to="/deck/$deckId" params={{ deckId }} className="text-accent underline">Back</Link>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <StudyShell deckId={deckId} title="Multiple choice" index={0} total={0}>
        <Card><CardContent className="p-8 text-center text-muted-foreground italic">
          This deck has no multiple-choice quizzes. Re-import the source with AI to generate them.
        </CardContent></Card>
      </StudyShell>
    );
  }

  const done = i >= cards.length;
  if (done) {
    return (
      <StudyShell deckId={deckId} title="Multiple choice" index={cards.length} total={cards.length}>
        <Card><CardContent className="p-10 text-center">
          <p className="font-display text-3xl mb-4">Session complete.</p>
          <Button asChild><Link to="/deck/$deckId" params={{ deckId }}>Back to deck</Link></Button>
        </CardContent></Card>
      </StudyShell>
    );
  }

  const card = cards[i];
  const quiz = card.quiz!;

  return (
    <StudyShell deckId={deckId} title="Multiple choice" index={i} total={cards.length}>
      <Card>
        <CardContent className="p-8">
          <p className="font-sans-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Question</p>
          <p className="font-display text-2xl leading-snug mb-6">{card.question}</p>

          <div className="space-y-2">
            {quiz.choices.map((choice, idx) => {
              const isPicked = picked === idx;
              const isCorrect = idx === quiz.correctIndex;
              const reveal = picked !== null;
              let cls = "border-border hover:bg-secondary";
              if (reveal && isCorrect) cls = "border-green-600/40 bg-green-600/5";
              else if (reveal && isPicked && !isCorrect) cls = "border-destructive/40 bg-destructive/5";
              return (
                <button
                  key={idx}
                  onClick={() => picked === null && setPicked(idx)}
                  disabled={picked !== null}
                  className={`w-full text-left rounded-md border px-4 py-3 font-sans-ui text-sm transition-colors flex items-center gap-3 ${cls}`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{choice}</span>
                  {reveal && isCorrect && <Check className="h-4 w-4 text-green-700" />}
                  {reveal && isPicked && !isCorrect && <X className="h-4 w-4 text-destructive" />}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <>
              <MemoryAid text={card.memoryAid} />
              <Button
                className="mt-5 w-full"
                onClick={() => {
                  setI((x) => x + 1);
                  setPicked(null);
                }}
              >
                {i + 1 === cards.length ? "Finish" : "Next question"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </StudyShell>
  );
}
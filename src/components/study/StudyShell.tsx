import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function StudyShell({
  deckId,
  title,
  index,
  total,
  children,
}: {
  deckId: string;
  title: string;
  index: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/deck/$deckId"
          params={{ deckId }}
          className="inline-flex items-center gap-1.5 font-sans-ui text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to deck
        </Link>
        <p className="font-sans-ui text-xs uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      </div>
      <Progress value={total === 0 ? 0 : (index / total) * 100} className="h-1 mb-8" />
      <p className="font-sans-ui text-xs text-muted-foreground mb-6">
        Card {Math.min(index + 1, Math.max(total, 1))} of {total}
      </p>
      {children}
    </div>
  );
}

export function MemoryAid({ text }: { text: string }) {
  return (
    <div className="mt-6 rounded-md border border-accent/30 bg-accent/5 p-4">
      <p className="font-sans-ui text-[10px] uppercase tracking-[0.2em] text-accent mb-2">
        Memory aid
      </p>
      <p className="font-sans-ui text-sm whitespace-pre-wrap leading-relaxed text-foreground italic">
        {text}
      </p>
    </div>
  );
}
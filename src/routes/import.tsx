import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { generateCards } from "@/lib/ai.functions";
import { addCards, createDeck } from "@/lib/storage";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, Sparkles } from "lucide-react";

export const Route = createFileRoute("/import")({
  component: ImportPage,
});

function ImportPage() {
  const store = useStore();
  const navigate = useNavigate();
  const fn = useServerFn(generateCards);
  const [text, setText] = useState("");
  const [deckName, setDeckName] = useState("");
  const [folder, setFolder] = useState<string>("root");
  const [count, setCount] = useState(12);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePdf(file: File) {
    setPdfName(file.name);
    try {
      const pdfjs = await import("pdfjs-dist");
      const workerUrl = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      let all = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        all += content.items.map((it: any) => it.str).join(" ") + "\n\n";
      }
      setText(all.trim());
      if (!deckName) setDeckName(file.name.replace(/\.pdf$/i, ""));
      toast.success(`Extracted ${doc.numPages} pages`);
    } catch (e) {
      console.error(e);
      toast.error("Could not read PDF. Try pasting the text instead.");
    }
  }

  async function handleGenerate() {
    if (text.trim().length < 20) {
      toast.error("Please provide at least a paragraph of source material.");
      return;
    }
    if (!deckName.trim()) {
      toast.error("Give the deck a name.");
      return;
    }
    setLoading(true);
    try {
      const trimmed = text.slice(0, 60_000);
      const res = await fn({ data: { text: trimmed, count } });
      const deck = createDeck(deckName.trim(), folder === "root" ? null : folder);
      addCards(
        deck.id,
        res.cards.map((c) => ({
          question: c.question,
          answer: c.answer,
          memoryAid: c.memoryAid,
          quiz: c.quiz
            ? { question: c.question, choices: c.quiz.choices, correctIndex: c.quiz.correctIndex }
            : undefined,
        })),
      );
      toast.success(`Created ${res.cards.length} cards`);
      navigate({ to: "/deck/$deckId", params: { deckId: deck.id } });
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <p className="font-sans-ui text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
          AI import
        </p>
        <h1 className="font-display text-4xl">Turn a chapter into a deck.</h1>
        <p className="mt-2 text-muted-foreground italic">
          Paste any text, or drop a PDF. Each card comes with a question, an answer,
          and a memory aid — a Hindi sentence-trick, a mnemonic, or a compact table.
        </p>
      </header>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="font-sans-ui text-xs uppercase tracking-wider">PDF (optional)</Label>
            <label className="flex items-center gap-3 border border-dashed border-border rounded-md px-4 py-6 cursor-pointer hover:bg-secondary transition-colors">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-sans-ui text-sm">
                  {pdfName ?? "Click to choose a PDF — we'll extract the text"}
                </p>
                <p className="font-sans-ui text-xs text-muted-foreground">
                  Parsed in your browser. The extracted text is shown below.
                </p>
              </div>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePdf(f);
                }}
              />
            </label>
          </div>

          <div className="space-y-2">
            <Label className="font-sans-ui text-xs uppercase tracking-wider">Source text</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder="Paste your notes, textbook excerpt, or definitions here…"
              className="font-sans-ui text-sm"
            />
            <p className="font-sans-ui text-xs text-muted-foreground">
              {text.length.toLocaleString()} characters
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-sans-ui text-xs uppercase tracking-wider">Deck name</Label>
              <Input value={deckName} onChange={(e) => setDeckName(e.target.value)} placeholder="e.g. Krebs cycle" />
            </div>
            <div className="space-y-2">
              <Label className="font-sans-ui text-xs uppercase tracking-wider">Folder</Label>
              <Select value={folder} onValueChange={setFolder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">— Top level —</SelectItem>
                  {store.folders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-sans-ui text-xs uppercase tracking-wider flex justify-between">
              <span>Cards to generate</span>
              <span className="text-foreground">{count}</span>
            </Label>
            <Slider value={[count]} min={3} max={30} step={1} onValueChange={(v) => setCount(v[0])} />
          </div>

          <Button onClick={handleGenerate} disabled={loading} size="lg" className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate flashcards
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
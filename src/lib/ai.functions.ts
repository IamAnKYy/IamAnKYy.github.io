import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  text: z.string().min(20).max(120_000),
  count: z.number().int().min(3).max(40).default(12),
});

const CardSchema = z.object({
  question: z.string(),
  answer: z.string(),
  memoryAid: z.string(),
  quiz: z
    .object({
      choices: z.array(z.string()).length(4),
      correctIndex: z.number().int().min(0).max(3),
    })
    .optional(),
});

export const generateCards = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a study-card author. Given source material, you produce concise, accurate flashcards.

Each card MUST have:
- question: a focused, atomic question testing ONE fact, concept, or formula.
- answer: the precise correct answer (short — a phrase, formula, or 1-2 sentences).
- memoryAid: a memorable Hindi sentence-trick (Hinglish ok), OR a mnemonic acronym, OR a clean compact comparison table written as plain text (use | separators and \\n newlines). Pick whichever fits the fact best. Always include something — never leave it empty. Hindi tricks are preferred for lists and sequences.
- quiz: a 4-option multiple-choice with the correctIndex of the right option. Distractors should be plausible.

Rules:
- Cover the source breadth-first; avoid duplicates.
- Prefer atomic cards over compound ones.
- For formulas/terminology, the answer must be the exact term or formula.
- Output ONLY valid JSON via the provided tool.`;

    const userPrompt = `Generate ${data.count} flashcards from the following source material:\n\n${data.text}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_cards",
              description: "Emit the generated flashcards.",
              parameters: {
                type: "object",
                properties: {
                  cards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "string" },
                        memoryAid: { type: "string" },
                        quiz: {
                          type: "object",
                          properties: {
                            choices: {
                              type: "array",
                              items: { type: "string" },
                              minItems: 4,
                              maxItems: 4,
                            },
                            correctIndex: { type: "integer", minimum: 0, maximum: 3 },
                          },
                          required: ["choices", "correctIndex"],
                          additionalProperties: false,
                        },
                      },
                      required: ["question", "answer", "memoryAid", "quiz"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["cards"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_cards" } },
      }),
    });

    if (resp.status === 429) throw new Error("Rate limit reached — try again in a moment.");
    if (resp.status === 402) throw new Error("AI credits exhausted. Add credits in Lovable workspace settings.");
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      throw new Error("AI generation failed.");
    }

    const json = await resp.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("AI returned no cards.");
    const args = JSON.parse(call.function.arguments);
    const cards = z.object({ cards: z.array(CardSchema) }).parse(args).cards;
    return { cards };
  });
import type { Card, Deck, Folder, Store, SRSState } from "./types";

const KEY = "inkwell.store.v1";

function emptyStore(): Store {
  return { folders: [], decks: [], cards: [] };
}

let cache: Store | null = null;
let lastRaw: string | null = null;

export function loadStore(): Store {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === lastRaw && cache) return cache;
    lastRaw = raw;
    if (!raw) {
      cache = emptyStore();
      return cache;
    }
    const parsed = JSON.parse(raw) as Store;
    cache = {
      folders: parsed.folders ?? [],
      decks: parsed.decks ?? [],
      cards: parsed.cards ?? [],
    };
    return cache;
  } catch {
    cache = emptyStore();
    return cache;
  }
}

const listeners = new Set<() => void>();

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function saveStore(s: Store) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(s);
  localStorage.setItem(KEY, raw);
  lastRaw = raw;
  cache = s;
  listeners.forEach((l) => l());
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function newSRS(): SRSState {
  return { box: 1, due: Date.now(), reviews: 0 };
}

// ---- mutations ----
export function createFolder(name: string, parentId: string | null = null): Folder {
  const s = loadStore();
  const f: Folder = { id: uid(), name, parentId, createdAt: Date.now() };
  s.folders.push(f);
  saveStore(s);
  return f;
}

export function renameFolder(id: string, name: string) {
  const s = loadStore();
  const f = s.folders.find((x) => x.id === id);
  if (f) f.name = name;
  saveStore(s);
}

export function deleteFolder(id: string) {
  const s = loadStore();
  // recursive collect
  const toDelete = new Set<string>([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of s.folders) {
      if (f.parentId && toDelete.has(f.parentId) && !toDelete.has(f.id)) {
        toDelete.add(f.id);
        changed = true;
      }
    }
  }
  const deckIds = new Set(s.decks.filter((d) => d.folderId && toDelete.has(d.folderId)).map((d) => d.id));
  s.folders = s.folders.filter((f) => !toDelete.has(f.id));
  s.decks = s.decks.filter((d) => !deckIds.has(d.id));
  s.cards = s.cards.filter((c) => !deckIds.has(c.deckId));
  saveStore(s);
}

export function createDeck(name: string, folderId: string | null = null, description?: string): Deck {
  const s = loadStore();
  const d: Deck = { id: uid(), name, folderId, description, createdAt: Date.now() };
  s.decks.push(d);
  saveStore(s);
  return d;
}

export function renameDeck(id: string, name: string) {
  const s = loadStore();
  const d = s.decks.find((x) => x.id === id);
  if (d) d.name = name;
  saveStore(s);
}

export function moveDeck(id: string, folderId: string | null) {
  const s = loadStore();
  const d = s.decks.find((x) => x.id === id);
  if (d) d.folderId = folderId;
  saveStore(s);
}

export function deleteDeck(id: string) {
  const s = loadStore();
  s.decks = s.decks.filter((d) => d.id !== id);
  s.cards = s.cards.filter((c) => c.deckId !== id);
  saveStore(s);
}

export function addCards(deckId: string, cards: Omit<Card, "id" | "deckId" | "createdAt" | "srs">[]) {
  const s = loadStore();
  const created: Card[] = cards.map((c) => ({
    ...c,
    id: uid(),
    deckId,
    createdAt: Date.now(),
    srs: newSRS(),
  }));
  s.cards.push(...created);
  saveStore(s);
  return created;
}

export function updateCard(id: string, patch: Partial<Card>) {
  const s = loadStore();
  const i = s.cards.findIndex((c) => c.id === id);
  if (i >= 0) s.cards[i] = { ...s.cards[i], ...patch };
  saveStore(s);
}

export function deleteCard(id: string) {
  const s = loadStore();
  s.cards = s.cards.filter((c) => c.id !== id);
  saveStore(s);
}
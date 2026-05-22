export type CardSide = {
  question: string;
  answer: string;
  memoryAid: string;
};

export type SRSState = {
  box: 1 | 2 | 3 | 4 | 5; // Leitner box (1 = hardest, 5 = mastered)
  due: number; // epoch ms
  lastReviewed?: number;
  reviews: number;
};

export type Quiz = {
  question: string;
  choices: string[];
  correctIndex: number;
};

export type Card = CardSide & {
  id: string;
  deckId: string;
  createdAt: number;
  srs: SRSState;
  quiz?: Quiz;
};

export type Deck = {
  id: string;
  name: string;
  folderId: string | null;
  description?: string;
  createdAt: number;
};

export type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
};

export type Store = {
  folders: Folder[];
  decks: Deck[];
  cards: Card[];
};
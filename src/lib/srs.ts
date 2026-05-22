import type { SRSState } from "./types";

const DAY = 24 * 60 * 60 * 1000;
// Leitner intervals per box (1..5)
const INTERVALS = [0, 1, 3, 7, 16, 35];

export type Rating = "hard" | "good" | "easy";

export function applyRating(srs: SRSState, rating: Rating): SRSState {
  let box = srs.box;
  if (rating === "hard") box = 1;
  else if (rating === "good") box = Math.min(5, box + 1) as SRSState["box"];
  else box = Math.min(5, box + 2) as SRSState["box"];
  const interval = INTERVALS[box] ?? 1;
  return {
    box,
    due: Date.now() + interval * DAY,
    lastReviewed: Date.now(),
    reviews: srs.reviews + 1,
  };
}

export function isDue(srs: SRSState, now = Date.now()) {
  return srs.due <= now;
}
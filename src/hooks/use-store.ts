import { useSyncExternalStore } from "react";
import { loadStore, subscribe } from "@/lib/storage";
import type { Store } from "@/lib/types";

const emptyServer: Store = { folders: [], decks: [], cards: [] };

export function useStore(): Store {
  return useSyncExternalStore(
    (cb) => subscribe(cb),
    () => loadStore(),
    () => emptyServer,
  );
}
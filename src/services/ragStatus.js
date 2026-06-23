import { useSyncExternalStore } from 'react';

const baseUrl = import.meta.env.VITE_EVIDENCE_API_URL;

let offline = !baseUrl;
const listeners = new Set();

function setOffline(value) {
  if (offline === value) return;
  offline = value;
  listeners.forEach((listener) => listener());
}

/** Call when a RAG_app fetch succeeds. */
export function reportRagSuccess() {
  setOffline(false);
}

/** Call when a RAG_app fetch fails or is unconfigured, before falling back to static content. */
export function reportRagFailure() {
  setOffline(true);
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return offline;
}

/** True whenever the most recent RAG_app call failed (or it's unconfigured) and static fallback content is in use. */
export function useRagOffline() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

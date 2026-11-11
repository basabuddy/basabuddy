import {useSyncExternalStore} from 'react';
import {stopPlayback} from './playback';
const key = 'basabuddy:muted';
let muted = false;
try { muted = localStorage.getItem(key) === 'true'; } catch { /* Works without storage. */ }
const listeners = new Set<() => void>();
export const isMuted = () => muted;
export function setMuted(value: boolean) {
  muted = value;
  if (muted) stopPlayback();
  try { localStorage.setItem(key, String(value)); } catch { /* Session preference remains usable. */ }
  listeners.forEach(listener => listener());
}
export function useMuted() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, isMuted);
}

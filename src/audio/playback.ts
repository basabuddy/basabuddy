import manifest from './manifest.json';
import type { Language } from '../domain/model';

const clips: Record<Language, Record<string, string>> = manifest;
// Only same-origin bundled files are allowed; never upload text to a TTS URL.
export const isLocalClip = (path: string) => /^\/audio\/[a-zA-Z0-9_-]+\.(mp3|wav|ogg|m4a)$/.test(path);
export const bundledClip = (text: string, language: Language) => {
  const source = clips[language]?.[text];
  return source && isLocalClip(source) ? source : undefined;
};

// Some browsers expose synthesis before their voice provider is ready.
// A broken speech provider must never prevent a bundled recording from playing.
export function readVoices(synth: SpeechSynthesis | undefined): SpeechSynthesisVoice[] {
  try { return synth?.getVoices() ?? []; } catch { return []; }
}

export function findVoice(voices: SpeechSynthesisVoice[], language: Language) {
  const matches = voices.filter(voice => {
    if (voice.localService !== true) return false;
    const locale = voice.lang.toLowerCase().replaceAll('_', '-');
    return language === 'fil' ? /^(fil|tl)(-|$)/.test(locale) : /^en(-|$)/.test(locale);
  });
  return matches.find(voice => voice.lang.toLowerCase().replaceAll('_', '-') === (language === 'fil' ? 'fil-ph' : 'en-us'))
    ?? matches.find(voice => voice.default)
    ?? matches[0];
}

// One playback owner: unmounting an unrelated Listen button must not cancel audio.
let activeStop: (() => void) | undefined;
export function claimPlayback(stop: () => void) {
  activeStop?.();
  activeStop = stop;
  return () => {
    if (activeStop === stop) activeStop = undefined;
  };
}

export function stopPlayback() {
  const stop = activeStop;
  activeStop = undefined;
  stop?.();
}

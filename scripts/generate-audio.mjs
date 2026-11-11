// Export only fixed, authored lesson text. Never export learner data or recordings.
import { writeFile } from 'node:fs/promises';
import { lessonBank, dictionary } from '../src/content/lessons.ts';
const texts = {
  fil: new Set(['mansanas', 'Ang pusa ay maliit.', 'pusa', 'aso', 'ibon', 'ba ta', 'Si Ana ay may pusa. Mabait ang pusa ni Ana. Masaya silang maglaro.']),
  en: new Set(['apple', 'The cat is little.', 'cat', 'dog', 'bird', 'c a t', 'Ana has a cat. Her cat is kind. They are happy when they play together.']),
};
for (const lang of ['fil', 'en']) {
  for (const lesson of lessonBank[lang]) {
    texts[lang].add(lesson.model);
    if (lesson.passage) texts[lang].add(lesson.passage);
    for (const item of lesson.questions) {
      texts[lang].add(item.answer);
      if (item.audio) texts[lang].add(item.audio);
    }
  }
  for (const entry of dictionary) texts[lang].add(entry[lang === 'fil' ? 1 : 2]);
}
await writeFile('scripts/audio-texts.json', JSON.stringify(Object.fromEntries(Object.entries(texts).map(([k,v])=>[k,[...v]])), null, 2)+'\n');
console.log('Exported fixed narration texts.');

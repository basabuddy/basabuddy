import type {DictionaryEntry} from './content';
export type PracticeMode='picture'|'listen'|'fil-en'|'en-fil'|'spelling'|'flashcards';
export const practiceModes:{id:PracticeMode;label:string}[]=[{id:'flashcards',label:'Flashcards'},{id:'picture',label:'Picture Matching'},{id:'listen',label:'Listen and Choose'},{id:'fil-en',label:'Filipino to English'},{id:'en-fil',label:'English to Filipino'},{id:'spelling',label:'Spelling Practice'}];
export function answerFor(entry:DictionaryEntry,mode:PracticeMode,language:'fil'|'en'){
 return mode==='fil-en'?entry.english:mode==='en-fil'?entry.filipino:language==='fil'?entry.filipino:entry.english;
}
export function optionsFor(entries:DictionaryEntry[],entry:DictionaryEntry){
 const others=entries.filter(e=>e.id!==entry.id).slice(0,3);
 others.splice(Number(entry.id.slice(1))%(others.length+1),0,entry);return others;
}
export function correctPractice(actual:string,expected:string){return actual.trim().normalize('NFC').toLocaleLowerCase()===expected.trim().normalize('NFC').toLocaleLowerCase();}
export function partialWord(word:string){return [...word].map((letter,i)=>/[a-z]/i.test(letter)&&i%2===1?'_':letter).join('');}

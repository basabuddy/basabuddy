import {describe,it,expect} from 'vitest';
import {dictionaryEntries,matchesSearch} from './content';
import {emptyDictionary,recordAnswer,updateDictionary,validDictionaryProgress} from './progress';
import {answerFor,correctPractice,optionsFor,partialWord} from './practice';
import {emptyStore} from '../data/repository';

describe('complete bilingual dictionary',()=>{
 it('contains exactly the requested 25 animals, 25 foods and 40 things',()=>{
  expect(dictionaryEntries).toHaveLength(90);expect(new Set(dictionaryEntries.map(e=>e.id)).size).toBe(90);expect(new Set(dictionaryEntries.map(e=>e.image)).size).toBe(90);
  for(const [category,count,prefix] of [['animals',25,'A'],['food',25,'F'],['things',40,'T']] as const){const entries=dictionaryEntries.filter(e=>e.category===category);expect(entries).toHaveLength(count);expect(entries.map(e=>e.id)).toEqual(Array.from({length:count},(_,i)=>`${prefix}${String(i+1).padStart(2,'0')}`));}
  expect(dictionaryEntries.every(e=>e.filipinoSentence&&e.englishSentence&&e.filipino&&e.english&&e.image.endsWith('.webp'))).toBe(true);
 });
 it('searches both languages, case and appropriate spelling aliases',()=>{const butterfly=dictionaryEntries.find(e=>e.id==='A13')!;expect(matchesSearch(butterfly,'PARU-PARO')).toBe(true);expect(matchesSearch(butterfly,'butterfly')).toBe(true);expect(matchesSearch(butterfly,'dog')).toBe(false);expect(matchesSearch(dictionaryEntries.find(e=>e.id==='F10')!,'piña')).toBe(true);expect(matchesSearch(dictionaryEntries.find(e=>e.id==='A07')!,'water buffalo')).toBe(true);});
 it('has valid translation answers and choices; spelling preserves punctuation and spaces',()=>{for(const entry of dictionaryEntries){expect(optionsFor(dictionaryEntries,entry)).toContain(entry);expect(new Set(optionsFor(dictionaryEntries,entry).map(e=>e.id)).size).toBe(4);expect(answerFor(entry,'fil-en','fil')).toBe(entry.english);expect(answerFor(entry,'en-fil','en')).toBe(entry.filipino);}expect(correctPractice(' aso ','Aso')).toBe(true);expect(correctPractice('cat','dog')).toBe(false);expect(partialWord('Cooked Rice')).toContain(' ');expect(partialWord('aso')).toBe('a_o');});
 it('adds vocabulary history without changing lessons or other learners',()=>{const d=emptyStore();d.profiles=[{id:'a',name:'Ana',grade:'1'},{id:'b',name:'Ben',grade:'2'}];const changed=updateDictionary(d,'a',p=>recordAnswer({...p,favorites:['A01']},'A01',true));expect(changed.progress).toBe(d.progress);expect(changed.profiles).toBe(d.profiles);expect(changed.dictionaryProgress?.a.practice.A01.correct).toBe(1);expect(changed.dictionaryProgress?.b).toBeUndefined();expect(validDictionaryProgress(changed.dictionaryProgress)).toBe(true);expect(updateDictionary(d,'missing',p=>p)).toBe(d);});
 it('counts actual incorrect/correct attempts and rejects malformed persisted vocabulary data',()=>{let p=recordAnswer(emptyDictionary(),'A01',false);p=recordAnswer(p,'A01',true);expect(p.practice.A01.correct).toBe(1);expect(p.practice.A01.incorrect).toBe(1);expect(validDictionaryProgress(undefined)).toBe(true);expect(validDictionaryProgress({a:{...p,favorites:['invalid']}})).toBe(false);expect(validDictionaryProgress({a:{...p,favorites:['A01','A01']}})).toBe(false);});
});

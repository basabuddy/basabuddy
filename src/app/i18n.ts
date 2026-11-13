import {useApp} from './context';
import filipino from './locales/fil.json';
import type {Language} from '../domain/model';

const english:Record<string,string>={
 'Tayo nang magbasa!':'Let’s read together!',
 'Aling salita ang tama?':'Which word is correct?',
 'Buuin ang salita:':'Build the word:',
 'Ang husay mo!':'Great work!',
 'Ang husay mo! 🌟':'Great work! 🌟',
 'Maglaro at matuto! Three Filipino word adventures, at your own pace.':'Play and learn! Three Filipino word adventures, at your own pace.',
 'Tama! Great work. Say the word aloud!':'Correct! Great work. Say the word aloud!',
 'Tama! Great work!':'Correct! Great work!',
 'Piliin ang mga letra sa tamang ayos. Tap letters in order to build the Filipino word. Use Undo or Reset to try again.':'Tap letters in order to build the Filipino word. Use Undo or Reset to try again.',
 'Pagsamahin ang mga pantig. Tap the syllables in order to make the word. Say each part, then read the whole word.':'Tap the syllables in order to make the word. Say each part, then read the whole word.',
 'Tingnan ang larawan. Piliin ang tamang salita. Look at the picture and choose its Filipino name.':'Look at the picture and choose its Filipino name.',
};

/** Translate interface labels only; learner names and learning vocabulary stay intact. */
export function translate(language:Language,text:string,values:readonly unknown[]=[]):string{
 const key=text.trim();
 const dictionary:Record<string,string>=language==='fil'?filipino:english;
 const translated=dictionary[key]??key;
 const output=text.slice(0,text.length-text.trimStart().length)+translated+text.slice(text.trimEnd().length);
 return output.replace(/\{(\d+)\}/g,(placeholder,index)=>Number(index)<values.length?String(values[Number(index)]??''):placeholder);
}
export function useTranslation(){
 const app=useApp();
 const language=app?.data.language??'en';
 return (text:string|undefined,values:readonly unknown[]=[])=>translate(language,text??'',values);
}

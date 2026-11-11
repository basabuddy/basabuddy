import type {Store} from '../domain/model';
import {dictionaryEntries} from './content';
export interface WordPractice {correct:number;incorrect:number;lastPracticed:string}
export interface DictionaryQuiz {id:string;mode:string;correct:number;total:number;completedAt:string}
export interface DictionaryProgress {favorites:string[];viewed:Record<string,string>;practice:Record<string,WordPractice>;quizzes:DictionaryQuiz[];reviewSet:string[]}
export const emptyDictionary=():DictionaryProgress=>({favorites:[],viewed:{},practice:{},quizzes:[],reviewSet:[]});
export const dictionaryFor=(store:Store,studentId:string)=>store.dictionaryProgress?.[studentId]??emptyDictionary();
export function updateDictionary(store:Store,studentId:string,change:(p:DictionaryProgress)=>DictionaryProgress):Store {
 if(!store.profiles.some(p=>p.id===studentId))return store;
 return {...store,dictionaryProgress:{...store.dictionaryProgress,[studentId]:change(dictionaryFor(store,studentId))}};
}
const ids=new Set(dictionaryEntries.map(e=>e.id));
const object=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const date=(v:any)=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const count=(v:any)=>Number.isInteger(v)&&v>=0;
export function validDictionaryProgress(value:unknown):boolean {
 if(value===undefined)return true;
 if(!object(value))return false;
 return Object.values(value).every(p=>object(p)&&['favorites','reviewSet'].every(key=>Array.isArray(p[key])&&p[key].every((id:unknown)=>typeof id==='string'&&ids.has(id))&&new Set(p[key]).size===p[key].length)&&object(p.viewed)&&Object.entries(p.viewed).every(([id,time])=>ids.has(id)&&date(time))&&object(p.practice)&&Object.entries(p.practice).every(([id,r])=>ids.has(id)&&object(r)&&count(r.correct)&&count(r.incorrect)&&date(r.lastPracticed))&&Array.isArray(p.quizzes)&&p.quizzes.every((q:any)=>object(q)&&typeof q.id==='string'&&typeof q.mode==='string'&&count(q.correct)&&count(q.total)&&q.correct<=q.total&&date(q.completedAt)));
}
export function recordAnswer(p:DictionaryProgress,id:string,correct:boolean):DictionaryProgress {
 if(!ids.has(id))return p;
 const previous=p.practice[id]??{correct:0,incorrect:0,lastPracticed:''};
 return {...p,practice:{...p.practice,[id]:{correct:previous.correct+Number(correct),incorrect:previous.incorrect+Number(!correct),lastPracticed:new Date().toISOString()}}};
}

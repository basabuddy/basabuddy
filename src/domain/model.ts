import type {DictionaryProgress} from '../dictionary/progress';
import type {GameSession,GameEvent,GameAward} from '../games/model';
export type Language = 'fil' | 'en';
export type Kind = 'choice' | 'build';
export interface Item {id:string; prompt:string; choices:string[]; answer:string; hint:string; kind:Kind; audio?:string; image?:string; passage?:string; contentStatus:'draft'}
export interface Lesson {id:string; title:string; objective:string; type:string; model:string; image:string; passage?:string; questions:Item[]}
export interface Attempt {step:number; answers:(string|null)[]; selected:string[]; checked:boolean; finished:boolean; updatedAt:string}
export interface Progress {best:number; completed:boolean; attempt:Attempt; attempts:number; updatedAt:string}
export interface Profile {id:string; name:string; grade:string}
export interface Assignment {id:string; studentId:string; language:Language; levelId:string; createdAt:string}
export interface Store {version:1; profiles:Profile[]; activeId:string; language:Language; progress:Record<string,Progress>; assignments:Assignment[]; quests:Record<string,string[]>; teacherPinHash?:string; gameSessions?:Record<string,GameSession>; gameHistory?:GameEvent[]; gameAwards?:Record<string,GameAward>; dictionaryProgress?:Record<string,DictionaryProgress>}
export const progressKey=(student:string,language:Language,level:string)=>`${student}:${language}:${level}`;
export const freshAttempt=():Attempt=>({step:0,answers:Array(5).fill(null),selected:[],checked:false,finished:false,updatedAt:new Date().toISOString()});
export const gradeAnswer=(item:Item,answer:string)=>item.answer.normalize('NFC').trim()===answer.normalize('NFC').trim();
export function completeAssessment(previous:Progress|undefined,attempt:Attempt,items:Item[]):Progress {
 if(items.length!==5||attempt.answers.length!==5||attempt.answers.some(a=>typeof a!=='string'))throw new Error('Complete all five questions first.');
 const score=items.reduce((n,item,i)=>n+Number(gradeAnswer(item,attempt.answers[i]!)),0);
 return {best:Math.max(previous?.best??0,score),completed:!!previous?.completed||score>=4,attempt:{...attempt,finished:true},attempts:(previous?.attempts??0)+1,updatedAt:new Date().toISOString()};
}
export function canUnlockLevel(store:Store,language:Language,order:number){return order===1||!!store.progress[progressKey(store.activeId,language,`L${String(order-1).padStart(2,'0')}`)]?.completed;}

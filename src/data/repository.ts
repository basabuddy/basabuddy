import type {Store} from '../domain/model';
import {validGameData} from '../games/validation';
import {validDictionaryProgress} from '../dictionary/progress';
export const STORAGE_KEY='basabuddy:v1';
export const accountStorageKey=(accountId?:string)=>accountId?`${STORAGE_KEY}:account:${accountId}`:STORAGE_KEY;
export const emptyStore=():Store=>({version:1,profiles:[],activeId:'',language:'fil',progress:{},assignments:[],quests:{},gameSessions:{},gameHistory:[],gameAwards:{}});
export interface ProgressRepository {load():Store;save(data:Store):void;clear():void}
// Device-local persistence; no remote data connections.
export class LocalRepository implements ProgressRepository {
 constructor(private readonly storageKey=STORAGE_KEY){}
 load():Store {const raw=localStorage.getItem(this.storageKey);if(!raw)return emptyStore();const d=JSON.parse(raw);if(!validGameData(d)||!validDictionaryProgress(d.dictionaryProgress)||d.version!==1||!Array.isArray(d.profiles)||!d.progress||!Array.isArray(d.assignments)||!d.quests||!['fil','en'].includes(d.language)||d.profiles.some((p:any)=>typeof p.id!=='string'||typeof p.name!=='string')||Object.values(d.progress).some((p:any)=>!p.attempt||!Array.isArray(p.attempt.answers)||p.attempt.answers.length!==5||typeof p.best!=='number'))throw new Error('Saved data could not be read. Your original data has not been overwritten.');const {pinHash,...retained}=d;return {...retained,...(d.teacherPinHash||pinHash?{teacherPinHash:d.teacherPinHash??pinHash}:{}),gameSessions:d.gameSessions??{},gameHistory:d.gameHistory??[],gameAwards:d.gameAwards??{}};}
 save(data:Store){localStorage.setItem(this.storageKey,JSON.stringify(data));}
 clear(){localStorage.removeItem(this.storageKey);}
}

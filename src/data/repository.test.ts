import {it,expect} from 'vitest';
import {LocalRepository,emptyStore} from './repository';
import {freshAttempt} from '../domain/model';

it('migrates the existing local PIN to the teacher gate without changing any learner data or settings',()=>{
 const legacy={...emptyStore(),profiles:[{id:'reader',name:'Ana',grade:'2'}],activeId:'reader',pinHash:'existing-digest',progress:{'reader:fil:L01':{best:5,completed:true,attempt:freshAttempt(),attempts:1,updatedAt:'2026-11-10T00:00:00Z'}},assignments:[{id:'assignment',studentId:'reader',language:'fil' as const,levelId:'L02',createdAt:'2026-11-10T00:00:00Z'}],quests:{'reader:fil:2026-11-10':['word']}};
 const items=new Map([['basabuddy:v1',JSON.stringify(legacy)],['basabuddy:muted','true']]);
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>items.get(key)??null,setItem:(key:string,v:string)=>items.set(key,v),removeItem:(key:string)=>items.delete(key)}});
 const repo=new LocalRepository();const migrated=repo.load();
 expect(migrated.teacherPinHash).toBe('existing-digest');expect(migrated).not.toHaveProperty('pinHash');
 expect(migrated.progress).toEqual(legacy.progress);expect(migrated.assignments).toEqual(legacy.assignments);expect(migrated.quests).toEqual(legacy.quests);expect(migrated.profiles).toEqual(legacy.profiles);
 repo.save(migrated);expect(repo.load()).toEqual(migrated);expect(items.get('basabuddy:muted')).toBe('true');expect(JSON.parse(items.get('basabuddy:v1')!)).not.toHaveProperty('pinHash');
});

import type {Store} from '../domain/model';

export type GameId = 'word-builder' | 'syllable-puzzle' | 'picture-match';
export type Difficulty = 'beginner' | 'growing' | 'challenge';
export interface Vocabulary {word:string; syllables:string[]; art:string; meaning:string}
export interface GameDefinition {id:GameId; title:string; icon:string; description:string; instructions:string}
export const games:GameDefinition[] = [
 {id:'word-builder',title:'Word Builder',icon:'🔤',description:'Little letters, wonderful words.',instructions:'Piliin ang mga letra sa tamang ayos. Tap letters in order to build the Filipino word. Use Undo or Reset to try again.'},
 {id:'syllable-puzzle',title:'Syllable Puzzle',icon:'🧩',description:'Put the sounds together.',instructions:'Pagsamahin ang mga pantig. Tap the syllables in order to make the word. Say each part, then read the whole word.'},
 {id:'picture-match',title:'Picture & Word Match',icon:'🎨',description:'A picture is worth a new word.',instructions:'Tingnan ang larawan. Piliin ang tamang salita. Look at the picture and choose its Filipino name.'},
];
export const difficulties:{id:Difficulty;label:string}[]=[{id:'beginner',label:'Beginner'},{id:'growing',label:'Growing'},{id:'challenge',label:'Challenge'}];
export const vocabulary:Vocabulary[] = [
 {word:'pusa',syllables:['pu','sa'],art:'cat',meaning:'cat'},
 {word:'aso',syllables:['a','so'],art:'dog',meaning:'dog'},
 {word:'ibon',syllables:['i','bon'],art:'bird',meaning:'bird'},
 {word:'pagong',syllables:['pa','gong'],art:'turtle',meaning:'turtle'},
 {word:'kuneho',syllables:['ku','ne','ho'],art:'rabbit',meaning:'rabbit'},
 {word:'mansanas',syllables:['man','sa','nas'],art:'apple',meaning:'apple'},
];
export function roundsFor(game:GameId,level:Difficulty):Vocabulary[] {
 const ids=level==='beginner'?[0,1,2]:level==='growing'?[3,0,4]:[5,4,3];
 // Matching grows from two choices to four and includes the entire picture vocabulary.
 return ids.map(i=>vocabulary[i]);
}
export function tilesFor(game:GameId,item:Vocabulary):string[] {
 const parts=game==='word-builder'?[...item.word]:game==='syllable-puzzle'?item.syllables:[];
 return [...parts].reverse();
}
export function choicesFor(item:Vocabulary,level:Difficulty):string[] {
 const count=level==='beginner'?2:level==='growing'?3:4;
 const alternatives=vocabulary.filter(v=>v.word!==item.word).slice(0,count-1).map(v=>v.word);
 const at=item.word.length%count;alternatives.splice(at,0,item.word);return alternatives;
}
export interface GameSession {id:string;game:GameId;difficulty:Difficulty;round:number;selected:number[];choice:string;checked:boolean;mistakes:number;roundMistakes:number;firstTry:number;startedAt:string;finished:boolean}
export interface GameEvent {id:string;sessionId:string;childId:string;language:'fil';game:GameId;difficulty:Difficulty;contentVersion:1;skill:'spelling'|'syllables'|'vocabulary';firstTry:number;total:3;mistakes:number;completedAt:string}
export interface GameAward {childId:string;game:GameId;difficulty:Difficulty;stars:3;earnedAt:string}
export const gameKey=(child:string,game:GameId,level:Difficulty)=>`${child}:fil:${game}:${level}`;
export const newSession=(game:GameId,difficulty:Difficulty):GameSession=>({id:crypto.randomUUID(),game,difficulty,round:0,selected:[],choice:'',checked:false,mistakes:0,roundMistakes:0,firstTry:0,startedAt:new Date().toISOString(),finished:false});
export function correctAnswer(game:GameId,item:Vocabulary,selected:number[],choice:string):boolean {
 if(game==='picture-match')return choice===item.word;
 const tiles=tilesFor(game,item);
 return selected.length===tiles.length&&new Set(selected).size===selected.length&&selected.every(i=>Number.isInteger(i)&&i>=0&&i<tiles.length)&&selected.map(i=>tiles[i]).join('')===item.word;
}
export function checkSession(session:GameSession):GameSession {
 if(session.finished||session.checked)return session;
 const item=roundsFor(session.game,session.difficulty)[session.round];
 if(!item)return session;
 const ok=correctAnswer(session.game,item,session.selected,session.choice);
 return {...session,checked:ok,mistakes:session.mistakes+Number(!ok),roundMistakes:session.roundMistakes+Number(!ok),firstTry:session.firstTry+Number(ok&&session.roundMistakes===0)};
}
// Completion, history and one-time awards are one repository write. Replay never farms stars.
export function finishGame(store:Store,session:GameSession,childId:string):Store {
 if(!store.profiles.some(p=>p.id===childId)||session.finished||!session.checked||session.round!==2)return store;
 const key=gameKey(childId,session.game,session.difficulty);
 if((store.gameHistory??[]).some(e=>e.sessionId===session.id))return store;
 const completedAt=new Date().toISOString();
 const event:GameEvent={id:session.id,sessionId:session.id,childId,language:'fil',game:session.game,difficulty:session.difficulty,contentVersion:1,skill:session.game==='word-builder'?'spelling':session.game==='syllable-puzzle'?'syllables':'vocabulary',firstTry:session.firstTry,total:3,mistakes:session.mistakes,completedAt};
 return {...store,gameSessions:{...store.gameSessions,[key]:{...session,finished:true}},gameHistory:[...(store.gameHistory??[]),event],gameAwards:store.gameAwards?.[key]?store.gameAwards:{...store.gameAwards,[key]:{childId,game:session.game,difficulty:session.difficulty,stars:3,earnedAt:completedAt}}};
}
export function learnerGameSummary(store:Store,childId:string){
 const awards=Object.values(store.gameAwards??{}).filter(a=>a.childId===childId);
 return {awards,stars:awards.reduce((n,a)=>n+a.stars,0),sessions:(store.gameHistory??[]).filter(e=>e.childId===childId)};
}

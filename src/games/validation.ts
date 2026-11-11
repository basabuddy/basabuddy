import {difficulties,games,roundsFor,tilesFor,correctAnswer,gameKey} from './model';
const record=(v:any)=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const number=(v:any)=>Number.isInteger(v)&&v>=0;
const date=(v:any)=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const identity=(v:any)=>record(v)&&games.some(g=>g.id===v.game)&&difficulties.some(d=>d.id===v.difficulty);
// Additive version-1 migration: old records remain valid; malformed new records are never overwritten.
export function validGameData(data:any):boolean {
 if(!record(data))return false;
 if(data.gameSessions!==undefined&&(!record(data.gameSessions)||!Object.entries(data.gameSessions).every(([key,s]:[string,any])=>{
  if(!identity(s)||typeof s.id!=='string'||!date(s.startedAt)||!number(s.round)||s.round>2||!Array.isArray(s.selected)||typeof s.choice!=='string'||typeof s.checked!=='boolean'||typeof s.finished!=='boolean'||!number(s.mistakes)||!number(s.roundMistakes)||!number(s.firstTry)||s.firstTry>3)return false;
  const item=roundsFor(s.game,s.difficulty)[s.round],tiles=tilesFor(s.game,item);
  return key.endsWith(`:fil:${s.game}:${s.difficulty}`)&&s.selected.every((i:any)=>number(i)&&i<tiles.length)&&new Set(s.selected).size===s.selected.length&&(!s.checked||correctAnswer(s.game,item,s.selected,s.choice))&&(!s.finished||(s.round===2&&s.checked));
 })))return false;
 if(data.gameHistory!==undefined&&(!Array.isArray(data.gameHistory)||!data.gameHistory.every((e:any)=>identity(e)&&typeof e.id==='string'&&typeof e.sessionId==='string'&&typeof e.childId==='string'&&e.language==='fil'&&e.contentVersion===1&&e.total===3&&number(e.firstTry)&&e.firstTry<=3&&number(e.mistakes)&&date(e.completedAt))))return false;
 if(data.gameAwards!==undefined&&(!record(data.gameAwards)||!Object.entries(data.gameAwards).every(([key,a]:[string,any])=>identity(a)&&typeof a.childId==='string'&&key===gameKey(a.childId,a.game,a.difficulty)&&a.stars===3&&date(a.earnedAt))))return false;
 return true;
}

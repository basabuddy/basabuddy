import {it,expect,vi} from 'vitest';
import {claimPlayback,findVoice} from './playback';
const voice=(lang:string)=>({lang,default:false,localService:true} as SpeechSynthesisVoice);
it('matches Tagalog aliases and locale separators without mixing languages',()=>{
 expect(findVoice([voice('en-US')],'fil')).toBeUndefined();
 expect(findVoice([voice('tl_PH')],'fil')?.lang).toBe('tl_PH');
 expect(findVoice([voice('en-GB'),voice('en_US')],'en')?.lang).toBe('en_US');
});
it('stops the prior owner and ignores stale owner cleanup',()=>{
 const first=vi.fn(),second=vi.fn(),third=vi.fn();const releaseFirst=claimPlayback(first);const releaseSecond=claimPlayback(second);
 expect(first).toHaveBeenCalledOnce();releaseFirst();const releaseThird=claimPlayback(third);expect(second).toHaveBeenCalledOnce();releaseSecond();releaseThird();
});

it('never selects network-backed voices even when they match Filipino',()=>{
 expect(findVoice([{...voice('fil-PH'),localService:false},voice('en-US')],'fil')).toBeUndefined();
 expect(findVoice([{...voice('en-US'),localService:false}],'en')).toBeUndefined();
});

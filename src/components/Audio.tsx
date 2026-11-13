import {useTranslation} from '../app/i18n';
import {useEffect,useRef,useState} from 'react';
import {Volume2,VolumeX,Mic,Square} from 'lucide-react';
import {Art} from './UI';
import {useApp} from '../app/context';
import {bundledClip,claimPlayback,findVoice,readVoices,stopPlayback} from '../audio/playback';
import {isMuted,setMuted,useMuted} from '../audio/preferences';
import type {Language} from '../domain/model';
export function AudioButton({text,lang,slow=false}:{text:string;lang:Language;slow?:boolean}) {const t=useTranslation();
 const muted = useMuted();
 const [state,setState] = useState('');
 const [playing,setPlaying] = useState(false);
 const stopRef = useRef<(() => void) | undefined>(undefined);
 const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
 const waitingForVoices = useRef(false);
 const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
 const f = useApp().data.language === 'fil';

 useEffect(() => {
   const synth = window.speechSynthesis;
   if (!synth) return;
   const refresh = () => {
     voicesRef.current = readVoices(synth);
     if (waitingForVoices.current && findVoice(voicesRef.current, lang)) {
       waitingForVoices.current = false;
       // Keep the next speak() call inside a user gesture on mobile browsers.
       setState(lang === 'fil' ? 'Handa na ang boses. Pindutin ang Pakinggan.' : 'Voice ready. Tap Listen again.');
     }
   };
   refresh();
   synth.addEventListener('voiceschanged', refresh);
   // A few browsers populate the list without firing voiceschanged.
   // Discover it without automatically speaking outside a user gesture.
   const poll = window.setInterval(refresh, 500);
   const deadline = window.setTimeout(() => window.clearInterval(poll), 10000);
   return () => {
     synth.removeEventListener('voiceschanged', refresh);
     window.clearInterval(poll);
     window.clearTimeout(deadline);
   };
 }, [lang]);
 useEffect(() => {
   waitingForVoices.current = false;
   setState('');
   return () => stopRef.current?.();
 }, [text,lang,slow]);

 function play() {
   if (isMuted()) { setState(f ? 'I-on muna ang tunog.' : 'Unmute to listen.'); return; }
   if (playing) { stopRef.current?.(); return; }
   stopPlayback();
   const synth = window.speechSynthesis;
   const source = bundledClip(text, lang);
   const voice = source ? undefined : findVoice(readVoices(synth), lang);
   if (!source && !voice) {
     waitingForVoices.current = true;
     setState(f
       ? 'Walang naka-bundle na recording para dito at walang lokal na boses na Filipino/Tagalog. Kailangan ng Filipino recording o naka-install na offline Filipino/Tagalog voice. Hindi gagamit ng English o online voice.'
       : 'The English voice is not ready. No bundled recording or local English voice is available. Install an offline English voice and tap Listen again. Online voices are not used.');
     return;
   }
   waitingForVoices.current = false;
   let audio: HTMLAudioElement | undefined;
   let utterance: SpeechSynthesisUtterance | undefined;
   let stopped = false;
   let watchdog: ReturnType<typeof setTimeout> | undefined;
   let release = () => {};
   const stop = () => {
     if (stopped) return;
     stopped = true;
     clearTimeout(watchdog);
     if (audio) { audio.onplaying = null; audio.onended = null; audio.onerror = null; audio.pause(); audio.removeAttribute('src'); audio.load(); }
     if (utterance) { utterance.onstart = null; utterance.onend = null; utterance.onerror = null; synth?.cancel(); }
     utteranceRef.current = null;
     release();
     setPlaying(false);
     setState('');
   };
   release = claimPlayback(stop);
   stopRef.current = stop;
   setPlaying(true);
   setState(f ? 'Inihahanda ang audio…' : 'Loading audio…');
   const fail = (reason?: string) => {
     if (stopped) return;
     stop();
     if (source) console.warn('Bundled audio failed', {source,reason});
     setState(reason === 'NotAllowedError' || reason === 'not-allowed'
       ? (f ? 'Hinarang ng browser ang audio. Payagan ang tunog para sa site, pagkatapos ay pindutin muli ang Pakinggan.' : 'Audio could not play: the browser blocked sound. Allow sound for this site, then tap Listen again.')
       : source
         ? (f ? 'Hindi mabuksan ang recording. Maaaring nawawala, hindi suportado, o hindi pa naka-save offline. Kumonekta at subukan muli.' : 'Audio could not play. The recording may be missing, unsupported, or not yet saved offline. Connect and retry.')
         : (f ? 'Hindi tumugtog ang lokal na boses. Suriin ang naka-install na Filipino/Tagalog voice at volume, pagkatapos ay subukan muli.' : 'Audio could not play. Check your installed English voice and volume, then tap Listen to retry.'));
   };
   const started = () => {
     if (stopped) return;
     clearTimeout(watchdog);
     watchdog = setTimeout(() => fail(), 120000);
     setState(f ? 'Tumutugtog…' : 'Playing…');
   };
   function playClip() {
     if (stopped || !source) { fail(); return; }
     if (utterance) {
       utterance.onerror = null; utterance.onend = null; utterance.onstart = null;
       synth?.cancel(); utterance = undefined; utteranceRef.current = null;
     }
     audio = new Audio(source);
     audio.volume = 0.65;
     audio.playbackRate = slow ? 0.75 : 1;
     audio.preservesPitch = true;
     audio.onplaying = started;
     audio.onended = stop;
     audio.onerror = () => fail();
     watchdog = setTimeout(() => fail(), 10000);
     audio.play().catch(error => fail(error?.name));
   }
   // Bundled language-specific clips also work when browser speech is absent.
   try {
     if (source) { playClip(); return; }
     utterance = new SpeechSynthesisUtterance(text);
     utteranceRef.current = utterance;
     utterance.voice = voice!;
     utterance.lang = voice!.lang.replaceAll('_', '-');
     utterance.rate = slow ? 0.65 : 0.85;
     utterance.volume = 0.65;
     utterance.onstart = started;
     utterance.onend = stop;
     utterance.onerror = event => fail(event.error);
     watchdog = setTimeout(() => fail(), 6000);
     synth.cancel();
     synth.resume();
     synth.speak(utterance);
   } catch { fail(); }
 }
 return <div className="audio-wrap"><button type="button" className="soft audio" aria-pressed={playing} aria-disabled={muted} onClick={play}>
   {playing ? <Square size={22}/> : <Volume2 size={22}/>}
   {playing ? (f ? t("Ihinto") : t("Stop")) : slow ? (f ? t("Dahan-dahan") : t("Slow")) : (f ? t("Pakinggan") : t("Listen"))}
 </button>{state && <small role="status">{t(state)}</small>}</div>;
}
export function AudioControls({text,lang}:{text:string;lang:Language}) {
 return <div className="row audio-controls"><AudioButton text={text} lang={lang}/><AudioButton text={text} lang={lang} slow/></div>;
}
export function Recorder({lang}:{lang:Language}){const t=useTranslation();
 const muted = useMuted();
 const replay = useRef<HTMLAudioElement|null>(null);
 const replayRelease = useRef<(() => void)|undefined>(undefined);
 const release = useRef<(() => void)|undefined>(undefined);
 useEffect(() => () => { replay.current?.pause(); replayRelease.current?.(); release.current?.(); }, []);
 const [pending,setPending]=useState(false);const [status,setStatus]=useState('');const [recording,setRecording]=useState(false);const [url,setUrl]=useState('');const recorder=useRef<MediaRecorder|null>(null);const stream=useRef<MediaStream|null>(null);const live=useRef(true);const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);const urlRef=useRef('');
 const stop=()=>{if(recorder.current?.state==='recording')recorder.current.stop();stream.current?.getTracks().forEach(t=>t.stop());clearTimeout(timer.current);setRecording(false);release.current?.();};
 useEffect(()=>{live.current=true;return()=>{live.current=false;recorder.current?.state==='recording'&&recorder.current.stop();stream.current?.getTracks().forEach(t=>t.stop());clearTimeout(timer.current);URL.revokeObjectURL(urlRef.current);};},[]);
 async function start(){if(pending)return;stopPlayback();setPending(true);try{setStatus(lang==='fil'?'Hinihintay ang mikropono…':'Waiting for microphone…');const s=await navigator.mediaDevices.getUserMedia({audio:true});if(!live.current||document.hidden){s.getTracks().forEach(t=>t.stop());return;}stream.current=s;const r=new MediaRecorder(s);recorder.current=r;const chunks:BlobPart[]=[];let releaseRecording=()=>{};r.ondataavailable=e=>chunks.push(e.data);r.onstop=()=>{s.getTracks().forEach(t=>t.stop());if(!live.current)return;URL.revokeObjectURL(urlRef.current);const u=URL.createObjectURL(new Blob(chunks,{type:r.mimeType}));urlRef.current=u;setUrl(u);setStatus(lang==='fil'?'Pakinggan ang iyong boses.':'Listen to your recording.');setRecording(false);releaseRecording();};releaseRecording = claimPlayback(stop);release.current = releaseRecording;r.start();setRecording(true);setStatus(lang==='fil'?'Nagre-record (hanggang 30 segundo)':'Recording (up to 30 seconds)');timer.current=setTimeout(stop,30000);}catch{stream.current?.getTracks().forEach(t=>t.stop());setStatus(lang==='fil'?'Hindi magamit ang mikropono. Maaari ka pa ring bumasa at magpatuloy.':'Microphone unavailable. You can read aloud and continue without recording.');}finally{if(live.current)setPending(false);}}
 return <div className="record"><button className="mic" disabled={pending} onClick={recording?stop:start} aria-label={recording?t("Stop recording"):t("Record and listen")}>{recording?<Square/>:<Mic/>}</button><p role="status">{status||(lang==='fil'?t("Opsyonal: i-record at pakinggan"):t("Optional: record and listen"))}</p>{url&&<audio ref={replay} controls src={url} muted={muted} aria-label={lang==='fil'?t("Iyong boses"):t("Your recording")} onPlay={e=>{const audio=e.currentTarget;if(isMuted()){audio.pause();return;}stop();replayRelease.current=claimPlayback(()=>audio.pause());audio.volume=0.65;}} onEnded={()=>replayRelease.current?.()}/>}<small>{lang==='fil'?t("Dito lang ang boses mo. Walang pag-upload o pagmamarka."):t("Your voice stays in this tab. No uploads or pronunciation scores.")}</small></div>;
}

export function StoryArt(_props:{text:string;lang:Language}){return <div className="story-visual"><Art name="story" className="story-art"/></div>;}

export function SoundToggle({lang}:{lang:Language}) {const t=useTranslation();
 const muted = useMuted();
 return <button className="sound-toggle" type="button" aria-pressed={muted} onClick={()=>setMuted(!muted)} aria-label={lang==='fil'?(muted?t("I-on ang tunog"):t("I-mute ang tunog")):(muted?t("Unmute sound"):t("Mute sound"))}>
 {muted?<VolumeX size={19}/>:<Volume2 size={19}/>}<span>{lang==='fil'?(muted?t("Tunog: off"):t("Tunog: on")):(muted?t("Sound off"):t("Sound on"))}</span></button>;
}

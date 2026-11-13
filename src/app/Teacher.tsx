import {useTranslation} from '../app/i18n';
import {AccountLink} from '../accounts/AccountScreens';
import {useState} from 'react';
import {useApp} from './context';
import {DictionaryPanel} from '../dictionary/Dictionary';
import {Art,Button,Header,ProgressBar} from '../components/UI';
import {lessonBank} from '../content/lessons';
import {progressKey,type Language} from '../domain/model';

async function hash(pin:string){
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('basabuddy-local-gate:'+pin));
 return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
}

export function Teacher(){const t=useTranslation();
 const {data,update}=useApp();
 const [allowed,setAllowed]=useState(false);
 const [pin,setPin]=useState('');
 const [confirmPin,setConfirmPin]=useState('');
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const [tab,setTab]=useState('overview');
 const [student,setStudent]=useState(data.activeId||data.profiles[0]?.id||'');
 const [lang,setLang]=useState<Language>(data.language);
 const [level,setLevel]=useState('L01');

 async function unlock(e:React.FormEvent){
  e.preventDefault();setMessage('');
  if(!/^\d{4,8}$/.test(pin)){setMessage('Use 4–8 digits.');return;}
  if(!data.teacherPinHash&&pin!==confirmPin){setMessage('The PINs do not match.');return;}
  setBusy(true);
  try{
   const digest=await hash(pin);
   if(data.teacherPinHash&&digest!==data.teacherPinHash){setMessage('That PIN does not match. Try again.');return;}
   if(!data.teacherPinHash)update(d=>({...d,teacherPinHash:digest}));
   setAllowed(true);setPin('');setConfirmPin('');
  }catch{setMessage('Could not open the teacher area. Use localhost or HTTPS and try again.');}
  finally{setBusy(false);}
 }

 if(!allowed)return <>
  <Header title={t("Teacher area")} back="/roles"/><AccountLink/>
  <Art name="teacher" className="hero-art"/>
  <h2>{data.teacherPinHash?t("Enter your teacher PIN"):t("Set a teacher PIN")}</h2>
  <p>{t("This local MVP shows only learners saved in this browser. The teacher PIN is a device-local gate, not cloud authentication.")}</p>
  <form onSubmit={unlock} className="form">
   <label>{t("Teacher PIN")}<input type="password" inputMode="numeric" autoComplete="off" minLength={4} maxLength={8} value={pin} onChange={e=>setPin(e.target.value)} required/></label>
   {!data.teacherPinHash&&<label>{t("Confirm PIN")}<input type="password" inputMode="numeric" autoComplete="off" minLength={4} maxLength={8} value={confirmPin} onChange={e=>setConfirmPin(e.target.value)} required/></label>}
   <Button type="submit" disabled={busy}>{busy?t("Opening…"):data.teacherPinHash?t("Open teacher area"):t("Save PIN and continue")}</Button>
  </form>
  {message&&<p role="alert">{t(message)}</p>}
  <small>{t("No online accounts, school roster, or cloud data are connected.")}</small>
 </>;

 const records=lessonBank[lang].map(l=>({lesson:l,progress:data.progress[progressKey(student,lang,l.id)]}));
 const completed=records.filter(r=>r.progress?.completed).length;
 const practiced=records.filter(r=>r.progress).length;
 function exportData(){
  const out={profile:data.profiles.find(p=>p.id===student),progress:Object.fromEntries(Object.entries(data.progress).filter(([k])=>k.startsWith(student+':'))),assignments:data.assignments.filter(a=>a.studentId===student),gameHistory:(data.gameHistory??[]).filter(e=>e.childId===student),gameAwards:Object.values(data.gameAwards??{}).filter(a=>a.childId===student)};
  const url=URL.createObjectURL(new Blob([JSON.stringify(out,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='basabuddy-learner-progress.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage('Learner data exported.');
 }
 return <>
  <Header title={t("Teacher Dashboard")} back="/roles"/><AccountLink/>
  <div className="teacher-intro"><div><small className="blue">{t("BasaBuddy Classroom")}</small><h2>{t("Teacher Dashboard")}</h2><small>{t("Local learners · No school roster connected")}</small></div><Art name="teacher"/></div>
  <div className="teacher-tabs">{['overview','students','assign','reports','vocabulary'].map(tabId=><button className={tab===tabId?'active':''} key={tabId} onClick={()=>{setTab(tabId);setMessage('');}}>{t(tabId)}</button>)}</div>
  {message&&<p className="feedback correct" role="status">{t(message)}</p>}
  {data.profiles.length>0&&<div className="row selectors">
   <label>{t("Learner")}<select value={student} onChange={e=>setStudent(e.target.value)}>{data.profiles.map(p=><option key={p.id} value={p.id}>{p.name}{t(" · Grade ")}{p.grade}</option>)}</select></label>
   <label>{t("Language")}<select value={lang} onChange={e=>setLang(e.target.value as Language)}><option value="fil">{t("Filipino")}</option><option value="en">{t("English")}</option></select></label>
  </div>}
  {data.profiles.length===0&&<div className="empty"><h2>{t("No learners yet")}</h2><p>{t("Create a local reader through Student onboarding to begin.")}</p><a className="primary" href="/profiles">{t("Student onboarding")}</a></div>}
  {['overview','reports'].includes(tab)&&student&&<>
   <div className="stats"><div><b>{completed}</b><small>{t("Completed")}</small></div><div><b>{practiced}</b><small>{t("Started")}</small></div><div><b>{18-completed}</b><small>{t("To explore")}</small></div></div>
   <section className="card"><h2>{t("Reading progress")}</h2><p>{completed}{t(" of 18 lessons mastered · All time")}</p><ProgressBar value={completed/18*100} label={t("Lessons mastered")}/>{practiced===0&&<p>{t("No practice recorded yet. Start with Listening Detective.")}</p>}</section>
   <section className="card"><h2>{t("Skills to practice")}</h2>{[['Foundations',0,6],['Developing',6,12],['Application',12,18]].map(([title,start,end])=>{
    const n=records.slice(Number(start),Number(end)).filter(r=>r.progress?.completed).length;
    return <div className="skill" key={title}><div className="row"><span>{t(String(title))}</span><small>{n}{t(" / 6 completed")}</small></div><ProgressBar value={n/6*100} label={String(title)}/></div>;
   })}<p className="blue">{t("Try reading one short passage together. Praise effort and revisit tricky words.")}</p></section>
   <section className="card"><h2>{t("Recent learning")}</h2>{!practiced?<p>{t("No attempts yet.")}</p>:records.filter(r=>r.progress).sort((a,b)=>b.progress!.updatedAt.localeCompare(a.progress!.updatedAt)).slice(0,6).map(r=><div className="report-row" key={r.lesson.id}><strong>{t(r.lesson.title)}</strong><small>{r.progress!.attempts?r.progress!.best+t("/5 best · ")+r.progress!.attempts+t(" assessment(s)"):t("Practice in progress")} · {new Date(r.progress!.updatedAt).toLocaleDateString()}</small></div>)}</section>
   <Button secondary onClick={exportData}>{t("Export learner report")}</Button>
  </>}
  {tab==='students'&&<><h2>{t("Local learners")}</h2>{data.profiles.map(p=><button className="card adventure" key={p.id} onClick={()=>{setStudent(p.id);setTab('overview');}}><Art name="student" className="avatar"/><span>{p.name}<small>{t("Grade ")}{p.grade}</small></span><span>→</span></button>)}</>}
  {tab==='assign'&&student&&<form className="card form" onSubmit={e=>{
   e.preventDefault();
   if(data.assignments.some(a=>a.studentId===student&&a.language===lang&&a.levelId===level)){setMessage('This lesson is already assigned.');return;}
   update(d=>({...d,assignments:[...d.assignments,{id:crypto.randomUUID(),studentId:student,language:lang,levelId:level,createdAt:new Date().toISOString()}]}));
   setMessage('Lesson assigned! It will appear on this learner’s home screen. Prerequisite levels still apply.');
  }}>
   <h2>{t("Choose a reading lesson")}</h2><label>{t("Lesson")}<select value={level} onChange={e=>setLevel(e.target.value)}>{lessonBank[lang].map(l=><option value={l.id} key={l.id}>{l.id} · {t(l.title)}</option>)}</select></label><Button type="submit">{t("Assign lesson")}</Button>
   <h2>{t("Assigned on this device")}</h2>{data.assignments.filter(a=>a.studentId===student).map(a=><div className="report-row" key={a.id}><span>{a.language} · {a.levelId}</span><button type="button" className="soft" onClick={()=>update(d=>({...d,assignments:d.assignments.filter(x=>x.id!==a.id)}))}>{t("Remove assignment")}</button></div>)}
  </form>}
  {tab==='vocabulary'&&student&&<DictionaryPanel key={student} learnerId={student} classroom/>}
  <Button secondary onClick={()=>{setAllowed(false);setMessage('');}}>{t("Lock teacher area")}</Button>
 </>;
}

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

export function Teacher(){
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
  <Header title="Teacher area" back="/roles"/>
  <Art name="teacher" className="hero-art"/>
  <h2>{data.teacherPinHash?'Enter your teacher PIN':'Set a teacher PIN'}</h2>
  <p>This local MVP shows only learners saved in this browser. The teacher PIN is a device-local gate, not cloud authentication.</p>
  <form onSubmit={unlock} className="form">
   <label>Teacher PIN<input type="password" inputMode="numeric" autoComplete="off" minLength={4} maxLength={8} value={pin} onChange={e=>setPin(e.target.value)} required/></label>
   {!data.teacherPinHash&&<label>Confirm PIN<input type="password" inputMode="numeric" autoComplete="off" minLength={4} maxLength={8} value={confirmPin} onChange={e=>setConfirmPin(e.target.value)} required/></label>}
   <Button type="submit" disabled={busy}>{busy?'Opening…':data.teacherPinHash?'Open teacher area':'Save PIN and continue'}</Button>
  </form>
  {message&&<p role="alert">{message}</p>}
  <small>No online accounts, school roster, or cloud data are connected.</small>
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
  <Header title="Teacher Dashboard" back="/roles"/>
  <div className="teacher-intro"><div><small className="blue">BasaBuddy Classroom</small><h2>Teacher Dashboard</h2><small>Local learners · No school roster connected</small></div><Art name="teacher"/></div>
  <div className="teacher-tabs">{['overview','students','assign','reports','vocabulary'].map(t=><button className={tab===t?'active':''} key={t} onClick={()=>{setTab(t);setMessage('');}}>{t}</button>)}</div>
  {message&&<p className="feedback correct" role="status">{message}</p>}
  {data.profiles.length>0&&<div className="row selectors">
   <label>Learner<select value={student} onChange={e=>setStudent(e.target.value)}>{data.profiles.map(p=><option key={p.id} value={p.id}>{p.name} · Grade {p.grade}</option>)}</select></label>
   <label>Language<select value={lang} onChange={e=>setLang(e.target.value as Language)}><option value="fil">Filipino</option><option value="en">English</option></select></label>
  </div>}
  {data.profiles.length===0&&<div className="empty"><h2>No learners yet</h2><p>Create a local reader through Student onboarding to begin.</p><a className="primary" href="/profiles">Student onboarding</a></div>}
  {['overview','reports'].includes(tab)&&student&&<>
   <div className="stats"><div><b>{completed}</b><small>Completed</small></div><div><b>{practiced}</b><small>Started</small></div><div><b>{18-completed}</b><small>To explore</small></div></div>
   <section className="card"><h2>Reading progress</h2><p>{completed} of 18 lessons mastered · All time</p><ProgressBar value={completed/18*100} label="Lessons mastered"/>{practiced===0&&<p>No practice recorded yet. Start with Listening Detective.</p>}</section>
   <section className="card"><h2>Skills to practice</h2>{[['Foundations',0,6],['Developing',6,12],['Application',12,18]].map(([title,start,end])=>{
    const n=records.slice(Number(start),Number(end)).filter(r=>r.progress?.completed).length;
    return <div className="skill" key={title}><div className="row"><span>{title}</span><small>{n} / 6 completed</small></div><ProgressBar value={n/6*100} label={String(title)}/></div>;
   })}<p className="blue">Try reading one short passage together. Praise effort and revisit tricky words.</p></section>
   <section className="card"><h2>Recent learning</h2>{!practiced?<p>No attempts yet.</p>:records.filter(r=>r.progress).sort((a,b)=>b.progress!.updatedAt.localeCompare(a.progress!.updatedAt)).slice(0,6).map(r=><div className="report-row" key={r.lesson.id}><strong>{r.lesson.title}</strong><small>{r.progress!.attempts?r.progress!.best+'/5 best · '+r.progress!.attempts+' assessment(s)':'Practice in progress'} · {new Date(r.progress!.updatedAt).toLocaleDateString()}</small></div>)}</section>
   <Button secondary onClick={exportData}>Export learner report</Button>
  </>}
  {tab==='students'&&<><h2>Local learners</h2>{data.profiles.map(p=><button className="card adventure" key={p.id} onClick={()=>{setStudent(p.id);setTab('overview');}}><Art name="student" className="avatar"/><span>{p.name}<small>Grade {p.grade}</small></span><span>→</span></button>)}</>}
  {tab==='assign'&&student&&<form className="card form" onSubmit={e=>{
   e.preventDefault();
   if(data.assignments.some(a=>a.studentId===student&&a.language===lang&&a.levelId===level)){setMessage('This lesson is already assigned.');return;}
   update(d=>({...d,assignments:[...d.assignments,{id:crypto.randomUUID(),studentId:student,language:lang,levelId:level,createdAt:new Date().toISOString()}]}));
   setMessage('Lesson assigned! It will appear on this learner’s home screen. Prerequisite levels still apply.');
  }}>
   <h2>Choose a reading lesson</h2><label>Lesson<select value={level} onChange={e=>setLevel(e.target.value)}>{lessonBank[lang].map(l=><option value={l.id} key={l.id}>{l.id} · {l.title}</option>)}</select></label><Button type="submit">Assign lesson</Button>
   <h2>Assigned on this device</h2>{data.assignments.filter(a=>a.studentId===student).map(a=><div className="report-row" key={a.id}><span>{a.language} · {a.levelId}</span><button type="button" className="soft" onClick={()=>update(d=>({...d,assignments:d.assignments.filter(x=>x.id!==a.id)}))}>Remove assignment</button></div>)}
  </form>}
  {tab==='vocabulary'&&student&&<DictionaryPanel key={student} learnerId={student} classroom/>}
  <Button secondary onClick={()=>{setAllowed(false);setMessage('');}}>Lock teacher area</Button>
 </>;
}

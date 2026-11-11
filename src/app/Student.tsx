import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {BookOpen,Settings,ChevronRight,Lock,Check,Star,Sparkles,Play} from 'lucide-react';
import {useApp} from './context';
import {Art,Brand,Button,Header,LanguageSwitch,ProgressBar} from '../components/UI';
import {AudioButton,Recorder} from '../components/Audio';
import {lessonBank,worlds} from '../content/lessons';
import {canUnlockLevel,progressKey} from '../domain/model';
export function useStudent(){const {data,update}=useApp();const f=data.language==='fil';const lessons=lessonBank[data.language];const completed=lessons.filter(l=>data.progress[progressKey(data.activeId,data.language,l.id)]?.completed).length;const current=lessons[Math.min(completed,17)];const profile=data.profiles.find(p=>p.id===data.activeId);return {data,update,f,lessons,completed,current,profile};}
export function Home(){const {data,f,completed,current,profile}=useStudent();const nav=useNavigate();return <><header className="home-header"><Brand/><button className="icon-btn" aria-label="Settings" onClick={()=>nav('/student/settings')}><Settings/></button></header><p className="muted greeting">{f?'Magandang araw':'Hello'}, {profile?.name}! ☀️</p><h1>{f?'Handa nang magbasa?':'Let’s keep reading!'}</h1><LanguageSwitch/><div className="buddy-card"><Art name="owl"/><div><h2>{f?'Magbasa tayo!':'Your next little step'}</h2><p>{current.title}</p><small>{completed} / 18 {f?'araling tapos':'lessons completed'}</small><ProgressBar value={completed/18*100} label="Completed lessons"/></div></div><h2>{f?'Pakikipagsapalaran ngayon':'Today’s adventure'}</h2><button className="adventure card" onClick={()=>nav(`/learn/${data.language}/${current.id}`)}><Art name="objects/open-book" alt="" className="adventure-icon"/><span><strong>{current.title}</strong><small>{f?'Aralin':'Level'} {Number(current.id.slice(1))} · {f?'Basa at laro':'Read and play'}</small></span><ChevronRight/></button><Button onClick={()=>nav(`/learn/${data.language}/${current.id}`)}>{f?'Magpatuloy sa pagbabasa':'Continue reading'}</Button><div className="shortcuts"><button onClick={()=>nav('/student/practice/repeat')}><Art name="icons/listen" alt="" className="shortcut-art"/>{f?'Makinig':'Listen'}</button><button onClick={()=>nav('/student/practice/puzzle')}><Art name="icons/puzzle" alt="" className="shortcut-art"/>{f?'Laro':'Play'}</button><button onClick={()=>nav('/student/daily')}><Art name="icons/star" alt="" className="shortcut-art"/>{f?'Misyon':'Quest'}</button></div><Link className="dictionary-link" to="/student/dictionary"><BookOpen size={20}/>{f?'Diksiyonaryong may larawan':'Picture Dictionary'}<ChevronRight size={18}/></Link>{data.assignments.filter(a=>a.studentId===data.activeId&&a.language===data.language).map(a=><div key={a.id} className="card"><strong>{f?'Takdang aralin':'Assigned reading'}</strong><p>{lessonBank[a.language].find(l=>l.id===a.levelId)?.title}</p><Button secondary onClick={()=>nav(`/learn/${a.language}/${a.levelId}`)}>{f?'Buksan':'Open'}</Button></div>)}</>;}
export function Levels(){
  const {data,f,lessons,completed}=useStudent();
  const [locked,setLocked]=useState('');
  const nav=useNavigate();

  // 3D icon mapped per world
  const worldIcons = [
    'icons/listen',    // 1. Sound Forest
    'icons/puzzle',    // 2. Syllable Island
    'icons/read',      // 3. Word Village
    'icons/target',    // 4. Sentence Town
    'icons/trophy',    // 5. Story Castle
    'icons/star',      // 6. Reading Adventure
  ];

  // Winding horizontal offsets (percentages across container)
  const getX = (worldIdx: number, lessonIdx: number) => {
    if (lessonIdx === 0) return 50;
    if (lessonIdx === 1) return worldIdx % 2 === 0 ? 68 : 32;
    return 50;
  };

  return <>
    <Header title={f ? 'Mga Mundo ng Pagbasa' : 'Learning Worlds'} />

    {/* Header with original blue owl mascot, brand messaging & speech bubble */}
    <div className="roadmap-hero">
      <div className="roadmap-hero-avatar-wrap">
        <Art name="mascots/welcome-original" alt="BasaBuddy blue owl" className="roadmap-hero-owl" />
        <div className="roadmap-speech-bubble" aria-hidden="true">
          <span>{f ? 'Tara, magbasa tayo! 🌟' : "Let's read together! 🌟"}</span>
        </div>
      </div>
      <div className="roadmap-hero-content">
        <Brand />
        <p className="roadmap-hero-subtitle">
          {f ? 'Mula sa mga tunog hanggang sa kuwento' : 'From little sounds to big stories'}
        </p>
        <div className="roadmap-hero-progress">
          <span className="roadmap-progress-pill">
            <Star size={13} fill="#eab308" color="#ca8a04" />
            {completed} / 18 {f ? 'araling tapos' : 'lessons completed'}
          </span>
        </div>
      </div>
    </div>

    <LanguageSwitch />

    <div className="roadmap-container">
      {worlds.map((w, i) => {
        const worldLessons = lessons.slice(i * 3, i * 3 + 3);
        const worldSub = i < 2 
          ? (f ? 'Mga unang hakbang' : 'First little steps') 
          : i < 4 
          ? (f ? 'Palaguin ang pagbasa' : 'Growing readers') 
          : (f ? 'Bumasa at umunawa' : 'Read and understand');
        
        const isCurvingRight = i % 2 === 0;

        return (
          <section className={`roadmap-world roadmap-world-${i}`} key={w[0]}>
            <div className="roadmap-world-header">
              <span className="roadmap-world-badge">{i + 1}</span>
              <div className="roadmap-world-info">
                <h2>{f ? w[1] : w[0]}</h2>
                <small>{worldSub}</small>
              </div>
              <Art name={worldIcons[i]} alt="" className="roadmap-world-icon" />
            </div>

            <div className="roadmap-track">
              {/* Clean, thin, smooth curved dotted roadmap path */}
              <svg 
                className="roadmap-path-svg" 
                viewBox="0 0 100 240" 
                preserveAspectRatio="none" 
                aria-hidden="true"
              >
                <path
                  d={
                    isCurvingRight
                      ? "M 50 25 C 70 55, 70 75, 68 105 C 66 135, 52 155, 50 185"
                      : "M 50 25 C 30 55, 30 75, 32 105 C 34 135, 48 155, 50 185"
                  }
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="4 6"
                />
              </svg>

              {worldLessons.map((l, j) => {
                const order = i * 3 + j + 1;
                const done = Boolean(data.progress[progressKey(data.activeId, data.language, l.id)]?.completed);
                const unlocked = canUnlockLevel(data, data.language, order);
                const isActive = unlocked && !done;
                const posX = getX(i, j);

                return (
                  <div
                    key={l.id}
                    className={`roadmap-node-wrap ${isActive ? 'is-active' : ''} ${done ? 'is-done' : ''} ${!unlocked ? 'is-locked' : ''}`}
                    style={{ left: `${posX}%` }}
                  >
                    {isActive && (
                      <div className="roadmap-active-companion">
                        <Art name="mascots/encouraging" alt="" className="companion-owl" />
                        <span className="roadmap-active-badge">
                          <Play size={11} fill="currentColor" /> {f ? 'Simulan' : 'Start'}
                        </span>
                      </div>
                    )}

                    <button
                      className={`roadmap-node-btn ${isActive ? 'active' : ''} ${done ? 'done' : ''} ${!unlocked ? 'locked' : ''}`}
                      aria-label={`${f ? 'Aralin' : 'Level'} ${order}: ${l.title}${!unlocked ? ' (locked)' : ''}`}
                      onClick={() => unlocked 
                        ? nav(`/learn/${data.language}/${l.id}`) 
                        : setLocked(f 
                            ? `Tapusin ang Aralin ${order - 1} para mabuksan ito.` 
                            : `Complete Level ${order - 1} to unlock this adventure.`
                          )
                      }
                    >
                      <div className="roadmap-node-inner">
                        {done ? (
                          <div className="node-done-stars" aria-hidden="true">
                            <Star size={24} className="node-icon-star" fill="#ffffff" color="#ffffff" />
                          </div>
                        ) : !unlocked ? (
                          <Lock size={20} className="node-icon-lock" />
                        ) : (
                          <span className="node-number">{order}</span>
                        )}
                      </div>
                    </button>

                    <div className="roadmap-node-label">
                      <span className="roadmap-node-tag">{f ? 'Aralin' : 'Level'} {order}</span>
                      <strong className="roadmap-node-title">{l.title}</strong>
                      {done && (
                        <div className="node-mini-stars" aria-label="3 stars earned">
                          <Star size={11} fill="#eab308" color="#ca8a04" />
                          <Star size={13} fill="#eab308" color="#ca8a04" />
                          <Star size={11} fill="#eab308" color="#ca8a04" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>

    {locked && (
      <div className="modal" role="dialog" aria-modal="true" aria-label="Locked level">
        <div className="card modal-kid-card">
          <Art name="mascots/encouraging" alt="BasaBuddy" className="modal-kid-owl" />
          <h2>{f ? 'Isang hakbang muna! 🌟' : 'One little step at a time! 🌟'}</h2>
          <p>{locked}</p>
          <Button onClick={() => setLocked('')}>{f ? 'Sige, tara! 🚀' : 'Got it, let’s go! 🚀'}</Button>
        </div>
      </div>
    )}
  </>;
}
export {DictionaryScreen as Dictionary} from '../dictionary/Dictionary';
export function Journey(){const {data,f,completed,lessons,current}=useStudent();const nav=useNavigate();return <><Header title={f?'Aking Paglalakbay sa Pagbasa':'My Reading Journey'}/><LanguageSwitch/><div className="journey"><h2>{f?'Bawat hakbang ay mahalaga 🌈':'Every little step counts 🌈'}</h2><p>{completed} / 18 {f?'badge na nakuha':'reading badges earned'}</p><div className="journey-path">{worlds.map((w,i)=>{const count=lessons.slice(i*3,i*3+3).filter(l=>data.progress[progressKey(data.activeId,data.language,l.id)]?.completed).length;return <button key={i} className={`milestone milestone-${i}`} onClick={()=>nav('/student/levels')} aria-label={`${w[0]}: ${count} of 3 completed`}><span>{w[2]}</span><small>{count}/3 {count===3?'★':'☆'}</small></button>;})}</div><div className="buddy-card"><Art name="owl"/><div><h2>{f?'Patuloy lang!':'Let’s keep reading!'}</h2><p>{current.title}</p></div></div></div><Button onClick={()=>nav(`/learn/${data.language}/${current.id}`)}>{f?'Magpatuloy':'Continue my adventure'}</Button></>;}
export function Stories(){const {f,data}=useStudent();const nav=useNavigate();return <><Header title={f?'Oras ng Kuwento':'Story Time'}/><LanguageSwitch/><button className="story-link" aria-label={f?"Basahin ang kuwento":"Read the story illustration"} onClick={()=>nav('/student/practice/story')}><Art name="story" className="story-art"/></button><h2>{f?'Si Ana at ang Pusa':'Ana and the Cat'}</h2><p>{f?'Isang kuwentong maaari mong basahin anumang oras.':'A little story to read whenever you like.'}</p><Button onClick={()=>nav('/student/practice/story')}>{f?'Basahin ang kuwento':'Read the story'}</Button><h2>{f?'Mga kuwento sa iyong aralin':'Stories on your learning path'}</h2>{lessonBank[data.language].slice(15).map(l=><button key={l.id} className="card adventure" onClick={()=>nav(`/learn/${data.language}/${l.id}`)}><BookOpen/><span>{l.title}</span><ChevronRight/></button>)}</>;}
export function Daily(){const {data,update,f}=useStudent();const date=new Date().toLocaleDateString('en-CA');const key=`${data.activeId}:${data.language}:${date}`;const done=data.quests[key]??[];const nav=useNavigate();return <><Header title={f?'Misyon sa Pagbasa Ngayon':'Today’s Reading Quest'}/><p className="center muted">{done.length} / 3 {f?'gawaing tapos':'reading steps completed'}</p><ProgressBar value={done.length/3*100} label="Daily quest"/>{[['word',f?'Bumasa ng 3 salita':'Read 3 words','📖'],['aloud',f?'Bumasa ng 1 pangungusap':'Read 1 sentence','🎙️'],['story',f?'Bumasa ng kuwento':'Read a story','⭐']].map(([id,title,icon])=><button className="card quest-card" key={id} onClick={()=>nav(`/student/practice/${id}?quest=1`)}><span>{icon}</span><div><h2>{title}</h2><small>{done.includes(id)?(f?'Tapos na':'Completed'):(f?'Simulan natin':'Ready when you are')}</small></div>{done.includes(id)?<Check color="#28ae49"/>:<ChevronRight/>}</button>)}{done.length===3?<><Art name="celebrate" className="story-art"/><h2 className="center">{f?'Ang husay mo!':'Amazing work!'} 🎉</h2><Button onClick={()=>nav('/student/journey')}>{f?'Tingnan ang paglalakbay':'See my journey'}</Button></>:<div className="buddy-card"><Art name="owl"/><p>{f?'Kahit kaunting pagbasa, malaking hakbang!':'A little reading makes a big difference!'}</p></div>}</>;}
export function SettingsScreen(){const {data,update,f,profile}=useStudent();const nav=useNavigate();return <><Header title={f?'Mga Setting':'Settings'}/><h2>{profile?.name}</h2><LanguageSwitch/><div className="card"><h2>{f?'Naka-save sa browser na ito':'Saved in this browser'}</h2><p>{f?'Dito lang naka-save ang iyong pag-unlad.':'Your progress stays on this device.'}</p><p>{f?'Ang audio ay boses ng browser, kung mayroon.':'Audio uses installed browser voices when available.'}</p></div><Button secondary onClick={()=>nav('/profiles')}>{f?'Palitan ang mambabasa':'Switch learner'}</Button><Button secondary onClick={()=>nav('/roles')}>{f?'Pumili ng tungkulin':'Choose role'}</Button></>;}

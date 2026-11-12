import './accounts.css';
import {useId,useRef,useState,type FormEvent} from 'react';
import {Link,Navigate,useNavigate} from 'react-router-dom';
import {ArrowLeft,BookOpen,Camera,Eye,EyeOff,LockKeyhole,LogOut,Mail,ShieldCheck,Trash2,UserRound} from 'lucide-react';
import {Art} from '../components/UI';
import {useAccount} from './context';
import {preparePhoto} from './photo';
import {useApp} from '../app/context';
import type {AccountRole} from './repository';
import {withAccountReader} from './reader';

function AuthHeader({title}:{title:string}){return <header className="account-header"><Link to="/welcome" aria-label="Back to welcome"><ArrowLeft/></Link><h1>{title}</h1><Art name="mascots/welcome-original" alt=""/></header>;}
function AuthHero({signup=false}:{signup?:boolean}){return <div className="account-hero"><Art name="mascots/welcome-original" alt="Blue owl reading a book" priority/><div><span className="brand">Basa<span>Buddy</span></span><h2>{signup?'A little account. A big reading journey!':'More reading adventures await!'}</h2></div></div>;}
function PasswordField({label='Password',value,onChange,autoComplete='current-password',disabled=false}:{label?:string;value:string;onChange:(value:string)=>void;autoComplete?:string;disabled?:boolean}){
 const id=useId(),[visible,setVisible]=useState(false);
 return <div className="account-field"><label htmlFor={id}>{label}</label><div className="account-input"><LockKeyhole aria-hidden="true"/><input id={id} type={visible?'text':'password'} value={value} onChange={e=>onChange(e.target.value)} autoComplete={autoComplete} required minLength={8} maxLength={128} placeholder={label==='Confirm password'?'Enter your password again':'Enter your password'} disabled={disabled}/><button className="password-toggle" type="button" aria-label={`${visible?'Hide':'Show'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={()=>setVisible(!visible)} disabled={disabled}>{visible?<Eye/>:<EyeOff/>}</button></div></div>;
}
function GradeField({value,onChange,disabled=false,label='Grade'}:{value:string;onChange:(value:string)=>void;disabled?:boolean;label?:string}){
 const id=useId();return <div className="account-field"><label htmlFor={id}>{label}</label><select id={id} value={value} onChange={e=>onChange(e.target.value)} disabled={disabled} required>{['1','2','3'].map(grade=><option key={grade} value={grade}>Grade {grade}</option>)}</select></div>;
}
function RoleField({value,onChange,disabled=false}:{value:AccountRole;onChange:(value:AccountRole)=>void;disabled?:boolean}){
 const id=useId();return <div className="account-field"><label htmlFor={id}>Role</label><select id={id} value={value} onChange={event=>onChange(event.target.value as AccountRole)} disabled={disabled} required><option value="student">Student</option><option value="teacher">Teacher</option></select></div>;
}
const accountEntry=(role:AccountRole,creating:boolean)=>role==='teacher'?'/adult/teacher':creating?'/language':'/student/home';

function PhotoPicker({photo,onChange,disabled=false,onBusy}:{photo?:string;onChange:(value?:string)=>void|Promise<void>;disabled?:boolean;onBusy?:(busy:boolean)=>void}){
 const id=useId(),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const input=useRef<HTMLInputElement>(null);
 async function choose(file?:File){
  if(!file)return;setError('');setBusy(true);onBusy?.(true);
  try{await onChange(await preparePhoto(file));}catch(error){setError(error instanceof Error?error.message:'Could not save your photo. Try again.');}
  finally{setBusy(false);onBusy?.(false);if(input.current)input.current.value='';}
 }
 async function remove(){setError('');setBusy(true);onBusy?.(true);try{await onChange(undefined);}catch(error){setError(error instanceof Error?error.message:'Could not remove your photo.');}finally{setBusy(false);onBusy?.(false);}}
 return <div className="photo-picker"><div className="account-avatar">{photo?<img src={photo} alt="Your profile photo"/>:<UserRound aria-hidden="true" size={42}/>}<span><Camera size={16}/></span></div><div><label className={`photo-upload ${busy||disabled?'photo-disabled':''}`} htmlFor={id}>{busy?'Saving photo…':photo?'Change profile photo':'Add profile photo'}</label><input ref={input} id={id} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose profile photo" onChange={e=>void choose(e.target.files?.[0])} disabled={disabled||busy}/><small>Optional · JPG, PNG, or WebP, up to 5 MB</small>{photo&&<button type="button" className="text-button" onClick={()=>void remove()} disabled={disabled||busy}>Remove photo</button>}</div>{error&&<p className="account-error" role="alert">{error}</p>}</div>;
}

export function AuthScreen({mode}:{mode:'signup'|'login'}){
 const {account,signup,login,logout,notice}=useAccount(),nav=useNavigate();
 const creating=mode==='signup';
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[photo,setPhoto]=useState<string|undefined>();
 const [grade,setGrade]=useState('1');
 const [role,setRole]=useState<AccountRole>('student');
 const [busy,setBusy]=useState(false),[photoBusy,setPhotoBusy]=useState(false),[error,setError]=useState(''),[help,setHelp]=useState(false);
 const errorRef=useRef<HTMLParagraphElement>(null);
 if(account)return <Navigate to={accountEntry(account.role,creating)} replace/>;
 async function submit(event:FormEvent){
  event.preventDefault();if(busy||photoBusy)return;setError('');
  if(creating&&password!==confirm){setError('Your passwords do not match. Please enter them again.');return;}
  setBusy(true);
  try{
   const next=creating?await signup({name,email,password,photo,grade,role}):await login(email,password);
   nav(accountEntry(next.role,creating),{replace:true});
  }catch(error){setError(error instanceof Error?error.message:'Could not open your account. Please try again.');requestAnimationFrame(()=>errorRef.current?.focus());}
  finally{setBusy(false);}
 }
 return <section className="account-screen"><AuthHeader title={creating?'Join BasaBuddy':'Welcome back'}/><AuthHero signup={creating}/><h2 className="account-title">{creating?'Create your account':'Log in to your account'}</h2><p className="account-local"><ShieldCheck size={16}/> Saved only on this device</p>
  <form className="account-form" onSubmit={event=>void submit(event)}>
   {creating&&<PhotoPicker photo={photo} onChange={setPhoto} disabled={busy} onBusy={setPhotoBusy}/>}
   {creating&&<div className="account-field"><label htmlFor="account-name">Your name</label><div className="account-input"><UserRound aria-hidden="true"/><input id="account-name" value={name} onChange={e=>setName(e.target.value)} autoComplete="nickname" required maxLength={50} placeholder="What should we call you?" disabled={busy}/></div></div>}
   {creating&&<GradeField value={grade} onChange={setGrade} disabled={busy}/>}
   {creating&&<RoleField value={role} onChange={setRole} disabled={busy}/>}
   <div className="account-field"><label htmlFor="account-email">Account email</label><div className="account-input"><Mail aria-hidden="true"/><input id="account-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required maxLength={254} placeholder="you@example.com" disabled={busy}/></div></div>
   <PasswordField value={password} onChange={setPassword} autoComplete={creating?'new-password':'current-password'} disabled={busy}/>
   {creating&&<><small className="password-help">Use at least 8 characters. Keep your password somewhere safe.</small><PasswordField label="Confirm password" value={confirm} onChange={setConfirm} autoComplete="new-password" disabled={busy}/></>}
   {(error||notice)&&<p ref={errorRef} tabIndex={-1} className="account-error" role="alert">{error||notice}</p>}
   <button type="submit" className="primary account-submit" disabled={busy||photoBusy}>{busy?'Please wait…':creating?'Create account':'Log in'}</button>
  </form>
  {!creating&&<><button className="text-button account-help" type="button" aria-expanded={help} onClick={()=>setHelp(!help)}>Need help logging in?</button>{help&&<p className="account-help-copy">Use the email and password you created in this browser. Device-only accounts cannot send password-reset emails. You can always continue as a guest.</p>}</>}
  <button className="account-guest" type="button" onClick={()=>{logout();nav('/roles');}} disabled={busy}><BookOpen/> Continue as a guest reader</button>
  <p className="account-switch">{creating?'Already have an account?':'New here?'} <Link to={creating?'/login':'/signup'}>{creating?'Log in':'Create an account'}</Link></p>
  <p className="account-footnote">Grown-ups handle account details. Little readers can explore as a guest.</p><p className="account-footnote">Accounts, photos, and progress stay in this browser. They do not sync to other devices, and clearing site data removes them.</p>
 </section>;
}

function AccountDetails({disabled,onBusy}:{disabled:boolean;onBusy:(value:boolean)=>void}){
 const {account,details}=useAccount(),{update}=useApp();
 const [name,setName]=useState(account!.name),[email,setEmail]=useState(account!.email),[grade,setGrade]=useState(account!.grade);
 const [role,setRole]=useState<AccountRole>(account!.role);
 const [currentPassword,setCurrentPassword]=useState(''),[newPassword,setNewPassword]=useState(''),[confirm,setConfirm]=useState('');
 const [changingPassword,setChangingPassword]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState('');
 const locked=disabled||busy;
 const needsPassword=changingPassword||email.trim().toLowerCase()!==account!.email;
 function reset(){setName(account!.name);setEmail(account!.email);setGrade(account!.grade);setRole(account!.role);setCurrentPassword('');setNewPassword('');setConfirm('');setChangingPassword(false);setError('');setSaved('');}
 async function submit(event:FormEvent){
  event.preventDefault();if(locked)return;setError('');setSaved('');
  if(changingPassword&&newPassword!==confirm){setError('Your new passwords do not match.');return;}
  setBusy(true);onBusy(true);
  try{
   const previousName=account!.name;
   const next=await details({name,email,grade,role,currentPassword:needsPassword?currentPassword:undefined,newPassword:changingPassword?newPassword:undefined});
   update(data=>{const prepared=withAccountReader(data,next);return {...prepared,profiles:prepared.profiles.map((profile,index)=>next.role==='student'&&index===0&&profile.name===previousName?{...profile,name:next.name,grade:next.grade}:profile)};});
   setName(next.name);setEmail(next.email);setGrade(next.grade);setRole(next.role);setCurrentPassword('');setNewPassword('');setConfirm('');setChangingPassword(false);setSaved('Your account details are saved.');
  }catch(error){setError(error instanceof Error?error.message:'Could not save your account details. Please try again.');}
  finally{setBusy(false);onBusy(false);}
 }
 return <section className="account-details" aria-labelledby="account-details-title"><h2 id="account-details-title">Account details</h2><form className="account-form" onSubmit={event=>void submit(event)}>
  <div className="account-field"><label htmlFor="edit-account-name">Your name</label><input id="edit-account-name" value={name} onChange={e=>{setName(e.target.value);setSaved('');}} autoComplete="nickname" maxLength={50} required disabled={locked}/></div>
  <div className="account-field"><label htmlFor="edit-account-email">Account email</label><input id="edit-account-email" type="email" value={email} onChange={e=>{setEmail(e.target.value);setSaved('');}} autoComplete="email" maxLength={254} required disabled={locked}/></div>
  <GradeField value={grade} onChange={value=>{setGrade(value);setSaved('');}} disabled={locked}/>
  <RoleField value={role} onChange={value=>{setRole(value);setSaved('');}} disabled={locked}/>
  <small>{role==='teacher'?'Teacher accounts open the teacher area when logging in. The teacher PIN is still required.':'Student accounts open the reading home when logging in.'}</small>
  <small>The first reader inherits this name and grade while it still uses your account name. Other readers keep their own details.</small>
  <button className="text-button" type="button" aria-expanded={changingPassword} disabled={locked} onClick={()=>{setChangingPassword(!changingPassword);setNewPassword('');setConfirm('');setSaved('');}}>Change password</button>
  {needsPassword&&<><PasswordField label="Current password" value={currentPassword} onChange={setCurrentPassword} disabled={locked}/><small>Confirm your current password to change your email or password.</small></>}
  {changingPassword&&<><PasswordField label="New password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" disabled={locked}/><PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" disabled={locked}/></>}
  {error&&<p role="alert" className="account-error">{error}</p>}{saved&&<p role="status" className="account-success">{saved}</p>}
  <button className="primary account-submit" type="submit" disabled={locked}>{busy?'Saving…':'Save account details'}</button><button className="text-button" type="button" onClick={reset} disabled={locked}>Cancel edits</button>
 </form></section>;
}

export function ReaderDetails(){
 const {data,update,error}=useApp();const profile=data.profiles.find(reader=>reader.id===data.activeId);
 const [name,setName]=useState(profile?.name??''),[grade,setGrade]=useState(profile?.grade??'1'),[saved,setSaved]=useState(false);
 if(!profile)return null;
 return <section className="account-details" aria-labelledby="reader-details-title"><h2 id="reader-details-title">Reader details</h2><form className="account-form" onSubmit={event=>{event.preventDefault();if(!name.trim())return;update(store=>({...store,profiles:store.profiles.map(reader=>reader.id===profile.id?{...reader,name:name.trim(),grade}:reader)}));setSaved(true);}}>
  <div className="account-field"><label htmlFor="edit-reader-name">Reader name</label><input id="edit-reader-name" value={name} onChange={event=>{setName(event.target.value);setSaved(false);}} required maxLength={50}/></div>
  <GradeField label="Reader grade" value={grade} onChange={value=>{setGrade(value);setSaved(false);}}/>
  <button className="primary account-submit" type="submit" disabled={!name.trim()}>Save reader details</button>{saved&&!error&&<p role="status" className="account-success">Your reader details are saved.</p>}
 </form></section>;
}

export function AccountScreen(){
 const {account,logout,photo,remove}=useAccount(),nav=useNavigate();
 const [deleting,setDeleting]=useState(false),[password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[busy,setBusy]=useState(false),[photoBusy,setPhotoBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState('');
 const [detailsBusy,setDetailsBusy]=useState(false);
 const confirmRef=useRef<HTMLInputElement>(null);
 if(!account)return <section className="account-screen"><AuthHeader title="Your account"/><AuthHero/><h2>Reading as a guest</h2><p>Create an account to keep your readers and profile photo together on this device.</p><Link className="primary account-link" to="/signup">Create account</Link><Link className="account-guest" to="/login">Log in</Link></section>;
 async function destroy(event:FormEvent){
  event.preventDefault();if(confirmation!=='DELETE'||busy||photoBusy||detailsBusy)return;setError('');setBusy(true);
  try{await remove(password);nav('/account-deleted',{replace:true});}
  catch(error){setError(error instanceof Error?error.message:'Could not delete your account. Try again.');}
  finally{setBusy(false);}
 }
 return <section className="account-screen"><AuthHeader title="Your account"/><div className="account-summary"><span className="account-eyebrow">YOUR READING CORNER</span><h2>Hello, {account.name}!</h2><p>{account.email}</p><p>{account.role==='teacher'?'Teacher':'Student'} · Grade {account.grade}</p><span className="account-local"><ShieldCheck size={16}/> Device-only account</span></div>
  <PhotoPicker photo={account.photo} disabled={busy||detailsBusy} onBusy={setPhotoBusy} onChange={async value=>{await photo(value);setSaved(value?'Your profile photo is saved.':'Your profile photo was removed.');}}/>{saved&&<p role="status" className="account-success">{saved}</p>}
  <AccountDetails key={account.id} disabled={busy||photoBusy} onBusy={setDetailsBusy}/>
  {account.role==='teacher'&&<Link className="primary account-link" to="/adult/teacher">Open teacher area</Link>}
  <Link className="primary account-link" to="/profiles">Choose a reader</Link>
  <button className="account-guest" type="button" disabled={busy||photoBusy||detailsBusy} onClick={()=>{logout();nav('/login',{replace:true});}}><LogOut/> Log out</button><p className="account-footnote">Logging out keeps this account’s readers and progress saved on this device. Log in again to continue.</p>
  <section className="account-danger" aria-labelledby="delete-title"><h2 id="delete-title">Delete account</h2><p>This removes your account, photo, readers, and their reading progress from this browser. It cannot be undone.</p>
   {!deleting?<button type="button" className="danger-button" disabled={photoBusy||detailsBusy} onClick={()=>{setDeleting(true);setSaved('');requestAnimationFrame(()=>confirmRef.current?.focus());}}><Trash2 size={18}/> Delete my account</button>:
    <form onSubmit={event=>void destroy(event)} className="account-form"><p>Your guest reading progress and other accounts will stay on this device.</p><PasswordField value={password} onChange={setPassword} disabled={busy}/><div className="account-field"><label htmlFor="delete-confirm">Type DELETE to confirm</label><input ref={confirmRef} id="delete-confirm" value={confirmation} onChange={e=>setConfirmation(e.target.value)} required autoComplete="off" disabled={busy}/></div>{error&&<p role="alert" className="account-error">{error}</p>}<button className="danger-button" type="submit" disabled={confirmation!=='DELETE'||!password||busy||photoBusy}>{busy?'Deleting…':'Permanently delete account'}</button><button className="text-button" type="button" disabled={busy} onClick={()=>{setDeleting(false);setPassword('');setConfirmation('');setError('');}}>Keep my account</button></form>}
  </section><p className="account-footnote">Local accounts provide separate reading spaces on this browser. They are not a secure boundary for people who can access this device or its browser data.</p>
 </section>;
}

export function AccountDeleted(){return <section className="account-screen"><AuthHeader title="Account deleted"/><Art name="mascots/welcome-original" className="account-goodbye" alt="BasaBuddy owl"/><h2>Your account has been deleted.</h2><p>The account, photo, readers, and their progress have been removed from this browser.</p><Link className="primary account-link" to="/signup">Create a new account</Link><Link className="account-guest" to="/roles"><BookOpen/> Continue as a guest reader</Link></section>;}

export function AccountLink(){const {account}=useAccount();return <Link className="account-settings-link" to="/account"><span className="account-mini-avatar">{account?.photo?<img src={account.photo} alt=""/>:<UserRound size={22}/>}</span><span><strong>{account?.name??'Guest reader'}</strong><small>{account?'Manage account & photo':'Log in or create an account'}</small></span><span aria-hidden="true">→</span></Link>;}

import './accounts.css';
import {useId,useRef,useState,type FormEvent} from 'react';
import {Link,Navigate,useNavigate} from 'react-router-dom';
import {ArrowLeft,BookOpen,Camera,Eye,EyeOff,LockKeyhole,LogOut,Mail,ShieldCheck,Trash2,UserRound} from 'lucide-react';
import {Art} from '../components/UI';
import {useAccount} from './context';
import {preparePhoto} from './photo';

function AuthHeader({title}:{title:string}){return <header className="account-header"><Link to="/welcome" aria-label="Back to welcome"><ArrowLeft/></Link><h1>{title}</h1><Art name="mascots/welcome-original" alt=""/></header>;}
function AuthHero({signup=false}:{signup?:boolean}){return <div className="account-hero"><Art name="mascots/welcome-original" alt="Blue owl reading a book" priority/><div><span className="brand">Basa<span>Buddy</span></span><h2>{signup?'A little account. A big reading journey!':'More reading adventures await!'}</h2></div></div>;}
function PasswordField({label='Password',value,onChange,autoComplete='current-password',disabled=false}:{label?:string;value:string;onChange:(value:string)=>void;autoComplete?:string;disabled?:boolean}){
 const id=useId(),[visible,setVisible]=useState(false);
 return <div className="account-field"><label htmlFor={id}>{label}</label><div className="account-input"><LockKeyhole aria-hidden="true"/><input id={id} type={visible?'text':'password'} value={value} onChange={e=>onChange(e.target.value)} autoComplete={autoComplete} required minLength={8} maxLength={128} placeholder={label==='Confirm password'?'Enter your password again':'Enter your password'} disabled={disabled}/><button className="password-toggle" type="button" aria-label={`${visible?'Hide':'Show'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={()=>setVisible(!visible)} disabled={disabled}>{visible?<Eye/>:<EyeOff/>}</button></div></div>;
}

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
 const [busy,setBusy]=useState(false),[photoBusy,setPhotoBusy]=useState(false),[error,setError]=useState(''),[help,setHelp]=useState(false);
 const errorRef=useRef<HTMLParagraphElement>(null);
 if(account)return <Navigate to="/profiles" replace/>;
 async function submit(event:FormEvent){
  event.preventDefault();if(busy||photoBusy)return;setError('');
  if(creating&&password!==confirm){setError('Your passwords do not match. Please enter them again.');return;}
  setBusy(true);
  try{
   if(creating)await signup({name,email,password,photo});else await login(email,password);
   nav('/profiles',{replace:true});
  }catch(error){setError(error instanceof Error?error.message:'Could not open your account. Please try again.');requestAnimationFrame(()=>errorRef.current?.focus());}
  finally{setBusy(false);}
 }
 return <section className="account-screen"><AuthHeader title={creating?'Join BasaBuddy':'Welcome back'}/><AuthHero signup={creating}/><h2 className="account-title">{creating?'Create your parent account':'Log in to your parent account'}</h2><p className="account-local"><ShieldCheck size={16}/> Saved only on this device</p>
  <form className="account-form" onSubmit={event=>void submit(event)}>
   {creating&&<PhotoPicker photo={photo} onChange={setPhoto} disabled={busy} onBusy={setPhotoBusy}/>}
   {creating&&<div className="account-field"><label htmlFor="account-name">Your name</label><div className="account-input"><UserRound aria-hidden="true"/><input id="account-name" value={name} onChange={e=>setName(e.target.value)} autoComplete="nickname" required maxLength={50} placeholder="What should we call you?" disabled={busy}/></div></div>}
   <div className="account-field"><label htmlFor="account-email">Parent email</label><div className="account-input"><Mail aria-hidden="true"/><input id="account-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required maxLength={254} placeholder="parent@example.com" disabled={busy}/></div></div>
   <PasswordField value={password} onChange={setPassword} autoComplete={creating?'new-password':'current-password'} disabled={busy}/>
   {creating&&<><small className="password-help">Use at least 8 characters. Keep your password somewhere safe.</small><PasswordField label="Confirm password" value={confirm} onChange={setConfirm} autoComplete="new-password" disabled={busy}/></>}
   {(error||notice)&&<p ref={errorRef} tabIndex={-1} className="account-error" role="alert">{error||notice}</p>}
   <button type="submit" className="primary account-submit" disabled={busy||photoBusy}>{busy?'Please wait…':creating?'Create account':'Log in'}</button>
  </form>
  {!creating&&<><button className="text-button account-help" type="button" aria-expanded={help} onClick={()=>setHelp(!help)}>Need help logging in?</button>{help&&<p className="account-help-copy">Use the email and password you created in this browser. Device-only accounts cannot send password-reset emails. You can always continue as a guest.</p>}</>}
  <button className="account-guest" type="button" onClick={()=>{logout();nav('/roles');}} disabled={busy}><BookOpen/> Continue as a guest reader</button>
  <p className="account-switch">{creating?'Already have an account?':'New here?'} <Link to={creating?'/login':'/signup'}>{creating?'Log in':'Create a parent account'}</Link></p>
  <p className="account-footnote">Grown-ups handle account details. Little readers can explore as a guest.</p><p className="account-footnote">Accounts, photos, and progress stay in this browser. They do not sync to other devices, and clearing site data removes them.</p>
 </section>;
}

export function AccountScreen(){
 const {account,logout,photo,remove}=useAccount(),nav=useNavigate();
 const [deleting,setDeleting]=useState(false),[password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[busy,setBusy]=useState(false),[photoBusy,setPhotoBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState('');
 const confirmRef=useRef<HTMLInputElement>(null);
 if(!account)return <section className="account-screen"><AuthHeader title="Your account"/><AuthHero/><h2>Reading as a guest</h2><p>Create a parent account to keep your readers and profile photo together on this device.</p><Link className="primary account-link" to="/signup">Create account</Link><Link className="account-guest" to="/login">Log in</Link></section>;
 async function destroy(event:FormEvent){
  event.preventDefault();if(confirmation!=='DELETE'||busy||photoBusy)return;setError('');setBusy(true);
  try{await remove(password);nav('/account-deleted',{replace:true});}
  catch(error){setError(error instanceof Error?error.message:'Could not delete your account. Try again.');}
  finally{setBusy(false);}
 }
 return <section className="account-screen"><AuthHeader title="Your account"/><div className="account-summary"><span className="account-eyebrow">YOUR READING CORNER</span><h2>Hello, {account.name}!</h2><p>{account.email}</p><span className="account-local"><ShieldCheck size={16}/> Device-only account</span></div>
  <PhotoPicker photo={account.photo} disabled={busy} onBusy={setPhotoBusy} onChange={async value=>{await photo(value);setSaved(value?'Your profile photo is saved.':'Your profile photo was removed.');}}/>{saved&&<p role="status" className="account-success">{saved}</p>}
  <Link className="primary account-link" to="/profiles">Choose a reader</Link>
  <button className="account-guest" type="button" disabled={busy||photoBusy} onClick={()=>{logout();nav('/login',{replace:true});}}><LogOut/> Log out</button><p className="account-footnote">Logging out keeps this account’s readers and progress saved on this device. Log in again to continue.</p>
  <section className="account-danger" aria-labelledby="delete-title"><h2 id="delete-title">Delete account</h2><p>This removes your account, photo, readers, and their reading progress from this browser. It cannot be undone.</p>
   {!deleting?<button type="button" className="danger-button" disabled={photoBusy} onClick={()=>{setDeleting(true);setSaved('');requestAnimationFrame(()=>confirmRef.current?.focus());}}><Trash2 size={18}/> Delete my account</button>:
    <form onSubmit={event=>void destroy(event)} className="account-form"><p>Your guest reading progress and other accounts will stay on this device.</p><PasswordField value={password} onChange={setPassword} disabled={busy}/><div className="account-field"><label htmlFor="delete-confirm">Type DELETE to confirm</label><input ref={confirmRef} id="delete-confirm" value={confirmation} onChange={e=>setConfirmation(e.target.value)} required autoComplete="off" disabled={busy}/></div>{error&&<p role="alert" className="account-error">{error}</p>}<button className="danger-button" type="submit" disabled={confirmation!=='DELETE'||!password||busy||photoBusy}>{busy?'Deleting…':'Permanently delete account'}</button><button className="text-button" type="button" disabled={busy} onClick={()=>{setDeleting(false);setPassword('');setConfirmation('');setError('');}}>Keep my account</button></form>}
  </section><p className="account-footnote">Local accounts provide separate reading spaces on this browser. They are not a secure boundary for people who can access this device or its browser data.</p>
 </section>;
}

export function AccountDeleted(){return <section className="account-screen"><AuthHeader title="Account deleted"/><Art name="mascots/welcome-original" className="account-goodbye" alt="BasaBuddy owl"/><h2>Your account has been deleted.</h2><p>The account, photo, readers, and their progress have been removed from this browser.</p><Link className="primary account-link" to="/signup">Create a new account</Link><Link className="account-guest" to="/roles"><BookOpen/> Continue as a guest reader</Link></section>;}

export function AccountLink(){const {account}=useAccount();return <Link className="account-settings-link" to="/account"><span className="account-mini-avatar">{account?.photo?<img src={account.photo} alt=""/>:<UserRound size={22}/>}</span><span><strong>{account?.name??'Guest reader'}</strong><small>{account?'Manage account & photo':'Log in or create an account'}</small></span><span aria-hidden="true">→</span></Link>;}

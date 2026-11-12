import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {createAccount,authenticate,deleteAccount,findAccount,saveAccountPhoto,type LocalAccount} from './repository';
import {stopPlayback} from '../audio/playback';

const SESSION='basabuddy:account-session';
interface AccountContext {
 account:LocalAccount|null; ready:boolean; notice:string;
 signup:(input:{name:string;email:string;password:string;photo?:string})=>Promise<void>;
 login:(email:string,password:string)=>Promise<void>;
 logout:()=>void;
 photo:(photo?:string)=>Promise<void>;
 remove:(password:string)=>Promise<void>;
}
const Context=createContext<AccountContext|null>(null);
export function AccountProvider({children}:{children:ReactNode}){
 const [account,setAccount]=useState<LocalAccount|null>(null);
 const [ready,setReady]=useState(false);
 const [notice,setNotice]=useState('');
 useEffect(()=>{
  let active=true;
  void(async()=>{
   try{
    const id=sessionStorage.getItem(SESSION);
    if(id){const restored=await findAccount(id);if(active)setAccount(restored??null);if(!restored)sessionStorage.removeItem(SESSION);}
   }catch{if(active)setNotice('Your account could not be restored. Guest reading is still available.');}
   finally{if(active)setReady(true);}
  })();
  return()=>{active=false;};
 },[]);
 useEffect(()=>{
  if(!account)return;
  let active=true;
  const refresh=()=>{void findAccount(account.id).then(current=>{
   if(!active)return;
   if(!current){sessionStorage.removeItem(SESSION);stopPlayback();setAccount(null);setNotice('This account was deleted in another tab.');}
   else setAccount(current);
  }).catch(()=>{});};
  window.addEventListener('focus',refresh);
  const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('basabuddy:account-events'):null;
  if(channel)channel.onmessage=refresh;
  return()=>{active=false;window.removeEventListener('focus',refresh);channel?.close();};
 },[account?.id]);
 function activate(next:LocalAccount){sessionStorage.setItem(SESSION,next.id);stopPlayback();setNotice('');setAccount(next);}
 function logout(){sessionStorage.removeItem(SESSION);stopPlayback();setAccount(null);setNotice('');}
 return <Context.Provider value={{account,ready,notice,
  signup:async input=>{activate(await createAccount(input));},
  login:async(email,password)=>{activate(await authenticate(email,password));},
  logout,
  photo:async value=>{if(!account)throw new Error('Log in before adding a photo.');const next=await saveAccountPhoto(account.id,value);setAccount(current=>current?.id===next.id?next:current);},
  remove:async password=>{
   if(!account)throw new Error('Log in before deleting an account.');
   await deleteAccount(account.id,password);logout();
   if(typeof BroadcastChannel!=='undefined'){const channel=new BroadcastChannel('basabuddy:account-events');channel.postMessage('deleted');channel.close();}
  },
 }}>{children}</Context.Provider>;
}
export function useAccount(){const value=useContext(Context);if(!value)throw new Error('Account context is missing.');return value;}

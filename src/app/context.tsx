import {createContext,useContext,useState,useEffect,type ReactNode} from 'react';
import type {Store} from '../domain/model';
import {LocalRepository,emptyStore,STORAGE_KEY} from '../data/repository';
const Context=createContext<null|{data:Store;update:(f:(d:Store)=>Store)=>void;error:string;recover:()=>void}>(null);
export function Provider({children,storageKey=STORAGE_KEY}:{children:ReactNode;storageKey?:string}){
 const [repo]=useState(()=>new LocalRepository(storageKey));
 const [initial]=useState(()=>{try{return {data:repo.load(),error:''};}catch(e){return {data:emptyStore(),error:String(e)};}});
 const [data,setData]=useState(initial.data);useEffect(()=>{document.documentElement.lang=data.language==='fil'?'fil':'en';},[data.language]);const [error,setError]=useState(initial.error);const [corrupt,setCorrupt]=useState(!!initial.error);
 function update(f:(d:Store)=>Store){setData(prev=>{const next=f(prev);if(!corrupt)try{repo.save(next);setError('');}catch{setError('Progress could not be saved. Free browser storage, then try again. Keep this tab open.');}return next;});}
 return <Context.Provider value={{data,update,error,recover:()=>{try{if(corrupt){repo.clear();setData(emptyStore());setCorrupt(false);}else repo.save(data);setError('');}catch{setError('Browser storage is unavailable. Enable site storage to save progress.');}}}}>{children}</Context.Provider>;
}
export function useApp(){return useContext(Context)!;}

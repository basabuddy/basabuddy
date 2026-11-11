import type {ReactNode} from 'react';
import {ArrowLeft,Home,BookOpen,Map,Star} from 'lucide-react';
import {NavLink,useNavigate} from 'react-router-dom';
import assets from '../data/assets.json';
import {useApp} from '../app/context';
import {studentNavigation} from '../app/navigation';
const descriptions:Record<string,string>={owl:'A friendly blue owl reading a book',apple:'A red apple with a green leaf',bird:'A little bird',rabbit:'A rabbit with long ears',turtle:'A turtle with a rounded shell',penguin:'A black and white penguin',cat:'A friendly cat',dog:'A friendly dog',story:'Ana reading beside her cat',child:'A child reading aloud',student:'A student ready to read',teacher:'A friendly teacher',puzzle:'Reading puzzle pieces',sentence:'Sentence building illustration',celebrate:'Friends celebrating reading'};
const artAliases:Record<string,string>={owl:'mascots/reading',student:'characters/student',child:'characters/reader',apple:'objects/apple'};
const assetMap:Record<string,{src:string;width:number;height:number;revision:string;variants?:{src:string;width:number;revision:string}[]}>=assets;
const imageUrl=(asset:{src:string;revision:string})=>`${asset.src}?v=${asset.revision}`;
export function Art({name,alt=descriptions[name]??'',className='',priority=false}:{name:string;alt?:string;className?:string;priority?:boolean}){
 const asset=assetMap[artAliases[name]??name];
 return <img className={`art ${className}`} src={asset?imageUrl(asset):`/assets/${name}.webp`} srcSet={asset?.variants?.map(v=>`${imageUrl(v)} ${v.width}w`).join(', ')} sizes={asset?.variants?'(max-width: 350px) 155px, (max-width: 850px) 174px, 280px':undefined} width={asset?.width} height={asset?.height} alt={alt} decoding="async" loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'}/>;
}
export function Brand(){return <Art name="logos/wordmark" alt="BasaBuddy — Read, Learn, Play, Grow" className="brand-logo" priority/>;}
export function Button({children,onClick,disabled=false,secondary=false,type='button'}:{children:ReactNode;onClick?:()=>void;disabled?:boolean;secondary?:boolean;type?:'button'|'submit'}){return <button type={type} className={secondary?'soft primary':'primary'} disabled={disabled} onClick={onClick}>{children}</button>;}
export function Header({title,back='/student/home'}:{title:string;back?:string}){const nav=useNavigate();return <header className="page-header"><button aria-label="Back" className="icon-btn" onClick={()=>nav(back)}><ArrowLeft size={21}/></button><h1>{title}</h1><span className="header-spacer"/></header>;}
export function LanguageSwitch(){const {data,update}=useApp();return <div className="language" aria-label="Reading language">{(['fil','en'] as const).map(lang=><button key={lang} className={data.language===lang?'active':''} aria-pressed={data.language===lang} onClick={()=>update(d=>({...d,language:lang}))}>{lang==='fil'?'Filipino':'English'}</button>)}</div>;}
export function Tabs(){const {data}=useApp();const icons={home:Home,levels:Map,stories:BookOpen,journey:Star};return <nav className="tabs" aria-label="Student navigation">{studentNavigation.map(item=>{const Icon=icons[item.path];return <NavLink key={item.path} to={`/student/${item.path}`}><Icon size={21}/><span>{data.language==='fil'?item.fil:item.label}</span></NavLink>;})}</nav>;}
export function ProgressBar({value,label}:{value:number;label:string}){return <div className="progress" role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${Math.min(100,Math.max(0,value))}%`}}/></div>;}

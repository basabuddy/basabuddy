import type {ReactNode} from 'react';
// UI state only. No client flag, PIN or persisted value grants a paid entitlement.
// Future protected content must be fetched from an authenticated, authorized server.
export type PremiumAccess = {status:'unconfigured'} | {status:'loading'} | {status:'unavailable';reason:string};
export function PremiumBadge(){return <span className="premium-badge">✦ Premium preview</span>;}
export function PremiumAccessNotice({access={status:'unconfigured'},children}:{access?:PremiumAccess;children?:ReactNode}){
 return <section className="premium-preview"><PremiumBadge/><h2>More ways to grow</h2>{access.status==='loading'?<p role="status">Checking availability…</p>:<p>{access.status==='unavailable'?access.reason:'Personalized paths and offline packs are planned. These features are coming soon.'}</p>}{children}<small>Current lessons and games are available to explore. No purchase needed here.</small></section>;
}

import {accountStorageKey} from '../data/repository';

export interface LocalAccount {id:string; name:string; email:string; grade:string; photo?:string; createdAt:string}
export interface AccountDetailsInput {name:string;email:string;grade:string;currentPassword?:string;newPassword?:string}
interface AccountRecord extends LocalAccount {salt:number[]; verifier:number[]; iterations:number}
const DATABASE='basabuddy-accounts';
const ITERATIONS=310000;
let database:Promise<IDBDatabase>|undefined;

function openDatabase():Promise<IDBDatabase> {
 if(database)return database;
 database=new Promise<IDBDatabase>((resolve,reject)=>{
  const request=indexedDB.open(DATABASE,1);
  request.onupgradeneeded=()=>{
   const store=request.result.createObjectStore('accounts',{keyPath:'id'});
   store.createIndex('email','email',{unique:true});
  };
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(new Error('Account storage is unavailable. Allow site storage and try again.'));
  request.onblocked=()=>reject(new Error('Close other BasaBuddy tabs and try again.'));
 }).catch(error=>{database=undefined;throw error;});
 return database;
}

async function readRecord(key:string,byEmail=false):Promise<AccountRecord|undefined> {
 const db=await openDatabase();
 return new Promise((resolve,reject)=>{
  const transaction=db.transaction('accounts','readonly');
  const store=transaction.objectStore('accounts');
  const request=byEmail?store.index('email').get(key):store.get(key);
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(new Error('Could not read this account. Please try again.'));
 });
}

async function writeRecord(record:AccountRecord,create=false) {
 const db=await openDatabase();
 await new Promise<void>((resolve,reject)=>{
  const transaction=db.transaction('accounts','readwrite');
  const store=transaction.objectStore('accounts');
  if(create)store.add(record);else store.put(record);
  transaction.oncomplete=()=>resolve();
  transaction.onabort=()=>reject(new Error(transaction.error?.name==='ConstraintError'
   ? 'An account with this email already exists on this device. Log in instead.'
   : 'Could not save your account. Free some browser storage and try again.'));
  transaction.onerror=()=>{};
 });
}

function publicAccount({salt:_salt,verifier:_verifier,iterations:_iterations,...account}:AccountRecord):LocalAccount{return {...account,grade:account.grade??'1'};}
const normalizeEmail=(email:string)=>email.trim().toLowerCase();
function validateDetails(name:string,email:string,grade:string){
 if(!name||name.length>50)throw new Error('Enter a name of up to 50 characters.');
 if(email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Enter a valid parent email address.');
 if(!['1','2','3'].includes(grade))throw new Error('Choose Grade 1, 2, or 3.');
}
function validatePassword(password:string){if(password.length<8||password.length>128)throw new Error('Use a password between 8 and 128 characters.');}
function validatePhoto(photo?:string){if(photo&&(!photo.startsWith('data:image/jpeg;base64,')||photo.length>200000))throw new Error('Please choose your photo again.');}

async function derivePassword(password:string,salt:number[],iterations:number):Promise<number[]> {
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new Uint8Array(salt),iterations},material,256);
 return Array.from(new Uint8Array(bits));
}
async function checkPassword(record:AccountRecord,password:string){
 if(password.length>128)return false;
 const actual=await derivePassword(password,record.salt,record.iterations);
 let difference=0;
 for(let i=0;i<actual.length;i++)difference|=actual[i]^record.verifier[i];
 return difference===0;
}

export async function findAccount(id:string):Promise<LocalAccount|undefined>{const record=await readRecord(id);return record?publicAccount(record):undefined;}

export async function createAccount(input:{name:string;email:string;password:string;grade?:string;photo?:string}):Promise<LocalAccount>{
 const name=input.name.trim(),email=normalizeEmail(input.email),grade=input.grade??'1';
 validateDetails(name,email,grade);
 validatePassword(input.password);validatePhoto(input.photo);
 const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)));
 const record:AccountRecord={id:crypto.randomUUID(),name,email,grade,photo:input.photo,createdAt:new Date().toISOString(),salt,
  verifier:await derivePassword(input.password,salt,ITERATIONS),iterations:ITERATIONS};
 await writeRecord(record,true);
 return publicAccount(record);
}

export async function authenticate(email:string,password:string):Promise<LocalAccount>{
 const record=await readRecord(normalizeEmail(email),true);
 if(!record||!await checkPassword(record,password))throw new Error('Email or password is incorrect. Use an account created on this device.');
 return publicAccount(record);
}

export async function saveAccountDetails(id:string,input:AccountDetailsInput):Promise<LocalAccount>{
 const name=input.name.trim(),email=normalizeEmail(input.email),grade=input.grade;
 validateDetails(name,email,grade);
 const record=await readRecord(id);
 if(!record)throw new Error('This account no longer exists. Please log in again.');
 const sensitive=email!==record.email||!!input.newPassword;
 if(sensitive&&(!input.currentPassword||!await checkPassword(record,input.currentPassword)))throw new Error('Enter your correct current password to change your email or password.');
 let credentials:Pick<AccountRecord,'salt'|'verifier'|'iterations'>|undefined;
 if(input.newPassword){
  validatePassword(input.newPassword);
  const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)));
  credentials={salt,verifier:await derivePassword(input.newPassword,salt,ITERATIONS),iterations:ITERATIONS};
 }
 const db=await openDatabase();
 return new Promise((resolve,reject)=>{
  const transaction=db.transaction('accounts','readwrite'),store=transaction.objectStore('accounts');
  let next:AccountRecord|undefined,error='';
  const request=store.get(id);
  request.onsuccess=()=>{
   const current=request.result as AccountRecord|undefined;
   if(!current){error='This account no longer exists. Please log in again.';transaction.abort();return;}
   if(current.email!==record.email||JSON.stringify(current.verifier)!==JSON.stringify(record.verifier)){
    error='Your account changed in another tab. Reload this page before trying again.';transaction.abort();return;
   }
   next={...current,name,email,grade,...credentials};store.put(next);
  };
  transaction.oncomplete=()=>resolve(publicAccount(next!));
  transaction.onabort=()=>reject(new Error(error||(transaction.error?.name==='ConstraintError'
   ?'Another account on this device already uses that email. Choose a different email.'
   :'Could not save your account details. Please try again.')));
  transaction.onerror=()=>{};
 });
}

export async function saveAccountPhoto(id:string,photo?:string):Promise<LocalAccount>{
 validatePhoto(photo);
 const db=await openDatabase();
 return new Promise((resolve,reject)=>{
  const transaction=db.transaction('accounts','readwrite');
  const store=transaction.objectStore('accounts');
  let next:AccountRecord|undefined;
  let missing=false;
  const request=store.get(id);
  request.onsuccess=()=>{
   const record=request.result as AccountRecord|undefined;
   if(!record){missing=true;transaction.abort();return;}
   next={...record,photo};store.put(next);
  };
  transaction.oncomplete=()=>resolve(publicAccount(next!));
  transaction.onabort=()=>reject(new Error(missing?'This account no longer exists. Please log in again.':'Could not save your photo. Please try again.'));
  transaction.onerror=()=>{};
 });
}

export async function deleteAccount(id:string,password:string):Promise<void>{
 const record=await readRecord(id);
 if(!record||!await checkPassword(record,password))throw new Error('The password is incorrect. Your account has not been deleted.');
 // Remove only this account's reader data. Guest data and other accounts stay intact.
 localStorage.removeItem(accountStorageKey(id));
 const db=await openDatabase();
 await new Promise<void>((resolve,reject)=>{
  const transaction=db.transaction('accounts','readwrite');
  transaction.objectStore('accounts').delete(id);
  transaction.oncomplete=()=>resolve();
  transaction.onabort=()=>reject(new Error('Could not finish deleting the account. Please try again.'));
  transaction.onerror=()=>{};
 });
}

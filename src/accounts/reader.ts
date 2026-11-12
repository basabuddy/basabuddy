import {LocalRepository,accountStorageKey} from '../data/repository';
import type {LocalAccount} from './repository';

// Initialize once, including older accounts that never finished adding a reader.
// Loading through the repository preserves existing data and its recovery checks.
export function ensureAccountReader(account:LocalAccount){
 const repository=new LocalRepository(accountStorageKey(account.id));
 const data=repository.load();
 if(data.profiles.length===0){
  const reader={id:account.id,name:account.name,grade:account.grade};
  repository.save({...data,profiles:[reader],activeId:reader.id});
 }else if(!data.profiles.some(reader=>reader.id===data.activeId)){
  repository.save({...data,activeId:data.profiles[0].id});
 }
}

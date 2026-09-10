import {useEffect,useRef,useState} from 'react';
import {empty,WorkspaceData,ServiceRecord,ServiceSummary,ServiceVersion} from './workspace-model';

export function useServiceStorage(){
 const api=window.faithDesktop!;
 const [data,setData]=useState<WorkspaceData>(empty);const [ready,setReady]=useState(false);const [dirty,setDirty]=useState(false);const [busy,setBusy]=useState(false);const [switching,setSwitching]=useState(false);
 const [notice,setNotice]=useState('');const [error,setError]=useState('');const [serviceId,setServiceId]=useState('');const [generation,setGeneration]=useState(0);
 const [services,setServices]=useState<ServiceSummary[]>([]);const [versions,setVersions]=useState<ServiceVersion[]|null>(null);const [lastSaved,setLastSaved]=useState('');const [migration,setMigration]=useState('');const [autosave,setAutosave]=useState(true);
 const current=useRef({id:'',version:0,data:empty(),revision:0,dirty:false});const queue=useRef<Promise<void>>(Promise.resolve());const transitioning=useRef(false);
 function accept(record:ServiceRecord){current.current={id:record.id,version:record.version,data:record.data,revision:0,dirty:false};setData(record.data);setServiceId(record.id);setDirty(false);setLastSaved(record.updatedAt);setGeneration(x=>x+1);setVersions(null);}
 useEffect(()=>{api.bootstrap().then(result=>{accept(result.active);setServices(result.services);setReady(true);if(result.migratedNow)setMigration('Your Phase 2 draft was imported into the database. The original JSON files were kept.');}).catch(e=>setError(String(e.message||e)));},[]);
 function update(value:WorkspaceData){if(transitioning.current)return;current.current={...current.current,data:value,revision:current.current.revision+1,dirty:true};setData(value);setDirty(true);setNotice('');}
 // Each queued task reads the latest document when it starts. Edits made during
 // an IPC save keep their dirty flag and are sent by the next task, never lost.
 function persist(){
  const job=queue.current.catch(()=>{}).then(async()=>{
   const source=current.current;if(!source.id||!source.dirty)return;
   const snapshot=structuredClone(source);setBusy(true);
   try{
    const record=await api.saveService(snapshot.id,snapshot.version,snapshot.data);
    if(current.current.id===snapshot.id){current.current.version=record.version;if(current.current.revision===snapshot.revision){current.current.dirty=false;setDirty(false);}setLastSaved(record.updatedAt);setError('');setServices(rows=>rows.map(row=>row.id===record.id?{...row,title:record.data.title,version:record.version,updatedAt:record.updatedAt,itemCount:record.data.items.length,slideCount:record.data.items.reduce((sum,item)=>sum+item.slides.length,0)}:row));}
   }catch(e){setError('Save failed. Your edits are still in the editor. '+String(e));throw e;}finally{setBusy(false);}
  });queue.current=job;return job;
 }
 useEffect(()=>{if(!ready||!dirty||!autosave||switching)return;const timer=setTimeout(()=>{void persist().catch(()=>{});},900);return ()=>clearTimeout(timer);},[data,ready,dirty,autosave,switching]);
 useEffect(()=>{const handler=(event:BeforeUnloadEvent)=>{if(current.current.dirty){event.preventDefault();event.returnValue='Changes are still saving. Keep editing and wait for Saved.';}};window.addEventListener('beforeunload',handler);return ()=>window.removeEventListener('beforeunload',handler);},[]);
 async function save(){try{await persist();setNotice(current.current.dirty?'Earlier changes saved; newer edits are still waiting to save.':'Service saved to the local database.');}catch{}}
 async function transition(action:()=>Promise<void>){if(transitioning.current)return;transitioning.current=true;setSwitching(true);setError('');try{await persist();await action();setServices(await api.listServices());}catch(e){setError(String(e));}finally{transitioning.current=false;setSwitching(false);}}
 const open=(id:string)=>transition(async()=>{accept(await api.openService(id));setNotice('Service opened.');});
 const create=(title:string)=>transition(async()=>{accept(await api.createService(title.trim()||'Untitled service'));setNotice('New service created.');});
 const duplicate=()=>transition(async()=>{accept(await api.duplicateService(current.current.id));setNotice('Independent service copy created.');});
 const trash=(id:string)=>transition(async()=>{await api.trashService(id);if(current.current.id===id)accept((await api.bootstrap()).active);setNotice('Service moved to the recycle bin. You can restore it.');});
 const restore=(id:string)=>transition(async()=>{await api.restoreService(id);accept(await api.openService(id));setNotice('Service restored and opened.');});
 const history=()=>transition(async()=>{setVersions(await api.serviceHistory(current.current.id));});
 const restoreVersion=(version:number)=>transition(async()=>{accept(await api.restoreVersion(current.current.id,version,current.current.version));setNotice('Earlier version restored. The previous content remains in saved-version history.');});
 const backup=()=>transition(async()=>{const result=await api.backupDatabase();setNotice('Database backup created: '+result.filename);});
 async function openBackups(){try{await api.openBackups();}catch(e){setError(String(e));}}
 async function refresh(){try{setServices(await api.listServices());}catch(e){setError(String(e));}}
 return {data,ready,dirty,busy,switching,notice,error,serviceId,generation,services,versions,lastSaved,migration,autosave,setAutosave,update,save,open,create,duplicate,trash,restore,history,restoreVersion,backup,openBackups,refresh};
}

import {useEffect,useState} from 'react';
import type {LiveState} from './live-types';
export function useLive(){
 const api=window.faithDesktop!;const [state,setState]=useState<LiveState|null>(null);const [error,setError]=useState('');const [screens,setScreens]=useState<Display[]>([]);const [displayId,setDisplayId]=useState('');
 const accept=(next:LiveState)=>setState(old=>old&&old.sequence>next.sequence?old:next);
 useEffect(()=>{let active=true;const receive=(next:LiveState)=>{if(active)accept(next);};const off=api.onLiveState(receive);void api.liveState().then(receive).catch(e=>setError(String(e)));const refresh=()=>api.displays().then(d=>{if(active)setScreens(d);}).catch(e=>setError(String(e)));void refresh();void api.readSettings().then(s=>{if(active&&s.displayId!==null)setDisplayId(String(s.displayId));}).catch(e=>setError(String(e)));const offDisplays=api.onDisplaysChanged(()=>void refresh());return()=>{active=false;off();offDisplays();};},[]);
 async function run(action:()=>Promise<LiveState>){setError('');try{accept(await action());}catch(e){setError(String(e));}}
 return {state,error,screens,displayId,setDisplayId,open:()=>run(()=>api.openLive(Number(displayId))),stop:()=>run(()=>api.stopLive()),command:(action:string,value?:unknown)=>run(()=>api.liveCommand(action,value))};
}

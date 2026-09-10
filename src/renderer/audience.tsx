import React,{useEffect,useLayoutEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import SlideSurface from './SlideSurface';
import type {LiveState} from './live-types';
function Audience(){const [state,setState]=useState<LiveState|null>(null);
 useEffect(()=>{const api=window.faithAudience;if(!api)return;const accept=(next:LiveState)=>setState(old=>old&&old.sequence>next.sequence?old:next);const off=api.onState(accept);void api.getState().then(accept).catch(()=>{});return off;},[]);
 useLayoutEffect(()=>{if(!state)return;const id=requestAnimationFrame(()=>void window.faithAudience?.acknowledge(state.revision).catch(()=>{}));return()=>cancelAnimationFrame(id);},[state?.revision]);
 return <SlideSurface frameKey={state?.revision} audible onEnded={position=>{const id=state?.slide?.presentation?.media?.id;if(id&&state?.playback)void window.faithAudience?.reportMediaEnded?.(id,state.playback.at,position).catch(()=>{});}} slide={state?.slide||null} mode={state?.mode} church={state?.church} playback={state?.playback} blackout={!state||state.blackout} onProgress={(_t,_d,error)=>{const id=state?.slide?.presentation?.media?.id;if(error&&id)void window.faithAudience?.reportMediaError?.(id).catch(()=>{});}}/>;
}createRoot(document.getElementById('root')!).render(<Audience/>);

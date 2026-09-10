import React,{useEffect,useMemo,useState}from'react';
import type{Item}from'./workspace-model';import type{LiveState}from'./live-types';import type{StreamState}from'./stream-types';
import{runTargets,summary,type TargetResult}from'./production-control.mjs';import{buildCueQueue,showShortcut}from'./cue-queue.mjs';import'./run-show.css';import'./run-show-fix.css';
function CueQueuePanel({items,selectedId,onSelect,serviceId,serviceTitle,audience}:{items:Item[];selectedId:string;onSelect:(itemId:string,slideId:string)=>void;serviceId:string;serviceTitle:string;audience:LiveState|null}){
 const api=window.faithDesktop!,cues=useMemo(()=>buildCueQueue(items),[items]);const[cursor,setCursor]=useState(0),[done,setDone]=useState<Set<string>>(new Set()),[stream,setStream]=useState<StreamState|null>(null),[busy,setBusy]=useState(false),[armed,setArmed]=useState(false),[report,setReport]=useState<{text:string;details:TargetResult[]}|null>(null);
 const[startedAt,setStartedAt]=useState<number|null>(null),[elapsedBase,setElapsedBase]=useState(0),[clockNow,setClockNow]=useState(Date.now());
 useEffect(()=>{const index=cues.findIndex(c=>c.id===selectedId);if(index>=0)setCursor(index);},[selectedId,cues]);
 useEffect(()=>{let active=true;if(!api.streamState||!api.onStreamState)return;void api.streamState().then(s=>active&&setStream(s));const off=api.onStreamState(s=>active&&setStream(s));return()=>{active=false;off();};},[]);
 const current=cues[cursor]||null,next=cues[cursor+1]||null,audienceReady=audience?.status==='ready',streamReady=stream?.status==='ready';
 function choose(index:number){const cue=cues[index];if(!cue)return;setCursor(index);onSelect(cue.itemId,cue.id);}
 async function go(){if(!current||busy||(!audienceReady&&!streamReady))return;setBusy(true);try{const payload={slide:current.slide,serviceId,serviceTitle},details=await runTargets([{target:'Audience',ready:Boolean(audienceReady),action:()=>api.liveCommand('take',payload)},{target:'Stream',ready:Boolean(streamReady),action:()=>api.streamCommand('take',payload)}]);setReport({text:summary(details),details});if(details.some(d=>d.status==='succeeded')){if(startedAt===null&&elapsedBase===0)setStartedAt(Date.now());setDone(old=>new Set(old).add(current.id));if(next)choose(cursor+1);}}finally{setBusy(false);}}
 useEffect(()=>{const handler=(event:KeyboardEvent)=>{if(showShortcut(event,armed)&&!busy&&current&&(audienceReady||streamReady)){event.preventDefault();void go();}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[armed,busy,current,audienceReady,streamReady]);
 useEffect(()=>{if(startedAt===null)return;const timer=window.setInterval(()=>setClockNow(Date.now()),250);return()=>window.clearInterval(timer);},[startedAt]);
 const elapsed=elapsedBase+(startedAt===null?0:Math.max(0,clockNow-startedAt));
 const clock=`${String(Math.floor(elapsed/3600000)).padStart(2,'0')}:${String(Math.floor(elapsed/60000)%60).padStart(2,'0')}:${String(Math.floor(elapsed/1000)%60).padStart(2,'0')}`;
 function toggleClock(){if(startedAt===null){const now=Date.now();setClockNow(now);setStartedAt(now);}else{setElapsedBase(value=>value+Math.max(0,Date.now()-startedAt));setStartedAt(null);}}
 return <div className="run-show"><header><div><small>PHASE 16 · LIVE SERVICE DASHBOARD</small><h2>Service cue queue</h2><p>GO publishes the current cue, records its result, then advances Preview. Stage remains independent.</p></div><strong>{done.size}/{cues.length} COMPLETE</strong></header><section className="service-dashboard" aria-label="Live service dashboard"><div><small>SESSION</small><strong>{clock}</strong><span>{startedAt===null?(elapsed?'PAUSED':'READY'):'RUNNING'}</span></div><div><small>PROGRESS</small><strong>{cues.length?Math.round(done.size/cues.length*100):0}%</strong><span>{done.size} completed</span></div><div><small>REMAINING</small><strong>{Math.max(0,cues.length-done.size)}</strong><span>of {cues.length} cues</span></div><div className="dashboard-actions"><button onClick={toggleClock}>{startedAt===null?(elapsed?'Resume clock':'Start clock'):'Pause clock'}</button><button disabled={!elapsed} onClick={()=>{setStartedAt(null);setElapsedBase(0);setClockNow(Date.now());}}>Reset clock</button></div></section><style>{`.service-dashboard{display:grid;grid-template-columns:repeat(3,minmax(110px,1fr)) auto;gap:8px;margin:0 0 12px}.service-dashboard>div{display:grid;gap:2px;padding:9px 11px;background:#303030;border:1px solid #505050;border-radius:3px}.service-dashboard small{color:#cba36d;font-size:8px;letter-spacing:.12em}.service-dashboard strong{font-size:18px;font-variant-numeric:tabular-nums}.service-dashboard span{font-size:9px;color:#aaa}.service-dashboard .dashboard-actions{display:flex;align-items:center;gap:5px}.service-dashboard button{padding:7px;background:#494949;color:#fff;border:1px solid #666;border-radius:3px}@media(max-width:1050px){.service-dashboard{grid-template-columns:repeat(3,1fr)}.service-dashboard .dashboard-actions{grid-column:1/-1}}`}</style><div className="run-show-grid"><section className="cue-list"><div className="cue-list-head"><span>#</span><span>Cue</span><span>Transition</span><span>Status</span></div>{cues.map((cue,index)=><button key={cue.id} className={index===cursor?'current':''} onClick={()=>choose(index)}><span>{String(cue.number).padStart(2,'0')}</span><span><b>{cue.label}</b><small>{cue.itemTitle} · Slide {cue.slideIndex+1}</small></span><span>{cue.transition.kind==='fade'?`Fade ${cue.transition.duration}ms`:'Cut'}</span><span>{done.has(cue.id)?'DONE':index===cursor?'READY':''}</span></button>)}{!cues.length&&<p>No cues. Add slides to this service first.</p>}</section><aside><div className="now-next"><small>CURRENT CUE</small><strong>{current?.label||'No cue'}</strong><span>{current?.itemTitle||'—'}</span><small>NEXT CUE</small><strong>{next?.label||'End of service'}</strong><span>{next?.itemTitle||'—'}</span></div><button className="show-go" disabled={!current||busy||(!audienceReady&&!streamReady)} onClick={()=>void go()}>{busy?'SENDING…':'GO'}<small>Audience + Stream</small></button><div className="show-nav"><button disabled={cursor===0} onClick={()=>choose(cursor-1)}>← Previous cue</button><button disabled={!next} onClick={()=>choose(cursor+1)}>Next cue →</button></div><label className="space-arm"><input type="checkbox" checked={armed} onChange={e=>setArmed(e.target.checked)}/> Arm Spacebar GO</label><p className={armed?'armed':'safe'}>{armed?'ARMED · Spacebar sends GO outside editors.':'SAFE · Spacebar GO is disabled.'}</p>{report&&<div className="cue-report"><strong>{report.text}</strong>{report.details.map(d=><span className={`result-${d.status}`} key={d.target}>{d.target}: {d.message}</span>)}</div>}<button onClick={()=>{setDone(new Set());setReport(null);choose(0);}} disabled={!cues.length}>Reset rehearsal progress</button></aside></div></div>;
}

type ShowProps = Parameters<typeof CueQueuePanel>[0];
type Finding = {label:string; itemId:string; slideId?:string};
const rehearsalChecks = [
 'Database and media backup checked',
 'Audience display and safe margins checked physically',
 'Sound and video playback rehearsed',
 'Stage / streaming destinations checked, or not required',
];

function Preflight({items,serviceTitle,audience,onSelect}:ShowProps) {
 const [media,setMedia]=useState<import('./workspace-model').Media[]|null>(null);
 const [error,setError]=useState(''),[scanning,setScanning]=useState(true),[refresh,setRefresh]=useState(0);
 const [checked,setChecked]=useState<boolean[]>(rehearsalChecks.map(()=>false));
 const [stream,setStream]=useState<StreamState|null>(null),[streamError,setStreamError]=useState('');
 const signature=JSON.stringify(items);
 useEffect(()=>{
  let active=true;setScanning(true);setMedia(null);setError('');setChecked(rehearsalChecks.map(()=>false));
  Promise.resolve().then(()=>window.faithDesktop!.listMedia()).then(result=>{if(active)setMedia(result);}).catch(e=>{if(active)setError(String(e));}).finally(()=>{if(active)setScanning(false);});
  return()=>{active=false;};
 },[signature,refresh]);
 useEffect(()=>{
  let active=true;const api=window.faithDesktop!;
  const off=api.onStreamState?.(value=>{if(active){setStream(value);setStreamError('');}});
  Promise.resolve().then(()=>api.streamState()).then(value=>{if(active)setStream(value);}).catch(e=>{if(active)setStreamError(String(e));});
  return()=>{active=false;off?.();};
 },[]);
 const findings:Finding[]=[];
 let slideCount=0;const referenced=new Set<string>();
 for(const item of items){
  if(!item.slides.length)findings.push({label:`${item.title}: empty service item`,itemId:item.id});
  for(const slide of item.slides){
   slideCount++;const ref=slide.presentation?.media;
   if(!slide.text.trim()&&!ref)findings.push({label:`${item.title}, slide ${item.slides.indexOf(slide)+1}: blank slide (may be intentional)`,itemId:item.id,slideId:slide.id});
   if(ref){
    referenced.add(ref.id);const file=media?.find(m=>m.id===ref.id);
    if(media&&(!file||file.missing||file.kind!==ref.kind))findings.push({label:`${item.title}, slide ${item.slides.indexOf(slide)+1}: media missing or type mismatch`,itemId:item.id,slideId:slide.id});
   }
  }
 }
 if(!slideCount)findings.unshift({label:'This service has no slides to present.',itemId:''});
 const audienceLabel=audience?.status||'unknown',streamLabel=streamError?'unavailable':stream?.status||'unknown';
 const status=scanning?'Checking media…':error?'Media check unavailable':findings.length?`${findings.length} content warning(s)`:'No content warnings found';
 function downloadReport(){
  const lines=['FaithPresenter — Phase 15 Service Preflight',`Service: ${serviceTitle}`,`Checked: ${new Date().toISOString()}`,`${slideCount} slides; ${referenced.size} referenced media files`,status,`Audience: ${audienceLabel}${audience?.windowed?' (windowed test)':''}`,`Stream: ${streamLabel}`,error?`Media error: ${error}`:'',...findings.map(f=>`WARNING: ${f.label}`),'','Operator confirmations (this session):',...rehearsalChecks.map((label,i)=>`${checked[i]?'[x]':'[ ]'} ${label}`),'','This report does not certify physical outputs, codecs, backup integrity or saved service state. Checks do not publish any output.'];
  const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='FaithPresenter-Preflight.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <details className="service-preflight" style={{margin:'10px 12px',padding:12,border:'1px solid #655846',background:'#303030',color:'#eee'}}>
  <summary style={{cursor:'pointer',fontWeight:700,color:'#efbd7e'}}>PHASE 15 · Service preflight — {status}</summary>
  <style>{`.service-preflight button{padding:6px 9px;background:#48433b;color:#fff;border:1px solid #8b7658;border-radius:3px;font:inherit;cursor:pointer}.service-preflight button:disabled{opacity:.45;cursor:default}.service-preflight button:focus-visible{outline:2px solid #ffcb82}.service-preflight button:hover:not(:disabled){background:#65553f}`}</style>
  <p style={{fontSize:12}}>{slideCount} slides · {referenced.size} media references. Read-only checks; nothing is sent Live.</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',fontSize:12}}><span>Audience: {audienceLabel}{audience?.windowed?' · windowed test':''}</span><span>Stream: {streamLabel}</span></div>
  <p style={{fontSize:11}}>“Ready” means the application renderer is ready—not that the projector or broadcast has been physically verified.</p>
  {error&&<p role="alert">Media could not be checked: {error}</p>}
  <ul style={{maxHeight:180,overflow:'auto',paddingLeft:22}}>{findings.map((f,i)=><li key={i} style={{marginBottom:6,fontSize:12}}>{f.label} {f.slideId&&<button onClick={()=>onSelect(f.itemId,f.slideId!)}>Preview flagged slide</button>}</li>)}</ul>
  <fieldset style={{border:'1px solid #555',padding:10}}><legend>Operator rehearsal checklist · {checked.filter(Boolean).length}/{checked.length}</legend>{rehearsalChecks.map((label,i)=><label key={label} style={{display:'flex',alignItems:'center',gap:7,margin:'8px 0',fontSize:12}}><input type="checkbox" checked={checked[i]} onChange={e=>setChecked(old=>old.map((value,n)=>n===i?e.target.checked:value))}/>{label}</label>)}</fieldset>
  <p style={{fontSize:11}}>Confirmations reset when service content changes, you recheck, or you leave Run show. Missing-media checks do not test decoding; rehearse actual files.</p>
  <div style={{display:'flex',gap:8}}><button disabled={scanning} onClick={()=>setRefresh(v=>v+1)}>Recheck service</button><button disabled={scanning} onClick={downloadReport}>Download preflight report</button></div>
 </details>;
}

export default function RunOfShowPanel(props:ShowProps){
 return <React.Fragment key={props.serviceId}><Preflight {...props}/><CueQueuePanel {...props}/></React.Fragment>;
}

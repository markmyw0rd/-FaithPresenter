// Main-process authority. Drafts and the database never mutate this snapshot.
const {presentation}=require('./presentation');
class LiveOutput {
 constructor({createWindow,displays,primary,notify,setTimer=setTimeout,clearTimer=clearTimeout}) {
  this.createWindow=createWindow;this.displays=displays;this.primary=primary;this.notify=notify;this.setTimer=setTimer;this.clearTimer=clearTimer;
  this.showTimer=null;this.showQueue=null;this.advancing=false;this.win=null;this.timer=null;this.state={sequence:0,revision:0,appliedRevision:-1,status:'closed',displayId:null,displayLabel:'',windowed:false,slide:null,serviceId:'',serviceTitle:'',mode:'slide',church:'',blackout:true,message:'Output closed'};
 }
 snapshot(){return structuredClone(this.state);}
 stopShow(){this.clearTimer(this.showTimer);this.showTimer=null;this.showQueue=null;if(this.state.slideshow)this.state.slideshow.running=false;}
 pauseMedia(){const p=this.state.playback;if(p){p.position+=p.playing?Math.max(0,Date.now()-p.at)/1000:0;p.at=Date.now();p.playing=false;}}
 mediaEnded(id,at,position){const p=this.state.playback;if(id!==this.state.slide?.presentation?.media?.id||!p||at!==p.at||p.loop||!Number.isFinite(position)||position<0||position>86400)return;p.playing=false;p.position=position;p.at=Date.now();return this.publish(true);}
 mediaFailed(id){if(typeof id==='string'&&id===this.state.slide?.presentation?.media?.id){this.stopShow();this.pauseMedia();this.state.mediaError='Audience media unavailable or unsupported. Clear/change the background and test before presenting.';this.publish(true);}}
 publish(content=false){this.state.sequence++;if(content)this.state.revision++;this.notify(this.snapshot());if(content&&this.win){this.win.webContents.send('audience:state',this.snapshot());this.watch();}return this.snapshot();}
 watch(){this.clearTimer(this.timer);this.timer=this.setTimer(()=>this.stop('Audience renderer did not respond. Reopen output to retry.','error'),8000);}
 open(id){
  if(this.win)throw Error('Close audience output before changing displays.');
  if(!Number.isInteger(id))throw Error('Choose a connected display.');
  const display=this.displays().find(d=>d.id===id);if(!display)throw Error('That display is no longer connected.');
  const windowed=id===this.primary();
  Object.assign(this.state,{status:'opening',displayId:id,displayLabel:display.label||`Display ${id}`,windowed,slide:null,serviceId:'',serviceTitle:'',mode:'slide',blackout:true,appliedRevision:-1,message:windowed?'Windowed test on primary display':'Audience output opening'});
  let win;try{win=this.createWindow(display,windowed);}catch(error){this.stop(String(error),'error');throw error;}
  this.win=win;
  win.on('closed',()=>{if(this.win===win){this.win=null;this.stop('Audience output closed');}});
  win.on('unresponsive',()=>{if(this.win===win)this.stop('Audience window stopped responding.','error');});
  win.webContents.on('render-process-gone',()=>{if(this.win===win)this.stop('Audience renderer stopped. Reopen output.','error');});
  this.publish(true);
  win.loadURL('faith://audience/audience.html').catch(()=>{if(this.win===win)this.stop('Audience window could not load.','error');});
  return this.snapshot();
 }
 stop(message='Audience output closed',status='closed'){
  this.stopShow();this.clearTimer(this.timer);this.timer=null;const old=this.win;this.win=null;
  Object.assign(this.state,{status,slide:null,serviceId:'',serviceTitle:'',blackout:true,appliedRevision:-1,message});
  if(old&&!old.isDestroyed())old.destroy();return this.publish(true);
 }
 acknowledge(revision){if(!this.win||revision!==this.state.revision||this.state.appliedRevision===revision)return;
  this.clearTimer(this.timer);this.timer=null;this.state.appliedRevision=revision;this.state.status='ready';this.state.message=this.state.windowed?'Windowed test · primary display':'Audience renderer ready';this.publish();
 }
 command(action,value){
  if(!this.win||this.state.status!=='ready')throw Error('Open audience output and wait for Ready first.');
  if(action==='slideshow-start'){
   if(!value||!Array.isArray(value.slides)||!value.slides.length||value.slides.length>100||!Number.isFinite(value.interval)||value.interval<2||value.interval>300||typeof value.loop!=='boolean'||typeof value.serviceId!=='string'||value.serviceId.length>200||typeof value.serviceTitle!=='string'||value.serviceTitle.length>120)throw Error('Choose 1–100 announcement slides and an interval of 2–300 seconds.');
   const slides=value.slides.map(s=>{if(!s||typeof s.id!=='string'||s.id.length>200||typeof s.text!=='string'||s.text.length>2000||!['violet','ocean','forest','plain'].includes(s.theme))throw Error('Invalid announcement slide.');const p=presentation(s.presentation);if(p.media&&p.media.kind!=='image')throw Error('Announcements support images and text only. Remove audio/video from this item.');return {...s,presentation:p};});
   this.stopShow();const queue=structuredClone({...value,slides});this.showQueue=queue;this.state.slideshow={running:true,index:0,total:slides.length,interval:value.interval,loop:value.loop};
   const advance=()=>{if(this.showQueue!==queue||!this.win)return;if(this.state.appliedRevision!==this.state.revision){this.showTimer=this.setTimer(advance,250);return;}const show=this.state.slideshow;let index=show.index+1;if(index>=queue.slides.length){if(!queue.loop){this.stopShow();this.publish();return;}index=0;}show.index=index;this.advancing=true;try{this.command('take',{slide:queue.slides[index],serviceId:queue.serviceId,serviceTitle:queue.serviceTitle});}finally{this.advancing=false;}this.showTimer=this.setTimer(advance,queue.interval*1000);};
   this.advancing=true;try{this.command('take',{slide:slides[0],serviceId:value.serviceId,serviceTitle:value.serviceTitle});}finally{this.advancing=false;}this.showTimer=this.setTimer(advance,value.interval*1000);return this.snapshot();
  }
  if(action==='slideshow-stop'){this.stopShow();return this.publish();}
  if(action==='take'){
   const s=value?.slide;if(!s||typeof s.id!=='string'||s.id.length>200||typeof s.text!=='string'||s.text.length>2000||!['violet','ocean','forest','plain'].includes(s.theme)||typeof value.serviceId!=='string'||value.serviceId.length>200||typeof value.serviceTitle!=='string'||value.serviceTitle.length>120)throw Error('Invalid live slide.');
   const p=presentation(s.presentation);const sameMedia=p.media?.id&&p.media.id===this.state.slide?.presentation?.media?.id;
   if(!this.advancing)this.stopShow();
   Object.assign(this.state,{slide:{id:s.id,text:s.text,theme:s.theme,...(s.presentation?{presentation:p}:{})},serviceId:value.serviceId,serviceTitle:value.serviceTitle,mode:'slide',blackout:false});
   if(!sameMedia){this.state.playback={playing:['video','audio'].includes(p.media?.kind),position:0,at:Date.now(),loop:p.media?.kind!=='audio',volume:1,muted:true};this.state.mediaError='';}
  }else if(action==='transport'){
   if(!['video','audio'].includes(this.state.slide?.presentation?.media?.kind))throw Error('No live audio or video.');
   if(!value||typeof value.playing!=='boolean'||typeof value.loop!=='boolean'||!Number.isFinite(value.position)||value.position<0||value.position>86400)throw Error('Invalid transport command.');
   if(value.volume!==undefined&&(!Number.isFinite(value.volume)||value.volume<0||value.volume>1))throw Error('Volume must be between 0 and 1.');if(value.muted!==undefined&&typeof value.muted!=='boolean')throw Error('Invalid mute state.');
   this.state.playback={playing:value.playing,position:value.position,loop:value.loop,at:Date.now(),volume:value.volume??this.state.playback?.volume??1,muted:value.muted??this.state.playback?.muted??true};
  }else if(action==='clear'){this.stopShow();this.state.mode='clear';}
  else if(action==='church'){if(typeof value!=='string'||value.length>120)throw Error('Invalid church name.');this.stopShow();this.pauseMedia();this.state.church=value;this.state.mode='church';this.state.blackout=false;}
  else if(action==='blackout'){this.stopShow();this.pauseMedia();this.state.blackout=!this.state.blackout;}
  else throw Error('Unknown output action.');
  return this.publish(true);
 }
 displayChanged(id){if(this.win&&id===this.state.displayId)this.stop('Audience display disconnected or changed. Check displays and reopen output.');}
}
module.exports={LiveOutput};

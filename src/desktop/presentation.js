const roles=['verse','chorus','bridge','tag','intro','outro','other'];
const {validateStyle}=require('./style');
function presentation(value){
 if(value===undefined)return {};
 if(!value||typeof value!=='object')throw Error('Invalid slide presentation.');
 const out={};
 if(value.style!==undefined)out.style=validateStyle(value.style);
 for(const [key,max] of [['label',60],['shortcut',1]])if(value[key]!==undefined){if(typeof value[key]!=='string'||value[key].length>max)throw Error('Invalid slide '+key);out[key]=value[key];}
 if(out.shortcut&&!/^[A-Z0-9]$/.test(out.shortcut))throw Error('Shortcut must be A–Z or 0–9.');
 if(value.role!==undefined){if(!roles.includes(value.role))throw Error('Invalid section colour.');out.role=value.role;}
 if(value.transition!==undefined){const t=value.transition;if(!t||!['cut','fade'].includes(t.kind)||!Number.isInteger(t.duration)||t.duration<0||t.duration>2000)throw Error('Invalid slide transition.');out.transition={kind:t.kind,duration:t.kind==='cut'?0:t.duration};}
 if(value.media!==undefined&&value.media!==null){const m=value.media;if(!m||typeof m.id!=='string'||!/^[-a-f0-9]{36}$/.test(m.id)||!['image','video','audio'].includes(m.kind))throw Error('Invalid background media.');out.media={id:m.id,kind:m.kind};}
 return out;
}
module.exports={presentation,roles};

import {contextBridge,ipcRenderer} from 'electron';
contextBridge.exposeInMainWorld('faithAudience',Object.freeze({
 reportMediaEnded:(id:string,at:number,position:number)=>ipcRenderer.invoke('audience:mediaEnded',id,at,position),
 reportMediaError:(id:string)=>ipcRenderer.invoke('audience:mediaError',id),
 getState:()=>ipcRenderer.invoke('audience:get'),
 acknowledge:(revision:number)=>ipcRenderer.invoke('audience:ack',revision),
 onState:(callback:(value:unknown)=>void)=>{const listener=(_event:unknown,value:unknown)=>callback(value);ipcRenderer.on('audience:state',listener);return()=>ipcRenderer.removeListener('audience:state',listener);}
}));

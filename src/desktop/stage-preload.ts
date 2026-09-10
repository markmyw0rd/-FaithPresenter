import {contextBridge,ipcRenderer} from 'electron';
contextBridge.exposeInMainWorld('faithStage',Object.freeze({getState:()=>ipcRenderer.invoke('stage-view:get'),onState:(callback:(value:unknown)=>void)=>{const listener=(_event:unknown,value:unknown)=>callback(value);ipcRenderer.on('stage:state',listener);return()=>ipcRenderer.removeListener('stage:state',listener);}}));

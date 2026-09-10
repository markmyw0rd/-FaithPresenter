import fs from 'node:fs/promises';
import {app,BrowserWindow,ipcMain,protocol,net,screen,shell,session,Menu,dialog} from 'electron';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {readSettings,writeSettings} from './settings';
import {ServiceDatabase} from './database';
import {LiveOutput} from './live';
import {StageOutput} from './stage';
import {StreamOutput} from './stream';
const squirrel = require('electron-squirrel-startup');
protocol.registerSchemesAsPrivileged([{scheme:'faith',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
let mainWindow:BrowserWindow|null=null;
let outputWindow:BrowserWindow|null=null;
let live:LiveOutput;
let stage:StageOutput;
let stream:StreamOutput;
const dataFolder=()=>app.getPath('userData');
let database:ServiceDatabase|null=null;
let pendingBackups=0;
function store(){if(!database)database=new ServiceDatabase(dataFolder());return database;}
function guard(event:Electron.IpcMainInvokeEvent) {
 if(!mainWindow || event.sender!==mainWindow.webContents || event.senderFrame!==mainWindow.webContents.mainFrame) throw new Error('Request denied');
}
function protect(win:BrowserWindow) {
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',event=>event.preventDefault());
}
function displays(){return screen.getAllDisplays().map(d=>({id:d.id,label:d.label||`Display ${d.id}`,width:d.size.width,height:d.size.height,primary:d.id===screen.getPrimaryDisplay().id}));}
function showTest(id:unknown) {
 if(live?.win)throw new Error('Close audience output in Operator before opening a test pattern.');
 if(typeof id!=='number'||!Number.isInteger(id)) throw new Error('Choose an available display first.');
 const display=screen.getAllDisplays().find(d=>d.id===id);
 if(!display) throw new Error('That display is no longer connected. Refresh displays.');
 outputWindow?.close();
 const primary=display.id===screen.getPrimaryDisplay().id;
 outputWindow=new BrowserWindow({x:display.bounds.x+(!primary?0:40),y:display.bounds.y+(!primary?0:40),width:primary?960:display.bounds.width,height:primary?540:display.bounds.height,fullscreen:!primary,backgroundColor:'#080c15',title:'FaithPresenter — Test output',autoHideMenuBar:true,webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false}});
 const current=outputWindow;protect(current);
 current.webContents.on('before-input-event',(event,input)=>{if(input.key==='Escape'){event.preventDefault();current.close();}});
 current.on('closed',()=>{if(outputWindow===current) outputWindow=null;});
 void current.loadURL('faith://app/output.html');
 return {fullscreen:!primary};
}
function createWindow(){
 mainWindow=new BrowserWindow({width:1320,height:880,minWidth:960,minHeight:700,title:'FaithPresenter',backgroundColor:'#0b101c',icon:path.join(__dirname,'../../assets/icon.png'),webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 protect(mainWindow);
 const win=mainWindow;
 win.webContents.on('render-process-gone',()=>live?.stop('Operator renderer stopped. Restart FaithPresenter.','error'));
 win.on('close',event=>{if(pendingBackups){event.preventDefault();void dialog.showMessageBox(win,{type:'info',message:'A backup or media import is still running.',detail:'Please wait for the backup confirmation, then close FaithPresenter.'});}});
 win.webContents.on('will-prevent-unload',event=>{const choice=dialog.showMessageBoxSync(win,{type:'warning',buttons:['Keep editing','Discard unsaved changes'],defaultId:0,cancelId:0,message:'You have unsaved service or song edits.',detail:'Choose Keep editing. Use Save song for lyrics and Save now for service changes before closing.'});if(choice===1)event.preventDefault();});
 void mainWindow.loadURL('faith://app/index.html');
 mainWindow.on('closed',()=>{mainWindow=null;live?.stop();stage?.close();stream?.close();outputWindow?.close();});
}
if(squirrel || !app.requestSingleInstanceLock()) app.quit();
else {
 app.on('second-instance',()=>{if(mainWindow?.isMinimized())mainWindow.restore();mainWindow?.focus();});
 app.whenReady().then(()=>{
  const root=path.resolve(__dirname,'../renderer');
  protocol.handle('faith',request=>{
   const url=new URL(request.url);
   if(url.host==='media')return store().media.response(request);
   if(!['app','audience','stage','stream'].includes(url.host)||request.method!=='GET')return new Response('Forbidden',{status:403});
   let relative:string;try{relative=decodeURIComponent(url.pathname);}catch{return new Response('Bad path',{status:400});}
   const file=path.resolve(root,'.'+relative);
   if(!file.startsWith(root+path.sep))return new Response('Forbidden',{status:403});
   return net.fetch(pathToFileURL(file).toString());
  });
  session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
  session.defaultSession.setPermissionCheckHandler(()=>false);
  live=new LiveOutput({displays:()=>screen.getAllDisplays(),primary:()=>screen.getPrimaryDisplay().id,notify:(value:unknown)=>mainWindow?.webContents.send('live:state',value),createWindow:(display:Electron.Display,windowed:boolean)=>{
   outputWindow?.close();
   const win=new BrowserWindow({x:display.bounds.x+(windowed?40:0),y:display.bounds.y+(windowed?40:0),width:windowed?960:display.bounds.width,height:windowed?540:display.bounds.height,fullscreen:!windowed,backgroundColor:'#000000',title:'FaithPresenter — Audience output',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'audience-preload.js'),autoplayPolicy:'no-user-gesture-required',backgroundThrottling:false,sandbox:true,contextIsolation:true,nodeIntegration:false}});
   protect(win);win.setMenu(null);win.webContents.on('before-input-event',(event,input)=>{if(input.key==='Escape'){event.preventDefault();win.close();}});return win;
  }});
  stage=new StageOutput({displays:()=>screen.getAllDisplays(),primary:()=>screen.getPrimaryDisplay().id,notify:(value:unknown)=>mainWindow?.webContents.send('stage:state',value),createWindow:(display:Electron.Display,windowed:boolean)=>{
   const win=new BrowserWindow({x:display.bounds.x+(windowed?80:0),y:display.bounds.y+(windowed?80:0),width:windowed?960:display.bounds.width,height:windowed?540:display.bounds.height,fullscreen:!windowed,backgroundColor:'#050708',title:'FaithPresenter — Stage display',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'stage-preload.js'),backgroundThrottling:false,sandbox:true,contextIsolation:true,nodeIntegration:false}});
   protect(win);win.setMenu(null);win.webContents.on('before-input-event',(event,input)=>{if(input.key==='Escape'){event.preventDefault();win.close();}});return win;
  }});
  stream=new StreamOutput({notify:(value:unknown)=>mainWindow?.webContents.send('stream:state',value),createWindow:()=>{const win=new BrowserWindow({width:960,height:540,minWidth:640,minHeight:360,backgroundColor:'#000000',title:'FaithPresenter Stream Feed',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'stream-preload.js'),autoplayPolicy:'no-user-gesture-required',backgroundThrottling:false,sandbox:true,contextIsolation:true,nodeIntegration:false}});protect(win);win.setAspectRatio(16/9);win.setMenu(null);return win;}});
  ipcMain.handle('live:get',event=>{guard(event);return live.snapshot();});
  ipcMain.handle('render:diagnostics',event=>{guard(event);const gpu=app.getGPUFeatureStatus() as unknown as Record<string,string>;const compositor=gpu.gpu_compositing==='enabled'?'enabled':'disabled';return {gpu,compositor,note:compositor==='enabled'?'Chromium reports GPU compositing enabled. Individual features may still use software fallbacks.':'Chromium reports GPU compositing unavailable; frames continue through its software fallback.'};});
  ipcMain.handle('stream:get',event=>{guard(event);return stream.snapshot();});ipcMain.handle('stream:open',event=>{guard(event);return stream.open();});ipcMain.handle('stream:stop',event=>{guard(event);return stream.close();});ipcMain.handle('stream:command',(event,action,value)=>{guard(event);if(action==='take'&&value?.slide?.presentation?.media){const media=store().media.resolve(value.slide.presentation.media.id);if(!require('node:fs').existsSync(media.path))throw Error('Media file is missing. Re-import and reassign it.');}return stream.command(action,value);});
  ipcMain.handle('live:open',(event,id)=>{guard(event);return live.open(id);});
  ipcMain.handle('live:stop',event=>{guard(event);return live.stop();});
  ipcMain.handle('live:command',(event,action,value)=>{guard(event);if(action==='take'&&value?.slide?.presentation?.media){const media=store().media.resolve(value.slide.presentation.media.id);if(!require('node:fs').existsSync(media.path))throw Error('Media file is missing. Re-import and reassign it.');if(media.kind!==value.slide.presentation.media.kind)throw Error('Media type mismatch');}if(action==='slideshow-start')for(const slide of value?.slides||[]){if(slide.presentation?.media){const m=store().media.resolve(slide.presentation.media.id);if(m.kind!=='image'||!require('node:fs').existsSync(m.path))throw Error('Announcement image is missing or invalid. Re-import and reassign it.');}}return live.command(action,value);});
  ipcMain.handle('stage:get',event=>{guard(event);return stage.snapshot();});
  ipcMain.handle('stage:open',(event,id)=>{guard(event);if(live.win&&live.state.displayId===id)throw Error('Choose a different display from the audience output.');return stage.open(id);});
  ipcMain.handle('stage:stop',event=>{guard(event);return stage.close();});
  ipcMain.handle('stage:command',(event,action,value)=>{guard(event);return stage.command(action,value);});
  const stageGuard=(event:Electron.IpcMainInvokeEvent)=>{if(!stage.win||event.sender!==stage.win.webContents||event.senderFrame!==stage.win.webContents.mainFrame)throw new Error('Request denied');};
  ipcMain.handle('stage-view:get',event=>{stageGuard(event);return stage.snapshot();});
  const streamGuard=(event:Electron.IpcMainInvokeEvent)=>{if(!stream.win||event.sender!==stream.win.webContents||event.senderFrame!==stream.win.webContents.mainFrame)throw new Error('Request denied');};ipcMain.handle('stream-view:get',event=>{streamGuard(event);return stream.snapshot();});ipcMain.handle('stream-view:ack',(event,revision)=>{streamGuard(event);stream.acknowledge(revision);});
  const audienceGuard=(event:Electron.IpcMainInvokeEvent)=>{if(!live.win||event.sender!==live.win.webContents||event.senderFrame!==live.win.webContents.mainFrame)throw new Error('Request denied');};
  ipcMain.handle('audience:get',event=>{audienceGuard(event);return live.snapshot();});
  ipcMain.handle('audience:ack',(event,revision)=>{audienceGuard(event);live.acknowledge(revision);});
  ipcMain.handle('audience:mediaEnded',(event,id,at,position)=>{audienceGuard(event);live.mediaEnded(id,at,position);});
  ipcMain.handle('audience:mediaError',(event,id)=>{audienceGuard(event);live.mediaFailed(id);});
  ipcMain.handle('desktop:info',event=>{guard(event);return {version:app.getVersion(),platform:process.platform,dataPath:dataFolder()};});
  ipcMain.handle('settings:read',event=>{guard(event);return readSettings(dataFolder());});
  ipcMain.handle('settings:save',(event,value)=>{guard(event);return writeSettings(dataFolder(),value);});
  ipcMain.handle('services:bootstrap',event=>{guard(event);return store().bootstrap();});
  ipcMain.handle('bible:list',event=>{guard(event);return store().bible.list();});
  ipcMain.handle('bible:catalog',(event,id)=>{guard(event);return store().bible.catalog(id);});
  ipcMain.handle('bible:search',(event,id,query)=>{guard(event);return store().bible.search(id,query);});
  ipcMain.handle('bible:build',(event,id,book,chapter,start,end)=>{guard(event);return store().bible.build(id,book,chapter,start,end);});
  ipcMain.handle('bible:import',async event=>{guard(event);const result=await dialog.showOpenDialog(mainWindow!,{title:'Import Bible JSON',properties:['openFile'],filters:[{name:'FaithPresenter Bible JSON',extensions:['json']}]});if(result.canceled)return null;const file=await fs.open(result.filePaths[0],'r');let text;try{if((await file.stat()).size>20*1024*1024)throw Error('Bible import must be under 20 MB.');text=await file.readFile('utf8');}finally{await file.close();}return store().bible.import(JSON.parse(text.replace(/^\uFEFF/,'')));});
  ipcMain.handle('themes:list',event=>{guard(event);return store().themes.list();});
  ipcMain.handle('themes:save',(event,id,version,value)=>{guard(event);return store().themes.save(id,version,value);});
  ipcMain.handle('themes:trash',(event,id,version)=>{guard(event);return store().themes.trash(id,version);});
  ipcMain.handle('themes:restore',(event,id)=>{guard(event);return store().themes.restore(id);});
  ipcMain.handle('media:list',event=>{guard(event);return store().media.list();});
  ipcMain.handle('media:import',async event=>{guard(event);const result=await dialog.showOpenDialog(mainWindow!,{title:'Import image, video or audio',properties:['openFile'],filters:[{name:'Images, video and audio',extensions:['png','jpg','jpeg','webp','mp4','webm','mp3','wav','ogg','m4a']}]});if(result.canceled||!result.filePaths.length)return null;pendingBackups++;try{return await store().media.importFile(result.filePaths[0]);}finally{pendingBackups--;}});
  ipcMain.handle('songs:list',(event,query)=>{guard(event);return store().songs.list(query);});
  ipcMain.handle('songs:get',(event,id)=>{guard(event);return store().songs.get(id);});
  ipcMain.handle('songs:save',(event,id,version,value)=>{guard(event);return store().songs.save(id,version,value);});
  ipcMain.handle('songs:duplicate',(event,id)=>{guard(event);return store().songs.duplicate(id);});
  ipcMain.handle('songs:trash',(event,id,version)=>{guard(event);return store().songs.trash(id,version);});
  ipcMain.handle('songs:restore',(event,id)=>{guard(event);return store().songs.restore(id);});
  ipcMain.handle('songs:build',(event,id,version)=>{guard(event);return store().songs.build(id,version);});
  ipcMain.handle('services:list',event=>{guard(event);return store().list();});
  ipcMain.handle('services:open',(event,id)=>{guard(event);return store().open(id);});
  ipcMain.handle('services:create',(event,title)=>{guard(event);return store().create(title);});
  ipcMain.handle('services:save',(event,id,version,value)=>{guard(event);return store().save(id,version,value);});
  ipcMain.handle('services:duplicate',(event,id)=>{guard(event);return store().duplicate(id);});
  ipcMain.handle('services:trash',(event,id)=>{guard(event);return store().trash(id);});
  ipcMain.handle('services:restore',(event,id)=>{guard(event);return store().restore(id);});
  ipcMain.handle('services:history',(event,id)=>{guard(event);return store().versions(id);});
  ipcMain.handle('services:restoreVersion',(event,id,version,currentVersion)=>{guard(event);return store().restoreVersion(id,version,currentVersion);});
  ipcMain.handle('services:backup',async event=>{guard(event);pendingBackups++;try{return await store().backup();}finally{pendingBackups--;}});
  ipcMain.handle('services:openBackups',async event=>{guard(event);const error=await shell.openPath(path.join(dataFolder(),'backups'));if(error)throw new Error('Create a database backup first. '+error);});
  ipcMain.handle('displays:list',event=>{guard(event);return displays();});
  ipcMain.handle('output:test',(event,id)=>{guard(event);return showTest(id);});
  ipcMain.handle('output:close',event=>{guard(event);outputWindow?.close();});
  ipcMain.handle('data:open',async event=>{guard(event);const error=await shell.openPath(dataFolder());if(error)throw new Error(error);});
  screen.on('display-removed',(_event,display)=>{live.displayChanged(display.id);stage.displayChanged(display.id);outputWindow?.close();mainWindow?.webContents.send('displays:changed');});
  screen.on('display-metrics-changed',(_event,display)=>{live.displayChanged(display.id);stage.displayChanged(display.id);mainWindow?.webContents.send('displays:changed');});
  screen.on('display-added',()=>mainWindow?.webContents.send('displays:changed'));
  Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'FaithPresenter',submenu:[{label:'About FaithPresenter',click:()=>dialog.showMessageBox({type:'info',message:'FaithPresenter 0.14.0',detail:'Phase 14 adds a service-wide Run of Show cue queue, current/next cue display, rehearsal progress and an armed Spacebar GO.'})},{type:'separator'},{role:'quit'}]},{label:'Edit',submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}]},{label:'View',submenu:[{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'}]}]));
  createWindow();
 }).catch(error=>{dialog.showErrorBox('FaithPresenter could not start',String(error));app.quit();});
 app.on('window-all-closed',()=>app.quit());
 app.on('will-quit',()=>database?.close());
}

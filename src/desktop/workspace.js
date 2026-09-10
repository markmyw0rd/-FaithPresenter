const fs=require('node:fs');
const path=require('node:path');
const {presentation}=require('./presentation');
function emptyWorkspace(){return {schemaVersion:1,title:'Untitled service',items:[]};}
function validateWorkspace(value){
 if(!value||value.schemaVersion!==1||typeof value.title!=='string'||value.title.length>120||!Array.isArray(value.items)||value.items.length>100)throw new Error('Invalid workspace');
 const ids=new Set();
 const clean=value.items.map(item=>{
  if(!item||typeof item.id!=='string'||ids.has(item.id)||typeof item.title!=='string'||item.title.length>120||!Array.isArray(item.slides)||item.slides.length>100)throw new Error('Invalid service item');
  ids.add(item.id);
  return {id:item.id,title:item.title,slides:item.slides.map(slide=>{
   if(!slide||typeof slide.id!=='string'||ids.has(slide.id)||typeof slide.text!=='string'||slide.text.length>2000||!['violet','ocean','forest','plain'].includes(slide.theme))throw new Error('Invalid slide');
   ids.add(slide.id);return {id:slide.id,text:slide.text,theme:slide.theme,...(slide.presentation===undefined?{}:{presentation:presentation(slide.presentation)})};
  })};
 });
 return {schemaVersion:1,title:value.title,items:clean};
}
function readWorkspace(folder){
 const file=path.join(folder,'workspace.json');if(!fs.existsSync(file))return emptyWorkspace();
 try{return validateWorkspace(JSON.parse(fs.readFileSync(file,'utf8')));}catch{throw new Error('Workspace could not be read. The original workspace.json has been preserved in your data folder.');}
}
function writeWorkspace(folder,value){
 const clean=validateWorkspace(value);fs.mkdirSync(folder,{recursive:true});const file=path.join(folder,'workspace.json');
 if(fs.existsSync(file)){readWorkspace(folder);fs.copyFileSync(file,path.join(folder,'workspace.backup.json'));}
 const temp=path.join(folder,'workspace.tmp');const fd=fs.openSync(temp,'w');try{fs.writeFileSync(fd,JSON.stringify(clean,null,2));fs.fsyncSync(fd);}finally{fs.closeSync(fd);}fs.renameSync(temp,file);return clean;
}
module.exports={emptyWorkspace,validateWorkspace,readWorkspace,writeWorkspace};

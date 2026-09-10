const fs=require('node:fs');const path=require('node:path');const {randomUUID}=require('node:crypto');const {Readable}=require('node:stream');
const types={'.mp3':['audio','audio/mpeg'],'.wav':['audio','audio/wav'],'.ogg':['audio','audio/ogg'],'.m4a':['audio','audio/mp4'],'.png':['image','image/png'],'.jpg':['image','image/jpeg'],'.jpeg':['image','image/jpeg'],'.webp':['image','image/webp'],'.mp4':['video','video/mp4'],'.webm':['video','video/webm']};
class MediaStore{
 constructor(folder,db){this.folder=path.join(folder,'media');this.db=db;fs.mkdirSync(this.folder,{recursive:true});db.exec('CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY,name TEXT NOT NULL,kind TEXT NOT NULL,mime TEXT NOT NULL,extension TEXT NOT NULL,size INTEGER NOT NULL)');}
 list(){return this.db.prepare('SELECT id,name,kind,size,extension,mime FROM media ORDER BY name,id').all().map(m=>({...m,missing:!fs.existsSync(path.join(this.folder,m.id+m.extension))}));}
 async importFile(source){
  const extension=path.extname(source).toLowerCase(),type=types[extension];if(!type)throw Error('Use PNG, JPEG, WebP, MP4, WebM, MP3, WAV, OGG or M4A.');
  const stat=await fs.promises.stat(source);if(!stat.isFile()||stat.size<12||stat.size>250*1024*1024)throw Error('Media must be a file between 12 bytes and 250 MB.');
  const h=await fs.promises.open(source,'r');const header=Buffer.alloc(12);try{await h.read(header,0,12,0);}finally{await h.close();}
  const valid=extension==='.mp3'?(header.toString('ascii',0,3)==='ID3'||(header[0]===255&&(header[1]&224)===224)):extension==='.wav'?(header.toString('ascii',0,4)==='RIFF'&&header.toString('ascii',8,12)==='WAVE'):extension==='.ogg'?header.toString('ascii',0,4)==='OggS':extension==='.png'?header.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):['.jpg','.jpeg'].includes(extension)?header[0]===255&&header[1]===216:extension==='.webp'?header.toString('ascii',0,4)==='RIFF'&&header.toString('ascii',8,12)==='WEBP':['.mp4','.m4a'].includes(extension)?header.toString('ascii',4,8)==='ftyp':header.readUInt32BE(0)===0x1a45dfa3;
  if(!valid)throw Error('Media header does not match its file type.');
  const id=randomUUID(),target=path.join(this.folder,id+extension),name=path.basename(source).slice(0,200);
  await fs.promises.copyFile(source,target,fs.constants.COPYFILE_EXCL);
  try{this.db.prepare('INSERT INTO media VALUES(?,?,?,?,?,?)').run(id,name,...type,extension,stat.size);}catch(e){await fs.promises.unlink(target);throw e;}
  return {id,name,kind:type[0],size:stat.size};
 }
 resolve(id){if(typeof id!=='string'||!/^[-a-f0-9]{36}$/.test(id))throw Error('Invalid media ID');const row=this.db.prepare('SELECT * FROM media WHERE id=?').get(id);if(!row||!types[row.extension])throw Error('Media not found');return {...row,path:path.join(this.folder,id+row.extension)};}
 async response(request){
  try{const url=new URL(request.url);const row=this.resolve(url.pathname.slice(1));if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405});const size=(await fs.promises.stat(row.path)).size;let start=0,end=size-1,status=200;
   const headers={'Content-Type':row.mime,'Accept-Ranges':'bytes','Cache-Control':'no-store'};const range=request.headers.get('range');
   if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m||(!m[1]&&!m[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});if(m[1]){start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),end):end;}else start=Math.max(0,size-Number(m[2]));if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;}
   headers['Content-Length']=String(end-start+1);return new Response(request.method==='HEAD'?null:Readable.toWeb(fs.createReadStream(row.path,{start,end})),{status,headers});
  }catch{return new Response('Media unavailable',{status:404});}
 }
 async backupTo(folder){await fs.promises.mkdir(folder,{recursive:true});for(const m of this.list()){const row=this.resolve(m.id);await fs.promises.copyFile(row.path,path.join(folder,m.id+row.extension),fs.constants.COPYFILE_EXCL);}}
}
module.exports={MediaStore};

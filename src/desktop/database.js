const {BibleStore}=require('./bible');
const {DatabaseSync,backup}=require('node:sqlite');
const fs=require('node:fs');const path=require('node:path');const {randomUUID}=require('node:crypto');
const {emptyWorkspace,validateWorkspace,readWorkspace}=require('./workspace');
const {SongStore}=require('./songs');
const {MediaStore}=require('./media');
const {ThemeStore}=require('./themes');

class ServiceDatabase {
 constructor(folder){
  this.folder=folder;this.migrated=false;fs.mkdirSync(folder,{recursive:true});
  this.db=new DatabaseSync(path.join(folder,'faithpresenter.sqlite'));
  try{
   const version=this.db.prepare('PRAGMA user_version').get().user_version;
   if(version>4)throw new Error('This database was created by a newer FaithPresenter. Use that version; your data has not been changed.');
   if(this.db.prepare('PRAGMA quick_check').get().quick_check!=='ok')throw new Error('Database integrity check failed. Keep your data folder and restore a verified backup.');
   this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;');
   if(version>0&&version<4){fs.mkdirSync(path.join(folder,'backups'),{recursive:true});this.db.prepare('VACUUM INTO ?').run(path.join(folder,'backups','Before-0.8.0-'+randomUUID()+'.sqlite'));}
   this.transaction(()=>{this.db.exec(`
    CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS services(id TEXT PRIMARY KEY,title TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,version INTEGER NOT NULL,deleted_at TEXT);
    CREATE TABLE IF NOT EXISTS items(service_id TEXT NOT NULL,id TEXT NOT NULL,title TEXT NOT NULL,position INTEGER NOT NULL,PRIMARY KEY(service_id,id),FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS slides(service_id TEXT NOT NULL,item_id TEXT NOT NULL,id TEXT NOT NULL,text TEXT NOT NULL,theme TEXT NOT NULL,position INTEGER NOT NULL,PRIMARY KEY(service_id,id),FOREIGN KEY(service_id,item_id) REFERENCES items(service_id,id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS history(service_id TEXT NOT NULL,version INTEGER NOT NULL,saved_at TEXT NOT NULL,document TEXT NOT NULL,PRIMARY KEY(service_id,version),FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE);
    PRAGMA user_version=4;`);
    if(!this.db.prepare('PRAGMA table_info(slides)').all().some(c=>c.name==='presentation'))this.db.exec("ALTER TABLE slides ADD COLUMN presentation TEXT");
   });
   if(!this.getMeta('phase2Migration')){
    // Validate before committing the import; keep original JSON and an immutable pre-migration copy.
    const exists=fs.existsSync(path.join(folder,'workspace.json'));const legacy=exists?readWorkspace(folder):null;
    if(exists&&!fs.existsSync(path.join(folder,'workspace.phase2-original.json')))fs.copyFileSync(path.join(folder,'workspace.json'),path.join(folder,'workspace.phase2-original.json'),fs.constants.COPYFILE_EXCL);
    this.transaction(()=>{if(legacy){const id=this.insert(legacy);this.setMeta('activeService',id);this.migrated=true;}this.setMeta('phase2Migration',exists?'imported':'not-present');});
   }
   this.songs=new SongStore(this);
   this.media=new MediaStore(folder,this.db);
   this.themes=new ThemeStore(this);this.bible=new BibleStore(this);
   if(!this.list().some(s=>!s.deletedAt))this.create('Untitled service');
  }catch(error){this.db.close();throw error;}
 }
 transaction(action){this.db.exec('BEGIN IMMEDIATE');try{const result=action();this.db.exec('COMMIT');return result;}catch(error){this.db.exec('ROLLBACK');throw error;}}
 getMeta(key){return this.db.prepare('SELECT value FROM meta WHERE key=?').get(key)?.value;}
 setMeta(key,value){this.db.prepare('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key,value);}
 list(){return this.db.prepare(`SELECT s.*, (SELECT COUNT(*) FROM items i WHERE i.service_id=s.id) item_count,(SELECT COUNT(*) FROM slides x WHERE x.service_id=s.id) slide_count FROM services s ORDER BY s.updated_at DESC,s.id`).all().map(s=>({id:s.id,title:s.title,createdAt:s.created_at,updatedAt:s.updated_at,version:s.version,deletedAt:s.deleted_at,itemCount:s.item_count,slideCount:s.slide_count}));}
 get(id,allowTrash=false){
  if(typeof id!=='string')throw new Error('Invalid service ID');
  const row=this.db.prepare('SELECT * FROM services WHERE id=?').get(id);if(!row||(!allowTrash&&row.deleted_at))throw new Error('Service not available. Refresh the service library.');
  const items=this.db.prepare('SELECT * FROM items WHERE service_id=? ORDER BY position').all(id).map(item=>({id:item.id,title:item.title,slides:this.db.prepare('SELECT id,text,theme,presentation FROM slides WHERE service_id=? AND item_id=? ORDER BY position').all(id,item.id).map(({presentation,...s})=>({...s,...(presentation?{presentation:JSON.parse(presentation)}:{})}))}));
  return {id:row.id,version:row.version,updatedAt:row.updated_at,data:validateWorkspace({schemaVersion:1,title:row.title,items})};
 }
 replaceContent(id,data){
  this.db.prepare('DELETE FROM items WHERE service_id=?').run(id);
  const addItem=this.db.prepare('INSERT INTO items(service_id,id,title,position) VALUES(?,?,?,?)');
  const addSlide=this.db.prepare('INSERT INTO slides(service_id,item_id,id,text,theme,position,presentation) VALUES(?,?,?,?,?,?,?)');
  data.items.forEach((item,index)=>{addItem.run(id,item.id,item.title,index);item.slides.forEach((slide,position)=>addSlide.run(id,item.id,slide.id,slide.text,slide.theme,position,slide.presentation?JSON.stringify(slide.presentation):null));});
 }
 insert(value){const data=validateWorkspace(value);const id=randomUUID(),now=new Date().toISOString();this.db.prepare('INSERT INTO services VALUES(?,?,?,?,?,NULL)').run(id,data.title,now,now,1);this.replaceContent(id,data);return id;}
 create(title='Untitled service'){
  if(typeof title!=='string'||title.length>120)throw new Error('Service title must be at most 120 characters.');
  return this.transaction(()=>{const id=this.insert({...emptyWorkspace(),title});this.setMeta('activeService',id);return this.get(id);});
 }
 bootstrap(){let id=this.getMeta('activeService');if(!this.list().some(s=>s.id===id&&!s.deletedAt))id=this.list().find(s=>!s.deletedAt)?.id;if(!id)id=this.create().id;return {active:this.open(id),services:this.list(),migration:this.getMeta('phase2Migration'),migratedNow:this.migrated};}
 open(id){const value=this.get(id);this.setMeta('activeService',id);return value;}
 save(id,expectedVersion,value){
  const data=validateWorkspace(value);if(!Number.isSafeInteger(expectedVersion))throw new Error('Invalid save version.');
  return this.transaction(()=>{const current=this.get(id);if(current.version!==expectedVersion)throw new Error('Save conflict: the service changed elsewhere. Your edits remain in the editor; do not close it.');
   if(JSON.stringify(current.data)===JSON.stringify(data))return current;
   this.db.prepare('INSERT INTO history VALUES(?,?,?,?)').run(id,current.version,current.updatedAt,JSON.stringify(current.data));
   this.replaceContent(id,data);this.db.prepare('UPDATE services SET title=?,updated_at=?,version=version+1 WHERE id=?').run(data.title,new Date().toISOString(),id);
   this.db.prepare('DELETE FROM history WHERE service_id=? AND version NOT IN (SELECT version FROM history WHERE service_id=? ORDER BY version DESC LIMIT 20)').run(id,id);return this.get(id);
  });
 }
 duplicate(id){return this.transaction(()=>{const current=this.get(id);const value={...current.data,title:(current.data.title+' — Copy').slice(0,120),items:current.data.items.map(item=>({...item,id:randomUUID(),slides:item.slides.map(slide=>({...slide,id:randomUUID()}))}))};const next=this.insert(value);this.setMeta('activeService',next);return this.get(next);});}
 trash(id){return this.transaction(()=>{this.get(id);this.db.prepare('UPDATE services SET deleted_at=?,updated_at=?,version=version+1 WHERE id=?').run(new Date().toISOString(),new Date().toISOString(),id);if(this.getMeta('activeService')===id)this.setMeta('activeService','');return this.list();});}
 restore(id){return this.transaction(()=>{this.get(id,true);this.db.prepare('UPDATE services SET deleted_at=NULL,updated_at=?,version=version+1 WHERE id=?').run(new Date().toISOString(),id);return this.get(id);});}
 versions(id){this.get(id,true);return this.db.prepare('SELECT version,saved_at savedAt FROM history WHERE service_id=? ORDER BY version DESC').all(id);}
 restoreVersion(id,version,expectedVersion){const row=this.db.prepare('SELECT document FROM history WHERE service_id=? AND version=?').get(id,version);if(!row)throw new Error('That saved version is no longer available.');return this.save(id,expectedVersion,JSON.parse(row.document));}
 async backup(){const folder=path.join(this.folder,'backups');fs.mkdirSync(folder,{recursive:true});const filename='FaithPresenter-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID().slice(0,6)+'.sqlite';const target=path.join(folder,filename);await backup(this.db,target);try{await this.media.backupTo(target+'.media');}catch{throw Error('Database copied, but media backup failed. This backup is incomplete; keep the original profile and retry.');}return {path:target,filename:filename+' + matching .media folder'};}
 close(){this.db.close();}
}
module.exports={ServiceDatabase};

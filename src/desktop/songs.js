const {randomUUID}=require('node:crypto');
function validateSong(value){
 const str=(v,max,label)=>{if(typeof v!=='string'||v.length>max)throw Error(`${label} is invalid or too long.`);return v.trim();};
 if(!value)throw Error('Invalid song.');
 const title=str(value.title,120,'Title');if(!title)throw Error('Enter a song title.');
 const author=str(value.author,200,'Author'),copyright=str(value.copyright,500,'Copyright');
 if(!['violet','ocean','forest','plain'].includes(value.theme))throw Error('Choose a valid theme.');
 if(!Array.isArray(value.sections)||value.sections.length<1||value.sections.length>40)throw Error('Use 1–40 lyric sections.');
 const ids=new Set();let total=0;
 const sections=value.sections.map(s=>{if(!s)throw Error('Invalid section.');const id=str(s.id,100,'Section ID'),label=str(s.label,60,'Section name');if(!id||ids.has(id)||!label)throw Error('Sections need unique IDs and names.');ids.add(id);const text=str(s.text,8000,'Lyrics').replace(/\r\n?/g,'\n');total+=text.length;return {id,label,text};});
 if(total>40000)throw Error('Song lyrics exceed 40,000 characters.');
 if(!Array.isArray(value.arrangement)||!value.arrangement.length||value.arrangement.length>100||value.arrangement.some(id=>!ids.has(id)))throw Error('Arrange 1–100 existing sections.');
 return {title,author,copyright,theme:value.theme,sections,arrangement:[...value.arrangement]};
}
function songItem(value){const song=validateSong(value);const slides=[];
 for(const id of song.arrangement){const section=song.sections.find(s=>s.id===id);const pages=section.text.split(/\n[ \t]*\n+/).map(x=>x.trim()).filter(Boolean);if(!pages.length)throw Error(`Add lyrics to ${section.label} before adding this arrangement.`);
  const role=section.label.toLowerCase().match(/^(verse|chorus|bridge|tag|intro|outro)/)?.[1]||'other';
  for(const text of pages){if(text.length>2000)throw Error(`${section.label}: insert a blank line to split lyrics into slides of at most 2,000 characters.`);slides.push({id:randomUUID(),text,theme:song.theme,presentation:{label:section.label,role}});}}
 if(slides.length>100)throw Error('Arrangement exceeds 100 slides. Shorten the arrangement.');
 return {id:randomUUID(),title:song.title,slides};
}
class SongStore{
 constructor(store){this.store=store;this.db=store.db;
  const version=store.getMeta('songSchema');if(version&&version!=='1')throw Error('Song library requires a newer FaithPresenter version.');
  store.transaction(()=>{this.db.exec('CREATE TABLE IF NOT EXISTS songs(id TEXT PRIMARY KEY,version INTEGER NOT NULL,updated_at TEXT NOT NULL,deleted_at TEXT,document TEXT NOT NULL)');store.setMeta('songSchema','1');});
 }
 list(query=''){if(typeof query!=='string'||query.length>200)throw Error('Search must be at most 200 characters.');const needle=query.toLocaleLowerCase();return this.db.prepare('SELECT * FROM songs ORDER BY updated_at DESC,id').all().map(row=>{const data=validateSong(JSON.parse(row.document));return {id:row.id,version:row.version,updatedAt:row.updated_at,deletedAt:row.deleted_at,title:data.title,author:data.author,sectionCount:data.sections.length,search:[data.title,data.author,...data.sections.map(s=>s.text)].join('\n').toLocaleLowerCase()};}).filter(s=>s.search.includes(needle)).map(({search,...row})=>row);}
 get(id,allowTrash=false){if(typeof id!=='string')throw Error('Invalid song ID.');const row=this.db.prepare('SELECT * FROM songs WHERE id=?').get(id);if(!row||(!allowTrash&&row.deleted_at))throw Error('Song is unavailable. Refresh the library.');return {id:row.id,version:row.version,updatedAt:row.updated_at,deletedAt:row.deleted_at,data:validateSong(JSON.parse(row.document))};}
 save(id,version,value){const data=validateSong(value);return this.store.transaction(()=>{if(id===null){if(version!==0)throw Error('Invalid new-song version.');id=randomUUID();this.db.prepare('INSERT INTO songs VALUES(?,1,?,NULL,?)').run(id,new Date().toISOString(),JSON.stringify(data));}else{const current=this.get(id);if(current.version!==version)throw Error('Song save conflict. Keep your edits and reopen after resolving it.');this.db.prepare('UPDATE songs SET document=?,version=version+1,updated_at=? WHERE id=?').run(JSON.stringify(data),new Date().toISOString(),id);}return this.get(id);});}
 duplicate(id){const current=this.get(id);return this.save(null,0,{...current.data,title:(current.data.title+' — Copy').slice(0,120)});}
 trash(id,version){return this.store.transaction(()=>{const current=this.get(id);if(current.version!==version)throw Error('Song changed; reopen it before removing.');this.db.prepare('UPDATE songs SET deleted_at=?,version=version+1 WHERE id=?').run(new Date().toISOString(),id);return this.list();});}
 restore(id){return this.store.transaction(()=>{this.get(id,true);this.db.prepare('UPDATE songs SET deleted_at=NULL,version=version+1,updated_at=? WHERE id=?').run(new Date().toISOString(),id);return this.get(id);});}
 build(id,version){const record=this.get(id);if(record.version!==version)throw Error('Song changed. Reopen it before adding.');return songItem(record.data);}
}
module.exports={SongStore,validateSong,songItem};

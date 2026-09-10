const fs = require('node:fs');
const path = require('node:path');
const defaults = () => ({schemaVersion:1, churchName:'My Church', displayId:null});
function validate(value) {
 if (!value || value.schemaVersion !== 1 || typeof value.churchName !== 'string' || !value.churchName.trim() || value.churchName.length > 100 || !(value.displayId === null || Number.isInteger(value.displayId))) throw new Error('Invalid settings. Enter a church name of 1–100 characters.');
 return {schemaVersion:1,churchName:value.churchName.trim(),displayId:value.displayId};
}
function readSettings(folder) {
 const file=path.join(folder,'settings.json');
 if (!fs.existsSync(file)) return defaults();
 try { return validate(JSON.parse(fs.readFileSync(file,'utf8'))); }
 catch { throw new Error('Settings could not be read. Your file has been preserved. Open the data folder and rename settings.json to settings.old.json, then restart.'); }
}
function writeSettings(folder,value) {
 const safe=validate(value); fs.mkdirSync(folder,{recursive:true});
 const file=path.join(folder,'settings.json');
 if(fs.existsSync(file)) {readSettings(folder); fs.copyFileSync(file,path.join(folder,'settings.backup.json'));}
 const temp=path.join(folder,'settings.tmp');
 const fd=fs.openSync(temp,'w');
 try {fs.writeFileSync(fd,JSON.stringify(safe,null,2));fs.fsyncSync(fd);} finally {fs.closeSync(fd);}
 fs.renameSync(temp,file); return safe;
}
module.exports={defaults,validate,readSettings,writeSettings};

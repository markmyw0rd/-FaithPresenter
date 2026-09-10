const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
const {emptyWorkspace,validateWorkspace,readWorkspace,writeWorkspace}=require('../src/desktop/workspace.js');
function folder(t){const p=fs.mkdtempSync(path.join(os.tmpdir(),'faith-workspace-'));t.after(()=>fs.rmSync(p,{recursive:true,force:true}));return p;}
const sample=()=>({schemaVersion:1,title:'Sunday',items:[{id:'a',title:'Welcome',slides:[{id:'s',text:'Hello\nChurch',theme:'violet'}]}]});
test('empty draft on first run',t=>assert.deepEqual(readWorkspace(folder(t)),emptyWorkspace()));
test('draft survives a fresh read',t=>{const p=folder(t);writeWorkspace(p,sample());assert.deepEqual(readWorkspace(p),sample());});
test('update retains backup and preserves Phase 1 profile',t=>{const p=folder(t);fs.writeFileSync(path.join(p,'settings.json'),'phase-one');writeWorkspace(p,sample());writeWorkspace(p,{...sample(),title:'Updated'});assert.equal(JSON.parse(fs.readFileSync(path.join(p,'workspace.backup.json'))).title,'Sunday');assert.equal(fs.readFileSync(path.join(p,'settings.json'),'utf8'),'phase-one');});
test('corrupt draft is never silently replaced',t=>{const p=folder(t);fs.writeFileSync(path.join(p,'workspace.json'),'bad');assert.throws(()=>writeWorkspace(p,sample()));assert.equal(fs.readFileSync(path.join(p,'workspace.json'),'utf8'),'bad');});
test('invalid schema, large text, duplicate ids and unknown themes rejected',()=>{assert.throws(()=>validateWorkspace({...sample(),schemaVersion:3}));for(const patch of [{text:'x'.repeat(2001)},{id:'a'},{theme:'javascript'}]){const s=sample();Object.assign(s.items[0].slides[0],patch);assert.throws(()=>validateWorkspace(s));}});
test('caller mutations cannot alter a validated snapshot',()=>{const s=sample();const v=validateWorkspace(s);s.items[0].slides[0].text='Edited';assert.equal(v.items[0].slides[0].text,'Hello\nChurch');});

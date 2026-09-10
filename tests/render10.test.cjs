const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('shared frame pipeline defines theme, media and slide-object layers', () => {
  const source = read('src/renderer/render-pipeline.ts');
  assert.match(source, /id: "theme"/);
  assert.match(source, /id: "media"/);
  assert.match(source, /id: "text"/);
  assert.match(source, /width: 1920/);
  assert.match(source, /height: 1080/);
});

test('frame identity includes content, theme, media and style', () => {
  const source = read('src/renderer/render-pipeline.ts');
  for (const field of ['text:', 'theme:', 'media:', 'style:']) assert.match(source, new RegExp(field));
  assert.match(source, /Object\.freeze/);
});

test('working and future output adapters have honest status', () => {
  const source = read('src/renderer/render-pipeline.ts');
  for (const ready of ['preview', 'audience', 'stage']) assert.match(source, new RegExp(`id: "${ready}", name: .*status: "ready"`));
  assert.match(source, /id: "livestream", name: "Livestream", status: "ready"/);
  assert.match(source, /id: "ndi", name: "NDI", status: "planned"/);
  assert.match(source, /id: "sdi", name: "SDI", status: "planned"/);
});

test('graphics diagnostics come from Electron and retain software fallback', () => {
  const main = read('src/desktop/main.ts');
  assert.match(main, /app\.getGPUFeatureStatus\(\)/);
  assert.match(main, /gpu_compositing/);
  assert.match(main, /software fallback/);
});

test('output pipeline is reachable from toolbar, dock and status bar', () => {
  const workspace = read('src/renderer/Workspace.tsx');
  assert.ok((workspace.match(/resource\("Outputs"\)/g) || []).length >= 2);
  assert.match(workspace, /<RenderPipelinePanel preview=\{slide\}/);
});

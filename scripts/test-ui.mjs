// Real React renderers + real SQLite + real live authority; Electron window/IPC simulated.
// No native display/layout claims are made by this test.
import { JSDOM } from "jsdom";
import { build } from "vite";
import { createRequire } from "node:module";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { ServiceDatabase } = require("../src/desktop/database");
const { LiveOutput } = require("../src/desktop/live");
const root = path.resolve(import.meta.dirname, ".."),
  folder = fs.mkdtempSync(path.join(os.tmpdir(), "faith-phase4-ui-"));
const database = new ServiceDatabase(folder);
let record = database.bootstrap().active;
database.save(record.id, record.version, {
  schemaVersion: 1,
  title: "Sunday",
  items: [
    {
      id: "i",
      title: "Welcome",
      slides: [
        { id: "s", text: "Original text", theme: "forest" },
        { id: "s2", text: "Second slide", theme: "ocean" },
      ],
    },
  ],
});
const original = record.id;
let liveListener = () => {},
  audienceListener = () => {},
  fail = false,
  delay = 0,
  backupRelease;
let audience;
const tick = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));
function document() {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "https://faith.test",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  dom.window.structuredClone = structuredClone;
  dom.window.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  return dom;
}
const operator = document(),
  w = operator.window,
  d = w.document;
const displays = [
  { id: 1, label: "Laptop", width: 1920, height: 1080, primary: true },
  { id: 2, label: "Projector", width: 1920, height: 1080, primary: false },
];
const live = new LiveOutput({
  displays: () => displays,
  primary: () => 1,
  notify: (s) => liveListener(s),
  createWindow: () => {
    const win = new EventEmitter();
    win.webContents = new EventEmitter();
    win.webContents.send = (_c, s) => audienceListener(s);
    win.loadURL = async () => {
      audience = document();
      audience.window.faithAudience = {
        getState: async () => live.snapshot(),
        acknowledge: async (r) => live.acknowledge(r),
        onState: (fn) => {
          audienceListener = fn;
          return () => {
            audienceListener = () => {};
          };
        },
      };
      audience.window.eval(audienceCode);
    };
    win.isDestroyed = () => false;
    win.destroy = () => {
      audience?.window.close();
      audienceListener = () => {};
      win.emit("closed");
    };
    return win;
  },
});
w.faithDesktop = {
  listBibles: async () => database.bible.list(),
  bibleCatalog: async (id) => database.bible.catalog(id),
  importBible: async () =>
    database.bible.import({
      format: "faithpresenter-bible-v1",
      name: "Synthetic UI fixture",
      abbreviation: "TEST",
      license: "Original synthetic text, not scripture",
      verses: [
        {
          book: "John",
          chapter: 3,
          verse: 16,
          text: "Original UI text for scripture workflow.",
        },
        {
          book: "John",
          chapter: 3,
          verse: 17,
          text: "Second original UI sentence.",
        },
      ],
    }),
  searchBible: async (id, q) => database.bible.search(id, q),
  buildBible: async (...args) => database.bible.build(...args),
  info: async () => ({ version: "0.4.0", platform: "win32", dataPath: folder }),
  readSettings: async () => ({
    schemaVersion: 1,
    churchName: "Test Church",
    displayId: 2,
  }),
  saveSettings: async (x) => x,
  displays: async () => displays,
  onDisplaysChanged: () => () => {},
  listSongs: async (q) => database.songs.list(q),
  getSong: async (id) => database.songs.get(id),
  saveSong: async (id, v, value) => {
    if (fail) throw Error("Song disk failure");
    return database.songs.save(id, v, value);
  },
  duplicateSong: async (id) => database.songs.duplicate(id),
  trashSong: async (id, v) => database.songs.trash(id, v),
  restoreSong: async (id) => database.songs.restore(id),
  buildSong: async (id, v) => database.songs.build(id, v),
  liveState: async () => live.snapshot(),
  openLive: async (id) => live.open(id),
  stopLive: async () => live.stop(),
  liveCommand: async (action, value) => live.command(action, value),
  onLiveState: (fn) => {
    liveListener = fn;
    return () => {
      liveListener = () => {};
    };
  },
  stageState: async () => ({
    sequence: 0,
    status: "closed",
    displayId: null,
    displayLabel: "",
    windowed: false,
    current: "",
    next: "",
    message: "",
    countdownEnd: null,
    showClock: true,
    notice: "Stage output closed",
  }),
  openStage: async () => ({
    sequence: 1,
    status: "ready",
    displayId: 1,
    displayLabel: "Laptop",
    windowed: true,
    current: "",
    next: "",
    message: "",
    countdownEnd: null,
    showClock: true,
    notice: "Ready",
  }),
  stopStage: async () => ({
    sequence: 2,
    status: "closed",
    displayId: null,
    displayLabel: "",
    windowed: false,
    current: "",
    next: "",
    message: "",
    countdownEnd: null,
    showClock: true,
    notice: "Closed",
  }),
  stageCommand: async () => ({
    sequence: 1,
    status: "ready",
    displayId: 1,
    displayLabel: "Laptop",
    windowed: true,
    current: "",
    next: "",
    message: "",
    countdownEnd: null,
    showClock: true,
    notice: "Ready",
  }),
  onStageState: () => () => {},
  bootstrap: async () => database.bootstrap(),
  listServices: async () => database.list(),
  openService: async (id) => database.open(id),
  createService: async (title) => database.create(title),
  saveService: async (id, version, data) => {
    await tick(delay);
    if (fail) throw Error("Simulated disk failure");
    return database.save(id, version, data);
  },
  duplicateService: async (id) => database.duplicate(id),
  trashService: async (id) => database.trash(id),
  restoreService: async (id) => database.restore(id),
  serviceHistory: async (id) => database.versions(id),
  restoreVersion: async (id, v, current) =>
    database.restoreVersion(id, v, current),
  backupDatabase: async () => {
    await new Promise((resolve) => {
      backupRelease = resolve;
    });
    return database.backup();
  },
  openBackups: async () => {},
};
async function bundle(entry) {
  const result = await build({
    configFile: false,
    root,
    logLevel: "error",
    define: { "process.env.NODE_ENV": '"production"' },
    build: {
      write: false,
      lib: {
        entry: path.join(root, "src/renderer", entry),
        name: "FaithTest",
        formats: ["iife"],
      },
    },
  });
  return (Array.isArray(result) ? result[0] : result).output.find(
    (x) => x.type === "chunk",
  ).code;
}
const audienceCode = await bundle("audience.tsx"),
  operatorCode = await bundle("main.tsx");
function button(text) {
  const b = [...d.querySelectorAll("button")].find(
    (x) =>
      x.getAttribute("aria-label") === text || x.textContent.trim() === text,
  );
  assert(b, "Missing " + text);
  return b;
}
async function click(text) {
  const b = button(text);
  assert(!b.matches(":disabled"), "Disabled " + text);
  b.click();
  await tick();
}
async function edit(selector, value) {
  const el = d.querySelector(selector);
  assert(el);
  const proto =
    el.tagName === "TEXTAREA"
      ? w.HTMLTextAreaElement.prototype
      : w.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
  el.dispatchEvent(new w.Event("input", { bubbles: true }));
  await tick();
}
function screenText() {
  return audience.window.document.querySelector(".surface-text").textContent;
}
try {
  w.eval(operatorCode);
  await tick(150);
  assert(d.querySelector(".quick-editor").hidden);
  await click("Edit");
  assert(!d.querySelector(".quick-editor").hidden);
  assert(d.querySelector(".studio-rail"));
  assert(d.querySelector(".resource-library"));
  assert(!d.querySelector(".studio-output").closest("fieldset"));
  assert(button("Take Live → Audience").matches(":disabled"));
  await click("Open audience · black");
  await tick(100);
  assert.equal(live.state.status, "ready");
  assert(audience.window.document.querySelector(".surface-black"));
  assert.equal(screenText(), "");
  await click("Take Live → Audience");
  assert.equal(screenText(), "Original text");
  assert.equal(live.state.appliedRevision, live.state.revision);
  await edit("#slide-text", "Private edited text");
  await tick(1000);
  assert.equal(
    database.get(original).data.items[0].slides[0].text,
    "Private edited text",
  );
  assert.equal(screenText(), "Original text");
  await click("Preview next →");
  assert.equal(screenText(), "Original text");
  await click("Take Live → Audience");
  assert.equal(screenText(), "Second slide");
  await click("Blackout");
  assert.equal(screenText(), "");
  assert(audience.window.document.querySelector(".surface-black"));
  await click("Restore image");
  assert.equal(screenText(), "Second slide");
  await click("Clear text");
  assert.equal(screenText(), "");
  assert(audience.window.document.querySelector(".surface-ocean"));
  await click("Church card");
  assert.equal(screenText(), "✦\nTest Church");
  await click("Take Live → Audience");
  await click("Manage services");
  await edit('[aria-label="New service name"]', "Evening");
  await click("＋ New service");
  assert.equal(screenText(), "Second slide");
  assert(
    d
      .querySelector(".live-source")
      .textContent.includes("from another service"),
  );
  await click("Back up database");
  assert(d.querySelector("fieldset").disabled);
  assert(!button("Blackout").matches(":disabled"));
  await click("Blackout");
  assert.equal(screenText(), "");
  backupRelease();
  await tick(100);
  assert(
    fs
      .readdirSync(path.join(folder, "backups"))
      .some((x) => x.endsWith(".sqlite")),
  );
  await click("Restore image");
  assert.equal(screenText(), "Second slide");
  const second = database.bootstrap().active.id;
  delay = 200;
  await edit('[aria-label="Service title"]', "First edit");
  await click("Save now");
  await edit('[aria-label="Service title"]', "New edit during save");
  await tick(1300);
  assert.equal(database.get(second).data.title, "New edit during save");
  assert.equal(screenText(), "Second slide");
  fail = true;
  await edit('[aria-label="Service title"]', "Unsaved");
  await tick(1200);
  assert(
    d
      .querySelector('fieldset [role="alert"]')
      .textContent.includes("Save failed"),
  );
  const count = database.list().length;
  await click("＋ New service");
  await tick(250);
  assert.equal(database.list().length, count);
  assert.equal(screenText(), "Second slide");
  fail = false;
  delay = 0;
  await click("Save now");
  await tick(100);
  await click("Songs");
  await click("＋ New song");
  await edit('[aria-label="Song title"]', "Original test song");
  await edit(
    '[aria-label="Section 1 lyrics"]',
    "Our original verse\n\nSecond page",
  );
  await click("＋ Add section");
  await edit('[aria-label="Section 2 name"]', "Chorus");
  await edit('[aria-label="Section 2 lyrics"]', "Our original chorus");
  await click("＋ Chorus");
  await click("Slides");
  await click("Songs");
  assert.equal(
    d.querySelector('[aria-label="Song title"]').value,
    "Original test song",
  );
  const before = new w.Event("beforeunload", { cancelable: true });
  w.dispatchEvent(before);
  assert(before.defaultPrevented);
  assert(button("Add saved arrangement to service").matches(":disabled"));
  fail = true;
  await click("Save song");
  assert(
    d
      .querySelector('.song-library [role="alert"]')
      .textContent.includes("Song disk failure"),
  );
  assert.equal(
    d.querySelector('[aria-label="Section 1 lyrics"]').value,
    "Our original verse\n\nSecond page",
  );
  fail = false;
  await click("Save song");
  const song = database.songs.list()[0];
  assert.equal(database.songs.get(song.id).data.arrangement.length, 3);
  await click("Add saved arrangement to service");
  await tick(1100);
  const added = database.get(second).data.items.at(-1);
  assert.equal(added.title, "Original test song");
  assert.equal(added.slides.length, 4);
  assert.equal(screenText(), "Second slide");
  await edit('[aria-label="Section 1 lyrics"]', "Revised library lyrics");
  await click("Save song");
  assert.equal(
    database.get(second).data.items.at(-1).slides[0].text,
    "Our original verse",
  );
  assert.equal(screenText(), "Second slide");
  await edit('[aria-label="Song title"]', "Discard me");
  await click("Discard song edits");
  await click("Confirm discard");
  assert.equal(
    d.querySelector('[aria-label="Song title"]').value,
    "Original test song",
  );
  await click("Duplicate song");
  assert.equal(database.songs.list().length, 2);
  await click("Move song to bin");
  await click("Confirm move song");
  await click("Song recycle bin");
  await click("Restore song");
  assert.equal(database.songs.list().filter((s) => s.deletedAt).length, 0);
  await edit('[aria-label="Search songs"]', "Revised library lyrics");
  assert.equal(d.querySelectorAll(".song-row").length, 2);
  await edit('[aria-label="Search songs"]', "not present anywhere");
  assert.equal(d.querySelectorAll(".song-row").length, 0);
  await click("Slides");
  await click("Take Live → Audience");
  assert.equal(screenText(), "Our original verse");
  await click("Close audience");
  assert.equal(live.state.status, "closed");
  await click("Open audience · black");
  await tick(100);
  assert.equal(screenText(), "");
  assert(live.state.blackout);
  assert.equal(live.state.slide, null);
  live.displayChanged(2);
  await tick();
  assert.equal(live.state.status, "closed");
  assert(button("Take Live → Audience").matches(":disabled"));
  await click("Bible");
  await click("Import Bible JSON");
  await tick(100);
  assert.equal(database.bible.list().length, 1);
  await edit('[aria-label="Search Bible"]', "John 3:16-17");
  d.querySelector(".bible-search").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true }),
  );
  await tick();
  assert.equal(d.querySelectorAll(".bible-results article").length, 2);
  await edit('[aria-label="Last verse"]', "17");
  await click("Add passage to service");
  await tick(1100);
  assert(d.querySelector(".slide-deck").textContent.includes("John 3:16-17"));
  await click("Open audience · black");
  await tick(100);
  await click("Take Live → Audience");
  assert(screenText().includes("John 3:16 · TEST"));
  await edit('[aria-label="Search Bible"]', "Second");
  d.querySelector(".bible-search").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true }),
  );
  await tick();
  assert.equal(d.querySelectorAll(".bible-results article").length, 1);
  assert(screenText().includes("John 3:16 · TEST"));
  console.log(
    "PASS: Bible import, reference and keyword search, passage insertion, saved service and immutable audience snapshot.",
  );
  console.log(
    "PASS: Phase 5 song editor, arrangement, save failure, dirty close guard, tab persistence, independent service insertion, discard, duplicate/recycle/restore, lyric search, live projection; all Phase 4 dual-renderer and SQLite regression scenarios.",
  );
} finally {
  live.stop();
  operator.window.close();
  database.close();
  fs.rmSync(folder, { recursive: true, force: true });
}

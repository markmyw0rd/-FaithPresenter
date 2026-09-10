import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { createRequire } from "node:module";
import { EventEmitter } from "node:events";
import { execFileSync } from "node:child_process";
const require = createRequire(import.meta.url),
  { ServiceDatabase } = require("../src/desktop/database"),
  { LiveOutput } = require("../src/desktop/live");
const root = path.resolve(import.meta.dirname, ".."),
  dist = path.join(root, "dist/renderer"),
  out = path.join(root, "out/phase8-visual");
fs.mkdirSync(out, { recursive: true });
const folder = fs.mkdtempSync(path.join(os.tmpdir(), "faith8-visual-")),
  db = new ServiceDatabase(folder);
execFileSync("ffmpeg", [
  "-v",
  "error",
  "-y",
  "-f",
  "lavfi",
  "-i",
  "color=c=0x443375:s=640x360:r=20",
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=440:sample_rate=48000",
  "-t",
  "10",
  "-c:v",
  "libvpx",
  "-b:v",
  "200k",
  "-c:a",
  "libopus",
  path.join(folder, "demo.webm"),
]);
execFileSync("ffmpeg", [
  "-v",
  "error",
  "-y",
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=220:sample_rate=44100",
  "-t",
  "10",
  path.join(folder, "demo.wav"),
]);
execFileSync("ffmpeg", [
  "-v",
  "error",
  "-y",
  "-f",
  "lavfi",
  "-i",
  "color=c=0x155e75:s=640x360",
  "-frames:v",
  "1",
  path.join(folder, "demo.png"),
]);
const video = await db.media.importFile(path.join(folder, "demo.webm")),
  audio = await db.media.importFile(path.join(folder, "demo.wav")),
  image = await db.media.importFile(path.join(folder, "demo.png"));
let active = db.bootstrap().active;
active = db.save(active.id, active.version, {
  ...active.data,
  title: "Sunday gathering · Demonstration",
  items: [
    {
      id: "video",
      title: "Welcome video",
      slides: [
        {
          id: "v1",
          text: "WELCOME\nVideo demonstration",
          theme: "plain",
          presentation: { media: { id: video.id, kind: "video" } },
        },
      ],
    },
    {
      id: "audio",
      title: "Reflection audio",
      slides: [
        {
          id: "a1",
          text: "A MOMENT OF REFLECTION",
          theme: "ocean",
          presentation: { media: { id: audio.id, kind: "audio" } },
        },
      ],
    },
    {
      id: "ann",
      title: "This week",
      slides: [
        {
          id: "n1",
          text: "WELCOME TO OUR COMMUNITY",
          theme: "plain",
          presentation: { media: { id: image.id, kind: "image" } },
        },
        { id: "n2", text: "CONNECT AFTER THE SERVICE", theme: "violet" },
      ],
    },
  ],
});
const server = http.createServer(async (req, res) => {
  try {
    const name = new URL(req.url, "http://localhost").pathname;
    if (name.startsWith("/media/")) {
      const response = await db.media.response(
        new Request("faith://media/" + name.split("/").at(-1), {
          method: req.method,
          headers: req.headers,
        }),
      );
      res.writeHead(response.status, Object.fromEntries(response.headers));
      if (response.body) Readable.fromWeb(response.body).pipe(res);
      else res.end();
      return;
    }
    const file = path.resolve(dist, "." + name);
    if (!file.startsWith(dist + path.sep) || !fs.existsSync(file)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.setHeader(
      "Content-Type",
      file.endsWith(".js")
        ? "text/javascript"
        : file.endsWith(".css")
          ? "text/css"
          : "text/html",
    );
    res.end(
      file.endsWith(".js")
        ? fs
            .readFileSync(file, "utf8")
            .replaceAll("faith://media/", origin + "/media/")
        : fs.readFileSync(file),
    );
  } catch (e) {
    res.writeHead(500);
    res.end(String(e));
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = "http://127.0.0.1:" + server.address().port;
const mod = process.env.FAITH_VISUAL_BROWSER_MODULE
  ? (await import(process.env.FAITH_VISUAL_BROWSER_MODULE)).default
  : null;
const browser = await chromium.launch(
  mod
    ? {
        executablePath: await mod.executablePath(),
        args: [...mod.args, "--autoplay-policy=no-user-gesture-required"],
      }
    : { headless: true, args: ["--autoplay-policy=no-user-gesture-required"] },
);
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let audience = null;
const live = new LiveOutput({
  displays: () => [{ id: 1, label: "Windowed test" }],
  primary: () => 1,
  notify: (state) => {
    void page.evaluate((s) => window.__live?.(s), state).catch(() => {});
  },
  createWindow: () => {
    const win = new EventEmitter();
    win.webContents = new EventEmitter();
    win.webContents.send = (_c, s) => {
      void audience?.evaluate((s) => window.__audience?.(s), s).catch(() => {});
    };
    win.isDestroyed = () => false;
    win.destroy = () => {
      void audience?.close();
      audience = null;
    };
    win.loadURL = async () => {
      audience = await browser.newPage();
      audience.on("pageerror", (e) => errors.push(e.message));
      await audience.exposeFunction("__snapshot", () => live.snapshot());
      await audience.exposeFunction("__ack", (r) => live.acknowledge(r));
      await audience.exposeFunction("__error", (id) => live.mediaFailed(id));
      await audience.exposeFunction("__ended", (id, at, pos) =>
        live.mediaEnded(id, at, pos),
      );
      await audience.addInitScript(() => {
        window.faithAudience = {
          reportMediaEnded: (id, at, pos) => window.__ended(id, at, pos),
          getState: () => window.__snapshot(),
          acknowledge: (r) => window.__ack(r),
          reportMediaError: (id) => window.__error(id),
          onState: (fn) => {
            window.__audience = fn;
            return () => {};
          },
        };
      });
      await audience.goto(origin + "/audience.html");
    };
    return win;
  },
});
const methods = {
  renderDiagnostics: () => ({gpu:{gpu_compositing:"enabled",video_decode:"enabled",webgl:"enabled"},compositor:"enabled",note:"Synthetic browser fixture; native status is read from Electron in the packaged app."}),
  streamState: () => ({sequence:0,revision:0,appliedRevision:-1,status:"closed",slide:null,serviceId:"",serviceTitle:"",mode:"slide",church:"",blackout:true,message:"Stream feed closed"}),
  openStream: () => ({sequence:1,revision:1,appliedRevision:1,status:"ready",slide:null,serviceId:"",serviceTitle:"",mode:"slide",church:"",blackout:true,message:"Clean feed ready for OBS window capture"}),
  stopStream: () => ({sequence:2,revision:2,appliedRevision:-1,status:"closed",slide:null,serviceId:"",serviceTitle:"",mode:"slide",church:"",blackout:true,message:"Stream feed closed"}),
  streamCommand: (_action,value) => ({sequence:3,revision:3,appliedRevision:3,status:"ready",slide:value?.slide||null,serviceId:value?.serviceId||"",serviceTitle:value?.serviceTitle||"",mode:"slide",church:"",blackout:false,message:"Clean feed ready for OBS window capture"}),
  info: () => ({
    version: "0.8.0",
    platform: "browser test",
    dataPath: folder,
  }),
  readSettings: () => ({
    schemaVersion: 1,
    churchName: "Grace Community · Demo",
    displayId: 1,
  }),
  displays: () => [
    { id: 1, label: "Windowed test", width: 1920, height: 1080, primary: true },
  ],
  bootstrap: () => db.bootstrap(),
  listServices: () => db.list(),
  saveService: (...a) => db.save(...a),
  openService: (id) => db.open(id),
  listThemes: () => db.themes.list(),
  listSongs: () => db.songs.list(),
  listBibles: () => db.bible.list(),
  listMedia: () => db.media.list(),
  liveState: () => live.snapshot(),
  openLive: (id) => live.open(id),
  stopLive: () => live.stop(),
  liveCommand: (a, v) => live.command(a, v),
  stageState: () => ({sequence:0,status:"closed",displayId:null,displayLabel:"",windowed:false,current:"",next:"",message:"",countdownEnd:null,showClock:true,notice:"Stage output closed"}),
  openStage: () => { throw Error("Stage window is covered by the Phase 9 stage visual test."); },
  stopStage: () => ({sequence:1,status:"closed",displayId:null,displayLabel:"",windowed:false,current:"",next:"",message:"",countdownEnd:null,showClock:true,notice:"Stage output closed"}),
  stageCommand: () => { throw Error("Open stage output first."); },
};
await page.exposeFunction("__call", (name, args) => {
  if (!methods[name]) throw Error("Missing test bridge " + name);
  return methods[name](...args);
});
await page.addInitScript((names) => {
  const api = {};
  for (const name of names) api[name] = (...args) => window.__call(name, args);
  api.onLiveState = (fn) => {
    window.__live = fn;
    return () => {};
  };
  api.onStageState = () => () => {};
  api.onStreamState = () => () => {};
  api.onDisplaysChanged = () => () => {};
  window.faithDesktop = api;
}, Object.keys(methods));
try {
  await page.goto(origin + "/index.html");
  await page
    .getByRole("button", { name: "Open audience · black", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Take Live → Audience", exact: true })
    .waitFor();
  await page.waitForFunction(
    () =>
      !Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Take Live"),
      ).disabled,
  );
  await page
    .getByRole("button", { name: "Take Live → Audience", exact: true })
    .click();
  await audience.waitForFunction(
    () => document.querySelector("video")?.currentTime > 0.2,
  );
  assert(await audience.locator("video").evaluate((el) => el.muted));
  await page.getByRole("button", { name: "Unmute audio", exact: true }).click();
  await audience.waitForFunction(
    () => document.querySelector("video")?.muted === false,
  );
  await page.getByLabel("Live volume").evaluate((el) => {
    el.value = ".3";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await audience.waitForFunction(
    () => Math.abs(document.querySelector("video").volume - 0.3) < 0.01,
  );
  assert(
    await page.locator("video").evaluateAll((v) => v.every((el) => el.muted)),
  );
  await page.getByRole("button", { name: "Pause media", exact: true }).click();
  await audience.waitForFunction(() => document.querySelector("video").paused);
  await page.getByLabel("Live media position").evaluate((el) => {
    el.value = "4";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await audience.waitForFunction(
    () => Math.abs(document.querySelector("video").currentTime - 4) < 0.2,
  );
  await page.getByRole("tab", { name: "Media", exact: true }).click();
  await page.locator(".dock-content").evaluate((el) => (el.scrollTop = 0));
  await page.screenshot({
    path: path.join(out, "FaithPresenter-Phase-8-Media.png"),
  });
  await page.getByRole("button", { name: "Blackout", exact: true }).click();
  await audience.waitForFunction(
    () =>
      document.querySelector("video").paused &&
      document.querySelector("video").muted,
  );
  await page
    .locator(".schedule-item")
    .filter({ hasText: "Reflection audio" })
    .click();
  await page
    .getByRole("button", { name: "Take Live → Audience", exact: true })
    .click();
  await audience.waitForFunction(
    () => document.querySelector("audio")?.currentTime > 0.2,
  );
  assert(await audience.locator("audio").evaluate((el) => el.muted));
  await page.getByRole("button", { name: "Unmute audio", exact: true }).click();
  await audience.waitForFunction(() => !document.querySelector("audio").muted);
  await page.getByRole("button", { name: "Pause media", exact: true }).click();
  await audience.waitForFunction(() => document.querySelector("audio").paused);
  assert(
    await page
      .locator("audio")
      .evaluateAll((list) => list.every((el) => el.muted)),
  );
  await page.getByLabel("Live media position").evaluate((el) => {
    el.value = "9.8";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.getByRole("button", { name: "Play media", exact: true }).click();
  await audience.waitForFunction(() => document.querySelector("audio").ended);
  await page.getByRole("button", { name: "Play media", exact: true }).waitFor();
  assert.equal(live.state.playback.playing, false);
  await page.locator(".schedule-item").filter({ hasText: "This week" }).click();
  await page.getByRole("tab", { name: "Announcements", exact: true }).click();
  await page.getByLabel("Announcement interval").fill("2");
  await page
    .getByRole("button", { name: "Start announcements live", exact: true })
    .click();
  await audience.waitForFunction(() =>
    document
      .querySelector(".surface-text")
      .textContent.includes("WELCOME TO OUR COMMUNITY"),
  );
  await audience.waitForFunction(
    () =>
      document
        .querySelector(".surface-text")
        .textContent.includes("CONNECT AFTER"),
    {},
    { timeout: 7000 },
  );
  await page
    .locator(".announcement-panel")
    .getByRole("button", { name: "Stop announcements", exact: true })
    .click();
  assert.equal(live.state.slideshow.running, false);
  await page.screenshot({
    path: path.join(out, "FaithPresenter-Phase-8-Announcements.png"),
  });
  for (const width of [960, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    assert(
      await page
        .getByRole("button", { name: "Blackout", exact: true })
        .isVisible(),
    );
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("tab", { name: "Outputs", exact: true }).click();
  await page.getByText("Composition & outputs", { exact: true }).waitFor();
  assert.equal(await page.locator(".adapter-ready").count(), 4);
  assert(await page.getByText("NDI", { exact: true }).isVisible());
  assert(await page.getByText("SDI", { exact: true }).isVisible());
  await page.locator(".dock-content").evaluate((el) => { el.scrollTop = 230; });
  await page.screenshot({ path: path.join(out, "FaithPresenter-Phase-10-Pipeline.png") });
  await page.getByRole("tab", { name: "Stream", exact: true }).click();
  await page.getByRole("button", { name: "Open OBS clean feed · black", exact: true }).click();
  await page.getByRole("button", { name: "Take to Stream →", exact: true }).click();
  await page.screenshot({ path: path.join(out, "FaithPresenter-Phase-11-Stream.png") });
  await page.getByRole("tab", { name: "Production", exact: true }).click();
  await page.locator(".dock-content").evaluate((el) => { el.scrollTop = 0; });
  await page.getByText("Cues, transitions & shortcuts", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Take to Audience + Stream", exact: true }).click();
  await page.locator(".production-log tbody tr").waitFor();
  assert.match(await page.locator(".production-log tbody tr").textContent(), /applied/);
  assert.equal(await page.locator(".production-health article.healthy").count(), 1);
  await page.locator(".dock-content").evaluate((el) => { el.scrollTop = 0; });
  await page.getByLabel("Arm production shortcuts for this session").check();
  await page.getByText("ARMED — shortcuts are active outside text fields.", { exact: true }).waitFor();
  await page.screenshot({ path: path.join(out, "FaithPresenter-Phase-13-Production.png") });
  await page.getByRole("tab", { name: "Run show", exact: true }).click();
  await page.getByText("Service cue queue", { exact: true }).waitFor();
  const beforeCue = await page.locator(".now-next strong").first().textContent();
  await page.locator(".show-go").click();
  await page.getByText(/COMPLETE$/).waitFor();
  await page.waitForFunction(value=>document.querySelector('.now-next strong')?.textContent!==value,beforeCue);
  await page.screenshot({ path: path.join(out, "FaithPresenter-Phase-14-Run-Of-Show.png") });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: Real Chromium media decoding, audience-only sound state, mute/volume, pause and seek, audio, blackout, timed announcements and 960/1440 layout. Physical speakers/projector not tested.",
  );
} finally {
  live.stop();
  await browser.close();
  await new Promise((r) => server.close(r));
  db.close();
  fs.rmSync(folder, { recursive: true, force: true });
}

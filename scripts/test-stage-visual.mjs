import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const root = path.resolve(import.meta.dirname, ".."),
  dist = path.join(root, "dist/renderer"),
  out = path.join(root, "out/phase9-visual");
fs.mkdirSync(out, { recursive: true });
const server = http.createServer((req, res) => {
  const file = path.resolve(
    dist,
    "." + new URL(req.url, "http://localhost").pathname,
  );
  if (!file.startsWith(dist + path.sep) || !fs.existsSync(file)) {
    res.writeHead(404);
    return res.end();
  }
  res.setHeader(
    "Content-Type",
    file.endsWith(".js")
      ? "text/javascript"
      : file.endsWith(".css")
        ? "text/css"
        : "text/html",
  );
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = "http://127.0.0.1:" + server.address().port,
  mod = (await import(process.env.FAITH_VISUAL_BROWSER_MODULE)).default,
  browser = await chromium.launch({
    executablePath: await mod.executablePath(),
    args: mod.args,
  });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const state = {
  sequence: 1,
  status: "ready",
  displayId: 2,
  displayLabel: "Stage monitor",
  windowed: false,
  current: "AMAZING GRACE\nHOW SWEET THE SOUND",
  next: "THAT SAVED A WRETCH LIKE ME",
  message: "Worship team: repeat the chorus",
  countdownEnd: Date.now() + 5 * 60000,
  showClock: true,
  notice: "Stage display ready",
};
await page.addInitScript((s) => {
  window.faithStage = { getState: async () => s, onState: () => () => {} };
}, state);
await page.goto(origin + "/stage.html");
await page.getByText("AMAZING GRACE").waitFor();
assert(await page.getByText("THAT SAVED A WRETCH LIKE ME").isVisible());
assert(await page.getByText("Worship team: repeat the chorus").isVisible());
assert(await page.locator("time").isVisible());
assert.match(await page.locator("output").textContent(), /^(05:00|04:5\d)$/);
await page.screenshot({
  path: path.join(out, "FaithPresenter-Phase-9-Stage.png"),
});
assert.deepEqual(errors, []);
await browser.close();
await new Promise((r) => server.close(r));
console.log(
  "PASS: Stage display renders current/next lyrics, clock, countdown and private message at 1280×720.",
);

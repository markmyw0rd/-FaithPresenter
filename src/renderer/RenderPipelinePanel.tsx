import React, { useEffect, useMemo, useState } from "react";
import type { Slide } from "./workspace-model";
import { composeFrame, outputAdapters } from "./render-pipeline";
import "./render-pipeline.css";

type Diagnostics = { gpu: Record<string, string>; compositor: string; note: string };

export default function RenderPipelinePanel({ preview, live }: { preview: Slide | null; live: Slide | null }) {
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [error, setError] = useState("");
  const previewFrame = useMemo(() => composeFrame(preview), [preview]);
  const liveFrame = useMemo(() => composeFrame(live), [live]);
  useEffect(() => {
    let active = true;
    const request = window.faithDesktop?.renderDiagnostics?.();
    if (!request) setError("Graphics status is unavailable in this preview environment.");
    else request.then((value) => active && setDiagnostics(value)).catch(() => active && setError("Graphics status is unavailable in this preview environment."));
    return () => { active = false; };
  }, []);
  const gpuStatus = diagnostics?.compositor || "checking";
  return <div className="render-pipeline-panel">
    <header><div><small>SHARED FRAME PIPELINE</small><h2>Composition & outputs</h2></div><span className={`compositor-status status-${gpuStatus}`}>● {gpuStatus === "enabled" ? "GPU compositor" : gpuStatus === "disabled" ? "Software fallback" : "Checking graphics"}</span></header>
    <div className="pipeline-flow" aria-label="Rendering pipeline">
      <div><b>01</b><strong>Slide objects</strong><small>Text box + layout</small></div><i>→</i>
      <div><b>02</b><strong>Theme</strong><small>Type + colour</small></div><i>→</i>
      <div><b>03</b><strong>Media</strong><small>Image / video</small></div><i>→</i>
      <div><b>04</b><strong>Layer composition</strong><small>Ordered scene</small></div><i>→</i>
      <div><b>05</b><strong>Chromium compositor</strong><small>GPU when available</small></div><i>→</i>
      <div className="frame-node"><b>06</b><strong>Output frame</strong><small>1920 × 1080</small></div>
    </div>
    <div className="frame-inspector">
      <section><h3>Preview frame <code>{previewFrame.frameId}</code></h3>{previewFrame.layers.map(layer => <p key={layer.id} className={layer.enabled ? "enabled" : "disabled"}><span>●</span><b>{layer.label}</b><small>{layer.detail}</small></p>)}</section>
      <section><h3>Live snapshot <code>{live ? liveFrame.frameId : "not-taken"}</code></h3><p className="snapshot-note">{live ? "Detached from current edits. Press Take Live to publish a new snapshot." : "No frame has been taken to Audience yet."}</p><details><summary>Graphics diagnostics</summary><p>{diagnostics?.note || error || "Reading Chromium feature status…"}</p>{diagnostics && <ul>{Object.entries(diagnostics.gpu).slice(0, 8).map(([key, value]) => <li key={key}><span>{key}</span><code>{value}</code></li>)}</ul>}</details></section>
    </div>
    <h3 className="adapters-title">Output adapters</h3>
    <div className="adapter-grid">{outputAdapters.map(adapter => <article key={adapter.id} className={`adapter adapter-${adapter.status}`}><span>{adapter.status === "ready" ? "ACTIVE" : "PLANNED"}</span><strong>{adapter.name}</strong><p>{adapter.detail}</p></article>)}</div>
    <p className="pipeline-warning">Livestream provides a local clean feed for OBS; encoding and uploading remain in OBS. NDI and SDI transmission are not active and still require native SDKs and compatible hardware.</p>
  </div>;
}

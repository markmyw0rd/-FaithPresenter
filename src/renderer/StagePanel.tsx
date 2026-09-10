import React, { useEffect, useState } from "react";
import type { Slide } from "./workspace-model";
import type { StageState } from "./stage-types";
export default function StagePanel({
  current,
  next,
}: {
  current: Slide | null;
  next: Slide | null;
}) {
  const api = window.faithDesktop!;
  const [state, setState] = useState<StageState | null>(null),
    [screens, setScreens] = useState<Display[]>([]),
    [displayId, setDisplayId] = useState(""),
    [message, setMessage] = useState(""),
    [minutes, setMinutes] = useState(5),
    [error, setError] = useState("");
  const open = state?.status === "ready";
  useEffect(() => {
    void Promise.all([api.stageState(), api.displays()])
      .then(([s, d]) => {
        setState(s);
        setScreens(d);
        setDisplayId(s.displayId ? String(s.displayId) : "");
      })
      .catch((e) => setError(String(e)));
    return api.onStageState(setState);
  }, []);
  useEffect(() => {
    if (open)
      void api
        .stageCommand("content", {
          current: current?.text || "",
          next: next?.text || "",
        })
        .catch((e) => setError(String(e)));
  }, [open, current?.id, current?.text, next?.id, next?.text]);
  async function act(fn: () => Promise<StageState>) {
    setError("");
    try {
      setState(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }
  return (
    <div className="stage-panel">
      <div className="stage-panel-title">
        <div>
          <strong>STAGE DISPLAY</strong>
          <small>
            {open
              ? state?.windowed
                ? "WINDOWED TEST"
                : "CONNECTED"
              : "OFF AIR"}
          </small>
        </div>
        <p>
          Current and next lyrics, clock, countdown and private team messages.
          Audience output remains independent.
        </p>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="stage-setup">
        <select
          aria-label="Stage display"
          value={displayId}
          disabled={open}
          onChange={(e) => setDisplayId(e.target.value)}
        >
          <option value="">Choose stage display</option>
          {screens.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label} · {d.width}×{d.height}
              {d.primary ? " · Primary windowed test" : " · Fullscreen"}
            </option>
          ))}
        </select>
        <button
          disabled={open || !displayId}
          onClick={() => void act(() => api.openStage(Number(displayId)))}
        >
          Open stage · black
        </button>
        <button
          disabled={!open}
          onClick={() => void act(() => api.stopStage())}
        >
          Close stage
        </button>
      </div>
      <div className="stage-preview">
        <section>
          <small>CURRENT</small>
          <b>{current?.text || "Select a slide"}</b>
        </section>
        <section>
          <small>NEXT</small>
          <b>{next?.text || "End of service item"}</b>
        </section>
      </div>
      <div className="stage-actions">
        <label>
          Private message
          <input
            aria-label="Stage message"
            maxLength={240}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Worship team only"
          />
        </label>
        <button
          disabled={!open}
          onClick={() => void act(() => api.stageCommand("message", message))}
        >
          Send message
        </button>
        <button
          disabled={!open}
          onClick={() => {
            setMessage("");
            void act(() => api.stageCommand("message", ""));
          }}
        >
          Clear message
        </button>
        <label>
          Countdown minutes
          <input
            aria-label="Stage countdown minutes"
            type="number"
            min="1"
            max="180"
            value={minutes}
            onChange={(e) =>
              setMinutes(Math.max(1, Math.min(180, +e.target.value || 1)))
            }
          />
        </label>
        <button
          disabled={!open}
          onClick={() =>
            void act(() =>
              api.stageCommand("timer", Date.now() + minutes * 60000),
            )
          }
        >
          Start countdown
        </button>
        <button
          disabled={!open}
          onClick={() => void act(() => api.stageCommand("timer", null))}
        >
          Clear timer
        </button>
        <label className="stage-clock">
          <input
            type="checkbox"
            checked={state?.showClock ?? true}
            disabled={!open}
            onChange={(e) =>
              void act(() => api.stageCommand("clock", e.target.checked))
            }
          />
          Show clock
        </label>
      </div>
      <small>
        Press Esc on the stage screen to close it. Choose a display different
        from Audience for a real multi-screen rehearsal.
      </small>
    </div>
  );
}

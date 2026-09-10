import Announcements from "./Announcements";
import BibleLibrary from "./BibleLibrary";
import React, { useEffect, useRef, useState } from "react";
import {
  newItem,
  newSlide,
  sample,
  moveItem,
  WorkspaceData,
  Slide,
  Theme,
} from "./workspace-model";
import { useServiceStorage } from "./useServiceStorage";
import { useLive } from "./useLive";
import SlideSurface from "./SlideSurface";
import LiveToolbar from "./LiveToolbar";
import ServiceLibrary from "./ServiceLibrary";
import SongLibrary from "./SongLibrary";
import "./workspace.css";
import "./storage.css";
import "./studio.css";
import "./enhancements.css";
import {
  SectionEditor,
  MediaLibrary,
  Transport,
  TimerPanel,
} from "./Enhancements";
import StyleEditor from "./StyleEditor";
import ThemeLibrary from "./ThemeLibrary";
import { defaultStyle } from "./style-model";
import type { SlideStyle } from "./workspace-model";
import type { Presentation } from "./workspace-model";
import "./reference-layout.css";
import "./production-layout.css";
import StagePanel from "./StagePanel";
import RenderPipelinePanel from "./RenderPipelinePanel";
import StreamPanel from "./StreamPanel";
import ProductionPanel from "./ProductionPanel";
import RunOfShowPanel from "./RunOfShowPanel";

function Frame({ slide }: { slide: Slide | null }) {
  return <SlideSurface slide={slide} thumbnail />;
}
export default function Workspace({
  church,
  onNavigate = () => {},
}: {
  church: string;
  onNavigate?: (page: string) => void;
}) {
  const storage = useServiceStorage();
  const { data, ready, dirty, busy, notice, error } = storage;
  const output = useLive();
  const [itemId, setItemId] = useState(""),
    [slideId, setSlideId] = useState("");
  const [tab, setTab] = useState("Slides"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(false),
    [allSlides, setAllSlides] = useState(false),
    [manager, setManager] = useState(false),
    [expanded, setExpanded] = useState(false),
    [thumb, setThumb] = useState(180);
  const [lyricsOnly, setLyricsOnly] = useState(false),
    [time, setTime] = useState(0),
    [duration, setDuration] = useState(0),
    [mediaError, setMediaError] = useState(""),
    [previewError, setPreviewError] = useState("");
  const [styleClipboard, setStyleClipboard] = useState<{
    style: SlideStyle;
    theme: Theme;
  } | null>(null);
  const [history, setHistory] = useState<WorkspaceData[]>([]);
  const latest = useRef({
    data,
    serviceId: storage.serviceId,
    switching: storage.switching,
  });
  latest.current = {
    data,
    serviceId: storage.serviceId,
    switching: storage.switching,
  };
  const searchRef = useRef<HTMLInputElement>(null);
  const item = data.items.find((i) => i.id === itemId),
    slide = item?.slides.find((s) => s.id === slideId) || null;
  const flat = data.items.flatMap((i) =>
    i.slides.map((s) => ({ ...s, itemTitle: i.title, itemId: i.id })),
  );
  const selectedIndex = flat.findIndex((s) => s.id === slideId);
  const live =
    output.state?.serviceId === storage.serviceId ? output.state.slide : null;
  const groups = allSlides ? data.items : item ? [item] : [];
  useEffect(() => {
    setItemId(data.items[0]?.id || "");
    setSlideId(data.items[0]?.slides[0]?.id || "");
    setHistory([]);
  }, [storage.generation]);
  function change(next: WorkspaceData) {
    setHistory((h) => [...h.slice(-29), structuredClone(data)]);
    storage.update(next);
  }
  function choose(id: string, sid?: string) {
    const next = data.items.find((i) => i.id === id);
    setItemId(id);
    setSlideId(sid || next?.slides[0]?.id || "");
  }
  useEffect(() => setPreviewError(""), [slide?.presentation?.media?.id]);
  useEffect(() => {
    setTime(0);
    setDuration(0);
    setMediaError("");
  }, [output.state?.slide?.presentation?.media?.id]);
  useEffect(() => {
    const jump = (event: KeyboardEvent) => {
      if (
        !document.querySelector(".studio-workspace")?.getClientRects().length ||
        !event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.repeat ||
        !ready ||
        storage.switching ||
        manager ||
        !item
      )
        return;
      if (
        (event.target as HTMLElement)?.closest(
          "input,textarea,select,[contenteditable=true]",
        )
      )
        return;
      const found = item.slides.find(
        (s) => s.presentation?.shortcut === event.key.toUpperCase(),
      );
      if (found) {
        event.preventDefault();
        setSlideId(found.id);
      }
    };
    window.addEventListener("keydown", jump);
    return () => window.removeEventListener("keydown", jump);
  }, [item, ready, storage.switching, manager]);
  function presentation(p: Presentation, whole = false) {
    if (!slide || !item) return;
    change({
      ...data,
      items: data.items.map((i) =>
        i.id !== item.id
          ? i
          : {
              ...i,
              slides: i.slides.map((s) =>
                whole
                  ? {
                      ...s,
                      presentation: { ...s.presentation, media: p.media },
                    }
                  : s.id === slide.id
                    ? { ...s, presentation: p }
                    : s,
              ),
            },
      ),
    });
  }
  function edit(text: string) {
    if (!item || !slide) return;
    change({
      ...data,
      items: data.items.map((i) =>
        i.id !== item.id
          ? i
          : {
              ...i,
              slides: i.slides.map((s) =>
                s.id === slide.id ? { ...s, text } : s,
              ),
            },
      ),
    });
  }
  function addItem() {
    const next = newItem();
    change({ ...data, items: [...data.items, next] });
    chooseNew(next.id, next.slides[0].id);
  }
  function chooseNew(id: string, sid: string) {
    setItemId(id);
    setSlideId(sid);
  }
  function addSlide() {
    if (!item) return;
    const next = newSlide();
    change({
      ...data,
      items: data.items.map((i) =>
        i.id === item.id ? { ...i, slides: [...i.slides, next] } : i,
      ),
    });
    setSlideId(next.id);
  }
  function applyStyle(
    style: SlideStyle | undefined,
    background: Theme = slide?.theme || "plain",
    whole = false,
  ) {
    if (!slide || !item) return;
    change({
      ...data,
      items: data.items.map((i) =>
        i.id !== item.id
          ? i
          : {
              ...i,
              slides: i.slides.map((s) =>
                whole || s.id === slide.id
                  ? {
                      ...s,
                      theme: background,
                      presentation: {
                        ...s.presentation,
                        style: style ? structuredClone(style) : undefined,
                      },
                    }
                  : s,
              ),
            },
      ),
    });
  }
  function theme(value: Theme) {
    if (!slide || !item) return;
    change({
      ...data,
      items: data.items.map((i) =>
        i.id !== item.id
          ? i
          : {
              ...i,
              slides: i.slides.map((s) =>
                s.id === slide.id ? { ...s, theme: value } : s,
              ),
            },
      ),
    });
  }
  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory(history.slice(0, -1));
    storage.update(previous);
    chooseNew(
      previous.items[0]?.id || "",
      previous.items[0]?.slides[0]?.id || "",
    );
  }
  function take() {
    if (slide)
      void output.command("take", {
        slide,
        serviceId: storage.serviceId,
        serviceTitle: data.title,
      });
  }
  function step(delta: number) {
    const s = flat[selectedIndex + delta];
    if (s) choose(s.itemId, s.id);
  }
  function resource(name: string) {
    setTab(name);
    if (
      [
        "Songs",
        "Design",
        "Themes",
        "Bible",
        "Media",
        "Announcements",
        "Stage",
        "Outputs",
        "Stream",
        "Production",
        "Run show",
      ].includes(name)
    )
      setExpanded(true);
  }
  async function addSong(id: string, version: number) {
    const before = latest.current;
    if (before.switching || !ready)
      throw Error("Wait for the service to finish loading.");
    if (before.data.items.length >= 100)
      throw Error("This service already has 100 items.");
    const next = await window.faithDesktop!.buildSong(id, version);
    if (
      latest.current.data !== before.data ||
      latest.current.serviceId !== before.serviceId ||
      latest.current.switching
    )
      throw Error("Service changed while adding. Try again.");
    change({ ...data, items: [...data.items, next] });
    chooseNew(next.id, next.slides[0]?.id || "");
  }
  async function addBible(
    id: string,
    book: string,
    chapter: number,
    start: number,
    end: number,
  ) {
    const before = latest.current;
    if (before.switching || !ready)
      throw Error("Wait for the service to load.");
    if (before.data.items.length >= 100)
      throw Error("Service already has 100 items.");
    const next = await window.faithDesktop!.buildBible(
      id,
      book,
      chapter,
      start,
      end,
    );
    if (
      latest.current.data !== before.data ||
      latest.current.serviceId !== before.serviceId ||
      latest.current.switching
    )
      throw Error("Service changed while adding. Try again.");
    change({ ...before.data, items: [...before.data.items, next] });
    chooseNew(next.id, next.slides[0]?.id || "");
  }
  return (
    <div
      className={`studio-workspace ${expanded ? "dock-expanded" : ""} ${tab === "Design" ? "design-mode" : ""}`}
      style={{ "--thumb": `${thumb}px` } as React.CSSProperties}
    >
      <div className="studio-topbar">
        <div className="studio-brand">
          <span>✦</span>
          <div>
            FaithPresenter<small>CHURCH PRESENTATION</small>
          </div>
        </div>
        <div className="studio-tool-group production-tools">
          <button
            aria-label="Search resources"
            onClick={() => {
              resource("Slides");
              setTimeout(() => searchRef.current?.focus(), 0);
            }}
          >
            <span>⌕</span>Search
          </button>
          <button
            onClick={() => {
              setEditing(true);
              resource("Design");
            }}
          >
            <span>Aa</span>Text
          </button>
          <button onClick={() => resource("Themes")}>
            <span>◫</span>Theme
          </button>
          <button
            aria-label="Show"
            className={!editing ? "active" : ""}
            aria-pressed={!editing}
            onClick={() => setEditing(false)}
          >
            <span>▶</span>Show
          </button>
          <button
            aria-label="Edit"
            className={editing ? "active" : ""}
            aria-pressed={editing}
            onClick={() => {
              setEditing(true);
              resource("Design");
            }}
          >
            <span>✎</span>Edit
          </button>
          <button onClick={() => resource("Songs")}>
            <span>↕</span>Reflow
          </button>
          <button onClick={() => resource("Bible")}>
            <span>†</span>Bible
          </button>
          <button
            aria-label="Manage services"
            aria-expanded={manager}
            onClick={() => setManager(!manager)}
          >
            <span>•••</span>More
          </button>
        </div>
        <div className="studio-tool-group studio-tools-end live-top-tools">
          <button onClick={() => resource("Media")}>
            <span>▧</span>Media
          </button>
          <button onClick={() => onNavigate("Display setup")}>
            <span>●</span>Audience
          </button>
          <button onClick={() => resource("Stage")}>
            <span>●</span>Stage
          </button>
          <button onClick={() => resource("Outputs")}>
            <span>⌘</span>Outputs
          </button>
          <button onClick={() => resource("Stream")}>
            <span>◉</span>Stream
          </button>
          <button onClick={() => resource("Run show")}>
            <span>⌁</span>Control
          </button>
          <button
            disabled={!slide || output.state?.status !== "ready"}
            onClick={take}
          >
            <span>▶</span>Go Live
          </button>
          <button
            disabled={output.state?.status !== "ready"}
            onClick={() => void output.command("church", church)}
          >
            <span>◇</span>Logo
          </button>
          <button
            disabled={output.state?.status !== "ready"}
            className={output.state?.blackout ? "active" : ""}
            onClick={() => void output.command("blackout")}
          >
            <span>■</span>Black
          </button>
          <button
            disabled={output.state?.status !== "ready"}
            onClick={() => void output.command("clear")}
          >
            <span>□</span>Clear
          </button>
          <button onClick={() => onNavigate("Church settings")}>
            <span>⚙</span>Settings
          </button>
        </div>
      </div>
      <fieldset className="operator" disabled={!ready || storage.switching}>
        <section
          className="studio-rail schedule"
          aria-label="Library and service schedule"
        >
          <div className="studio-section-title">
            LIBRARY <span>LOCAL</span>
          </div>
          <button className="rail-link" onClick={() => setManager(true)}>
            ▤ &nbsp; Saved services{" "}
            <small>{storage.services.filter((s) => !s.deletedAt).length}</small>
          </button>
          <button className="rail-link" onClick={() => resource("Songs")}>
            ♫ &nbsp; Song library
          </button>
          <button className="rail-link" onClick={() => resource("Themes")}>
            ◫ &nbsp; Starter themes
          </button>
          <div className="studio-section-title">
            SERVICES{" "}
            <button
              title="Manage saved services"
              aria-label="Manage saved services"
              onClick={() => setManager(true)}
            >
              ＋
            </button>
          </div>
          <div className="rail-services">
            {storage.services
              .filter((s) => !s.deletedAt)
              .map((s) => (
                <button
                  key={s.id}
                  aria-current={s.id === storage.serviceId ? "true" : undefined}
                  disabled={s.id === storage.serviceId}
                  onClick={() => void storage.open(s.id)}
                  title={s.title}
                >
                  ▤ <span>{s.title || "Untitled service"}</span>
                </button>
              ))}
          </div>
          <div className="panel-heading">
            <h2>Service schedule</h2>
            <span>{data.items.length} ITEMS</span>
          </div>
          <input
            className="schedule-filter"
            aria-label="Filter service items"
            placeholder="Filter service items…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="schedule-list">
            {data.items
              .filter((i) =>
                i.title.toLowerCase().includes(filter.toLowerCase()),
              )
              .map((i) => (
                <button
                  className={`schedule-item ${itemId === i.id ? "selected" : ""}`}
                  key={i.id}
                  onClick={() => choose(i.id)}
                >
                  <span className="item-number">
                    {String(data.items.indexOf(i) + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <strong>{i.title || "Untitled item"}</strong>
                    <small>{i.slides.length} slides</small>
                  </span>
                </button>
              ))}
            {!data.items.length && (
              <div className="empty-panel">
                <h3>Your service starts here</h3>
                <p>Add an item or try a labelled sample.</p>
                <button
                  onClick={() => {
                    const next = sample();
                    change(next);
                    chooseNew(next.items[0].id, next.items[0].slides[0].id);
                  }}
                >
                  Load sample service
                </button>
              </div>
            )}
          </div>
          <button
            className="add-button"
            disabled={data.items.length >= 100}
            onClick={addItem}
          >
            ＋ Add service item
          </button>
          <div className="panel-actions">
            <button
              title="Move selected item up"
              disabled={!item || data.items.indexOf(item) === 0}
              onClick={() => change(moveItem(data, itemId, -1))}
            >
              ↑ Up
            </button>
            <button
              title="Move selected item down"
              disabled={
                !item || data.items.indexOf(item) === data.items.length - 1
              }
              onClick={() => change(moveItem(data, itemId, 1))}
            >
              ↓ Down
            </button>
            <button
              disabled={!item}
              onClick={() => {
                change({
                  ...data,
                  items: data.items.filter((i) => i.id !== itemId),
                });
                chooseNew("", "");
              }}
            >
              Remove
            </button>
          </div>
        </section>
        <section
          className="studio-centre slides-panel"
          aria-label="Slide workspace"
        >
          <div className="op-toolbar">
            <input
              aria-label="Service title"
              maxLength={120}
              value={data.title}
              onChange={(e) => change({ ...data, title: e.target.value })}
            />
            <span className={dirty ? "unsaved" : "saved"}>
              {!ready
                ? "Loading…"
                : busy
                  ? "Saving…"
                  : dirty
                    ? "Unsaved"
                    : "● Saved"}
            </span>
            <label className="autosave-toggle">
              <input
                type="checkbox"
                checked={storage.autosave}
                onChange={(e) => storage.setAutosave(e.target.checked)}
              />
              Autosave
            </label>
            <button disabled={!history.length} onClick={undo}>
              Undo
            </button>
            <button
              className="primary"
              disabled={busy}
              onClick={() => void storage.save()}
            >
              Save now
            </button>
          </div>
          {error && (
            <div className="alert error" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="alert success" role="status">
              {notice}
            </div>
          )}
          {storage.migration && (
            <details className="migration-banner">
              <summary>Previous draft imported</summary>
              {storage.migration}
            </details>
          )}
          <div className="deck-toolbar">
            <span>
              {allSlides
                ? "Entire service"
                : item?.title || "Select a service item"}
            </span>
            <label>
              <input
                type="checkbox"
                checked={allSlides}
                onChange={(e) => setAllSlides(e.target.checked)}
              />
              All service slides
            </label>
            <label>
              <input
                type="checkbox"
                checked={lyricsOnly}
                onChange={(e) => setLyricsOnly(e.target.checked)}
              />
              Lyrics only
            </label>
            <label className="thumbnail-control">
              Size{" "}
              <input
                aria-label="Thumbnail size"
                type="range"
                min="130"
                max="280"
                step="10"
                value={thumb}
                onChange={(e) => setThumb(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="slide-deck">
            {groups.map((group) => (
              <section
                className={`slide-group ${group.id === itemId ? "current-group" : ""}`}
                key={group.id}
              >
                <div className="group-heading">
                  <button onClick={() => choose(group.id)}>
                    ▤ &nbsp; {group.title || "Untitled item"}
                  </button>
                  <small>{group.slides.length} SLIDES</small>
                </div>
                <div className="slide-grid">
                  {group.slides.map((s, index) => (
                    <button
                      key={s.id}
                      className={`slide-card ${slideId === s.id ? "selected" : ""} ${live?.id === s.id ? "live-source-card" : ""}`}
                      aria-label={`Preview ${group.title || "Untitled item"} slide ${index + 1}`}
                      onClick={() => choose(group.id, s.id)}
                    >
                      <SlideSurface
                        slide={s}
                        thumbnail
                        lyricsOnly={lyricsOnly}
                      />
                      {s.presentation?.shortcut && (
                        <span className="jump-badge">
                          {s.presentation.shortcut}
                        </span>
                      )}
                      <span
                        className={`slide-strip section-${s.presentation?.role || "other"}`}
                      >
                        <b>{index + 1}</b>
                        <span>
                          {s.presentation?.label ||
                            s.text.split("\n")[0] ||
                            "Empty slide"}
                        </span>
                        <small>{live?.id === s.id ? "LIVE SOURCE" : ""}</small>
                      </span>
                    </button>
                  ))}
                </div>
                {!group.slides.length && (
                  <p className="deck-empty">
                    No slides in this item. Select it and use ＋ Slide.
                  </p>
                )}
              </section>
            ))}
            {!groups.length && (
              <div className="deck-welcome">
                <span>▧</span>
                <h2>Make room for the message.</h2>
                <p>
                  Select a service item on the left, or add your first slide.
                </p>
                <button onClick={() => resource("Songs")}>
                  Browse your songs →
                </button>
              </div>
            )}
          </div>
          <div className="panel-actions slide-actions">
            <button
              disabled={!item || item.slides.length >= 100}
              onClick={addSlide}
            >
              ＋ Slide
            </button>
            <button
              disabled={!slide || !item || item.slides.length >= 100}
              onClick={() => {
                if (!slide || !item) return;
                const copy = { ...slide, id: crypto.randomUUID() };
                change({
                  ...data,
                  items: data.items.map((i) =>
                    i.id === itemId ? { ...i, slides: [...i.slides, copy] } : i,
                  ),
                });
                setSlideId(copy.id);
              }}
            >
              Duplicate
            </button>
            <button
              disabled={!slide}
              onClick={() => {
                change({
                  ...data,
                  items: data.items.map((i) =>
                    i.id === itemId
                      ? {
                          ...i,
                          slides: i.slides.filter((s) => s.id !== slideId),
                        }
                      : i,
                  ),
                });
                setSlideId("");
              }}
            >
              Remove slide
            </button>
            <button
              disabled={!item || !slide || item.slides[0]?.id === slideId}
              onClick={() => {
                if (!item) return;
                const slides = [...item.slides],
                  i = slides.findIndex((s) => s.id === slideId);
                [slides[i - 1], slides[i]] = [slides[i], slides[i - 1]];
                change({
                  ...data,
                  items: data.items.map((x) =>
                    x.id === item.id ? { ...x, slides } : x,
                  ),
                });
              }}
            >
              ← Slide
            </button>
            <button
              disabled={!item || !slide || item.slides.at(-1)?.id === slideId}
              onClick={() => {
                if (!item) return;
                const slides = [...item.slides],
                  i = slides.findIndex((s) => s.id === slideId);
                [slides[i + 1], slides[i]] = [slides[i], slides[i + 1]];
                change({
                  ...data,
                  items: data.items.map((x) =>
                    x.id === item.id ? { ...x, slides } : x,
                  ),
                });
              }}
            >
              Slide →
            </button>
            <span>Single click previews · Take Live publishes</span>
          </div>
          <div className="quick-editor" hidden={!editing}>
            {item && (
              <input
                className="item-title"
                aria-label="Item title"
                maxLength={120}
                value={item.title}
                onChange={(e) =>
                  change({
                    ...data,
                    items: data.items.map((i) =>
                      i.id === itemId ? { ...i, title: e.target.value } : i,
                    ),
                  })
                }
              />
            )}{" "}
            {slide ? (
              <>
                <label htmlFor="slide-text">
                  Slide text <span>{slide.text.length}/2000</span>
                </label>
                <textarea
                  id="slide-text"
                  maxLength={2000}
                  value={slide.text}
                  onChange={(e) => edit(e.target.value)}
                />
                <small>
                  Editing updates Preview only. Take Live to update the
                  audience.
                </small>
                <details open>
                  <summary>Section label, colour and shortcut</summary>
                  <SectionEditor
                    slide={slide}
                    onChange={(p) => presentation(p)}
                  />
                </details>
              </>
            ) : (
              <p>Select a slide to edit its text.</p>
            )}
          </div>
        </section>
        <section
          className="op-panel resource-library"
          aria-label="Resource dock"
        >
          <div className="library-toolbar">
            <div role="tablist" aria-label="Resource library">
              {[
                "Slides",
                "Design",
                "Songs",
                "Bible",
                "Media",
                "Themes",
                "Timers",
                "Announcements",
                "Outputs",
                "Stream",
                "Production",
                "Run show",
              ].map((name) => (
                <button
                  key={name}
                  role="tab"
                  aria-selected={tab === name}
                  onClick={() => resource(name)}
                >
                  {name}
                </button>
              ))}
            </div>
            <input
              ref={searchRef}
              hidden={tab !== "Slides"}
              aria-label="Search draft slides"
              placeholder="Search this service…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="dock-toggle"
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Collapse dock" : "Expand dock"}
            </button>
          </div>
          <div className="dock-content">
            <div hidden={tab !== "Design"}>
              <StyleEditor
                slide={slide}
                onStyle={(s) => applyStyle(s)}
                onTheme={theme}
                onCopy={() => {
                  if (slide)
                    setStyleClipboard({
                      style: structuredClone(
                        slide.presentation?.style || defaultStyle,
                      ),
                      theme: slide.theme,
                    });
                }}
                onPaste={() => {
                  if (styleClipboard)
                    applyStyle(styleClipboard.style, styleClipboard.theme);
                }}
                canPaste={Boolean(styleClipboard)}
                itemCount={item?.slides.length || 0}
                onItem={() =>
                  applyStyle(
                    slide?.presentation?.style || defaultStyle,
                    slide?.theme,
                    true,
                  )
                }
              />
            </div>
            <div hidden={tab !== "Themes"}>
              <ThemeLibrary
                slide={slide}
                onApply={(s, t, w) => applyStyle(s, t, w)}
              />
            </div>
            <div hidden={tab !== "Bible"}>
              <BibleLibrary onAdd={addBible} />
            </div>
            <div hidden={tab !== "Songs"}>
              <SongLibrary onAdd={addSong} />
            </div>
            <div hidden={tab !== "Announcements"}>
              <Announcements
                item={item}
                state={output.state}
                onCommand={(action, interval, loop) =>
                  void output.command(
                    action,
                    action === "slideshow-start"
                      ? {
                          slides: item?.slides,
                          serviceId: storage.serviceId,
                          serviceTitle: data.title,
                          interval,
                          loop,
                        }
                      : undefined,
                  )
                }
              />
            </div>
            <div hidden={tab !== "Timers"}>
              <TimerPanel />
            </div>
            <div hidden={tab !== "Media"}>
              <MediaLibrary
                slide={slide}
                onApply={(media, whole) =>
                  presentation({ ...slide?.presentation, media }, whole)
                }
              />
            </div>
            <div hidden={tab !== "Outputs"}>
              <RenderPipelinePanel preview={slide} live={output.state?.slide || null} />
            </div>
            <div hidden={tab !== "Stream"}>
              <StreamPanel slide={slide} serviceId={storage.serviceId} serviceTitle={data.title} church={church} />
            </div>
            <div hidden={tab !== "Production"}>
              <ProductionPanel slide={slide} serviceId={storage.serviceId} serviceTitle={data.title} church={church} audience={output.state} />
            </div>
            <div hidden={tab !== "Run show"}>
              <RunOfShowPanel items={data.items} selectedId={slideId} onSelect={choose} serviceId={storage.serviceId} serviceTitle={data.title} audience={output.state} />
            </div>
            <div
              hidden={[
                "Songs",
                "Timers",
                "Media",
                "Design",
                "Themes",
                "Bible",
                "Announcements",
                "Outputs",
                "Stream",
                "Production",
                "Run show",
              ].includes(tab)}
              role="tabpanel"
              aria-label={tab}
            >
              {tab === "Slides" ? (
                <div className="library-slides">
                  {flat
                    .filter((s) =>
                      (s.text + s.itemTitle)
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    )
                    .map((s) => (
                      <button key={s.id} onClick={() => choose(s.itemId, s.id)}>
                        <Frame slide={s} />
                        <div>
                          <strong>{s.itemTitle || "Untitled item"}</strong>
                          <small>{s.text || "Empty slide"}</small>
                        </div>
                      </button>
                    ))}
                  {!flat.length && (
                    <p>
                      No slides yet. Add a service item or a saved song
                      arrangement.
                    </p>
                  )}
                  {flat.length > 0 &&
                    !flat.some((s) =>
                      (s.text + s.itemTitle)
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    ) && <p>No matching slides.</p>}
                </div>
              ) : (
                <div className="planned-panel">
                  <strong>{tab} library — planned</strong>
                  <p>
                    {tab === "Bible"
                      ? "Scripture import and search arrive in Phase 7."
                      : "Image, audio and video import/playback arrive in Phase 8."}{" "}
                    This workspace does not include these features yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
        <section hidden={tab !== "Stage"} className="stage-drawer">
          <StagePanel
            current={slide}
            next={(flat[selectedIndex + 1] as Slide | undefined) || null}
          />
        </section>
      </fieldset>
      <section
        className="op-panel output-panels studio-output"
        aria-label="Audience and preview"
      >
        <div className="output-scroll">
          <div className="panel-heading">
            <h2>Preview</h2>
            <span>NOT LIVE</span>
          </div>
          <SlideSurface
            slide={slide}
            onProgress={(_t, _d, e) => {
              if (e) setPreviewError(e);
            }}
          />
          {previewError && (
            <p className="media-warning" role="alert">
              {previewError}
            </p>
          )}
          <div className="take-row">
            <button
              className="primary"
              disabled={
                !slide ||
                !ready ||
                storage.switching ||
                output.state?.status !== "ready"
              }
              onClick={take}
            >
              Take Live → <small>Audience</small>
            </button>
          </div>
          <div className="panel-actions preview-navigation">
            <button disabled={selectedIndex <= 0} onClick={() => step(-1)}>
              ← Preview previous
            </button>
            <button
              disabled={selectedIndex < 0 || selectedIndex >= flat.length - 1}
              onClick={() => step(1)}
            >
              Preview next →
            </button>
          </div>
          <div className="panel-heading live-label">
            <h2>Live snapshot</h2>
            <span>
              {output.state?.status !== "ready"
                ? "OFF AIR"
                : output.state.blackout
                  ? "BLACKOUT"
                  : output.state.appliedRevision !== output.state.revision
                    ? "SENDING"
                    : "APPLIED"}
            </span>
          </div>
          <SlideSurface
            slide={output.state?.slide || null}
            mode={output.state?.mode}
            church={output.state?.church}
            blackout={!output.state || output.state.blackout}
            playback={output.state?.playback}
            onProgress={(t, d, e) => {
              setTime(Number.isFinite(t) ? t : 0);
              setDuration(Number.isFinite(d) ? d : 0);
              if (e) setMediaError(e);
            }}
          />
          {["video", "audio"].includes(
            output.state?.slide?.presentation?.media?.kind || "",
          ) &&
            output.state &&
            output.state.mode !== "church" && (
              <Transport
                playback={output.state.playback}
                time={time}
                duration={duration}
                error={output.state.mediaError || mediaError}
                disabled={output.state.status !== "ready"}
                onCommand={(p) => void output.command("transport", p)}
              />
            )}
          {output.state?.mediaError && (
            <p className="media-warning" role="alert">
              {output.state.mediaError}
            </p>
          )}
          <p className="live-source">
            {output.state?.serviceTitle || "No slide sent"}
            {output.state?.serviceId &&
            output.state.serviceId !== storage.serviceId
              ? " · from another service"
              : ""}
          </p>
        </div>
        {output.state?.slideshow?.running && (
          <button onClick={() => void output.command("slideshow-stop")}>
            Stop announcements
          </button>
        )}
        <LiveToolbar output={output} church={church} />
        <p className="output-note">
          Applied confirms the audience renderer—not the physical projector.
          Audience and stage outputs are independent. Use Stage to open the worship-team screen.
        </p>
      </section>
      <div className="studio-manager" hidden={!manager}>
        <div className="manager-title">
          <strong>Services & backups</strong>
          <button onClick={() => setManager(false)}>Close manager ×</button>
        </div>
        <fieldset disabled={!ready || storage.switching}>
          <ServiceLibrary store={storage} defaultExpanded />
        </fieldset>
      </div>
      <div className="studio-status">
        <span>
          <i className="dot" />
          Offline desktop · {church}
        </span>
        <span>
          {flat.length} slides · {data.items.length} items
        </span>
        <button onClick={() => resource("Stage")}>Stage display</button>
        <button onClick={() => resource("Outputs")}>Output pipeline</button>
        <button
          onClick={() => {
            setThumb(180);
            setExpanded(false);
            setEditing(false);
            setAllSlides(false);
          }}
        >
          Reset layout
        </button>
        <span>FaithPresenter Studio · v0.14.0</span>
      </div>
    </div>
  );
}

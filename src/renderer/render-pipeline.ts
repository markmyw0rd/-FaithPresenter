import type { Slide } from "./workspace-model";

export type FrameLayer = {
  id: "theme" | "media" | "text";
  label: string;
  enabled: boolean;
  detail: string;
};

export type OutputFrame = {
  frameId: string;
  width: 1920;
  height: 1080;
  createdAt: number;
  slideId: string | null;
  layers: ReadonlyArray<FrameLayer>;
};

export function composeFrame(slide: Slide | null): OutputFrame {
  const media = slide?.presentation?.media;
  const style = slide?.presentation?.style;
  const signature = JSON.stringify({
    id: slide?.id || null,
    text: slide?.text || "",
    theme: slide?.theme || "plain",
    media: media || null,
    style: style || null,
  });
  let hash = 2166136261;
  for (let i = 0; i < signature.length; i++) {
    hash ^= signature.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Object.freeze({
    frameId: `frame-${(hash >>> 0).toString(16).padStart(8, "0")}`,
    width: 1920,
    height: 1080,
    createdAt: Date.now(),
    slideId: slide?.id || null,
    layers: Object.freeze([
      Object.freeze({
        id: "theme" as const,
        label: "Theme",
        enabled: Boolean(slide),
        detail: slide ? `${slide.theme} · ${style?.backgroundColor || "theme default"}` : "No slide selected",
      }),
      Object.freeze({
        id: "media" as const,
        label: "Media",
        enabled: Boolean(media),
        detail: media ? `${media.kind} · managed local asset` : "No media layer",
      }),
      Object.freeze({
        id: "text" as const,
        label: "Slide objects",
        enabled: Boolean(slide?.text),
        detail: slide?.text ? `${slide.text.length} characters · fitted text box` : "No text object",
      }),
    ]),
  });
}

export const outputAdapters = Object.freeze([
  { id: "preview", name: "Preview", status: "ready", detail: "Selected frame; never publishes automatically" },
  { id: "audience", name: "Audience", status: "ready", detail: "Explicit Take Live snapshot" },
  { id: "stage", name: "Stage", status: "ready", detail: "Independent current/next team layout" },
  { id: "livestream", name: "Livestream", status: "ready", detail: "Independent clean-feed window for OBS capture" },
  { id: "ndi", name: "NDI", status: "planned", detail: "Requires licensed native NDI SDK" },
  { id: "sdi", name: "SDI", status: "planned", detail: "Requires compatible hardware and vendor SDK" },
] as const);

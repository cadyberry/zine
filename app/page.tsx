"use client";
import { useState, useRef, useCallback } from "react";

/* ── Types ── */
type Template = "cover" | "spread" | "pullquote" | "collage";
type Texture  = "none" | "grain-fine" | "grain-coarse" | "lined" | "grid" | "aged" | "blueprint";
type BlendMode = "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten";

interface ZineElement {
  id: number;
  type: "image" | "shape" | "mark";
  src?: string;       // image: data URL
  color?: string;     // shape: fill color
  content?: string;   // mark: text/symbol
  shape?: "rect" | "circle";
  x: number; y: number; w: number; h: number;
  opacity: number;
  blendMode: BlendMode;
}

interface PageData {
  id: number;
  template: Template;
  ink1: string; ink2: string;
  texture: Texture;
  elements: ZineElement[];
}

/* ── Constants ── */
const PACKS = [
  { name: "RISO BLACK",  ink1: "#1a1a1a", ink2: "#cc2200" },
  { name: "RISO BLUE",   ink1: "#1a1a1a", ink2: "#0033aa" },
  { name: "RISO GREEN",  ink1: "#1a1a1a", ink2: "#006644" },
  { name: "FLUORESCENT", ink1: "#1a1a1a", ink2: "#ccff00" },
  { name: "SUNSET",      ink1: "#cc0066", ink2: "#ff6600" },
  { name: "OCEAN",       ink1: "#003366", ink2: "#00aacc" },
  { name: "PROTEST",     ink1: "#cc2200", ink2: "#ffcc00" },
  { name: "FOREST",      ink1: "#1a3322", ink2: "#44aa66" },
  { name: "NIGHT",       ink1: "#110022", ink2: "#aa44ff" },
  { name: "NEWSPRINT",   ink1: "#1a1a1a", ink2: "#888888" },
  { name: "BLUSH",       ink1: "#2a0a0a", ink2: "#dd6688" },
  { name: "SEPIA",       ink1: "#2a1a0a", ink2: "#884422" },
];

const ALL_INKS = [
  "#1a1a1a","#cc2200","#0033aa","#006644","#7700cc","#cc7700",
  "#cc0066","#004466","#003366","#00aacc","#ff6600","#ccff00",
  "#44aa66","#aa44ff","#dd6688","#884422","#888888","#ffcc00",
];

const TEXTURES: { id: Texture; label: string }[] = [
  { id: "none",        label: "Clean"      },
  { id: "grain-fine",  label: "Fine Grain" },
  { id: "grain-coarse",label: "Coarse"     },
  { id: "lined",       label: "Lined"      },
  { id: "grid",        label: "Grid"       },
  { id: "aged",        label: "Aged"       },
  { id: "blueprint",   label: "Blueprint"  },
];

const MARKS = [
  { label: "⊕",  name: "Reg. Mark"  },
  { label: "★",  name: "Star"       },
  { label: "✦",  name: "4-Star"     },
  { label: "→",  name: "Arrow R"    },
  { label: "↗",  name: "Arrow UR"   },
  { label: "✕",  name: "X Mark"     },
  { label: "◆",  name: "Diamond"    },
  { label: "○",  name: "Circle"     },
  { label: "✄",  name: "Cut"        },
  { label: "✚",  name: "Plus"       },
  { label: "№",  name: "Number"     },
  { label: "©",  name: "Copyright"  },
];

const BLEND_MODES: BlendMode[] = ["normal","multiply","screen","overlay","darken","lighten"];

const TEMPLATES: { id: Template; label: string }[] = [
  { id: "cover",     label: "Cover"     },
  { id: "spread",    label: "Spread"    },
  { id: "pullquote", label: "Pull Quote"},
  { id: "collage",   label: "Collage"   },
];

/* ── Helpers ── */
function paperBg(t: Texture) {
  if (t === "aged")      return "#e8dfc8";
  if (t === "blueprint") return "#d8e8f0";
  if (t === "grid")      return "#f8f8f6";
  return "#f0ebe0";
}

let _id = 1;
const uid = () => _id++;

/* ── Texture overlay ── */
function TextureOverlay({ texture }: { texture: Texture }) {
  const base: React.CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50 };
  if (texture === "none") return null;
  if (texture === "grain-fine") return (
    <div style={{ ...base, opacity: 0.45, mixBlendMode: "multiply",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E")`,
      backgroundSize: "200px 200px" }} />
  );
  if (texture === "grain-coarse") return (
    <div style={{ ...base, opacity: 0.55, mixBlendMode: "multiply",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
      backgroundSize: "200px 200px" }} />
  );
  if (texture === "lined") return (
    <div style={{ ...base, opacity: 0.12,
      backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 17px, #1a1a1a 17px, #1a1a1a 18px)" }} />
  );
  if (texture === "grid") return (
    <div style={{ ...base, opacity: 0.1,
      backgroundImage: "linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)",
      backgroundSize: "20px 20px" }} />
  );
  if (texture === "aged") return (<>
    <div style={{ ...base, opacity: 0.6, mixBlendMode: "multiply",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E")`,
      backgroundSize: "200px 200px" }} />
    <div style={{ ...base, background: "radial-gradient(ellipse at center, transparent 40%, rgba(100,70,20,0.18) 100%)", zIndex: 51 }} />
  </>);
  if (texture === "blueprint") return (
    <div style={{ ...base, opacity: 0.18,
      backgroundImage: "linear-gradient(#003366 1px, transparent 1px), linear-gradient(90deg, #003366 1px, transparent 1px)",
      backgroundSize: "24px 24px" }} />
  );
  return null;
}

/* ── Editable text zone ── */
function E({ placeholder, style = {} }: { placeholder: string; style?: React.CSSProperties }) {
  return (
    <div contentEditable suppressContentEditableWarning data-ph={placeholder}
      style={{ outline: "none", border: "1.5px dashed transparent", padding: 3, cursor: "text",
        wordBreak: "break-word", overflow: "hidden", minHeight: "1em", ...style }}
      onFocus={e  => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.18)")}
      onBlur={e   => (e.currentTarget.style.borderColor = "transparent")} />
  );
}

const ff = "'Courier New', monospace";

/* ── Layout templates ── */
function CoverLayout({ ink1, ink2 }: { ink1: string; ink2: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "28px 24px", height: "100%", fontFamily: ff }}>
      <E placeholder="ISSUE NO. 01 — 2025" style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.5, color: ink2, marginBottom: 12 }} />
      <div style={{ flex: 1 }}>
        <E placeholder="YOUR ZINE TITLE HERE" style={{ fontSize: 40, fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.02em", color: ink1, marginBottom: 16 }} />
        <div style={{ height: 3, background: ink2, marginBottom: 16 }} />
        <E placeholder="A description, subtitle, or tagline. Keep it short." style={{ fontSize: 8, lineHeight: 1.7, color: ink1 }} />
      </div>
      <E placeholder="By your name · yoursite.com" style={{ fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.55, color: ink1, marginTop: "auto" }} />
    </div>
  );
}
function SpreadLayout({ ink1, ink2 }: { ink1: string; ink2: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "28px 1fr", padding: 20, gap: 12, height: "100%", fontFamily: ff }}>
      <div style={{ gridColumn: "1/-1" }}>
        <E placeholder="SECTION TITLE" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ink2 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <E placeholder="Write your story or essay in the left column." style={{ fontSize: 8, lineHeight: 1.7, color: ink1, flex: 1 }} />
        <E placeholder="Caption · Source" style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.55, color: ink1 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ flex: 1, background: ink2, opacity: 0.14, minHeight: 80 }} />
        <E placeholder="Image caption or pull fact." style={{ fontSize: 8, lineHeight: 1.7, color: ink1 }} />
        <div style={{ height: 2, background: ink2 }} />
        <E placeholder="pg. 2" style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.55, color: ink1 }} />
      </div>
    </div>
  );
}
function PullquoteLayout({ ink1, ink2 }: { ink1: string; ink2: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "32px 28px", gap: 16, height: "100%", fontFamily: ff }}>
      <E placeholder="SECTION TITLE OR DATE" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ink2 }} />
      <E placeholder="Setup copy — write your intro before the pull quote." style={{ fontSize: 8, lineHeight: 1.7, color: ink1, flex: 1 }} />
      <div style={{ borderLeft: `4px solid ${ink2}`, paddingLeft: 14 }}>
        <E placeholder='"The most important thing I ever did was decide to begin."' style={{ fontFamily: "Georgia, serif", fontSize: 22, fontStyle: "italic", lineHeight: 1.38, color: ink1 }} />
      </div>
      <E placeholder="Body text continues. Wrap up your thought or sign off." style={{ fontSize: 8, lineHeight: 1.7, color: ink1, flex: 1 }} />
      <E placeholder="· END ·" style={{ fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.55, color: ink2, textAlign: "center" } as React.CSSProperties} />
    </div>
  );
}
function CollageLayout({ ink1, ink2 }: { ink1: string; ink2: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gridTemplateRows: "36px 1fr 1fr 28px", padding: 20, gap: 8, height: "100%", fontFamily: ff }}>
      <div style={{ gridColumn: "1/-1" }}>
        <E placeholder="COLLAGE — VOL. III" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ink2 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ flex: 1, background: ink2, opacity: 0.12 }} />
        <E placeholder="A note. Two or three lines." style={{ fontSize: 8, lineHeight: 1.7, color: ink1 }} />
      </div>
      <div style={{ gridRow: "2/4", background: ink1, display: "flex", alignItems: "flex-end", padding: 6 }}>
        <E placeholder="caption" style={{ fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", color: ink2 }} />
      </div>
      <div>
        <E placeholder="More notes, a small story, a list." style={{ fontSize: 8, lineHeight: 1.7, color: ink1 }} />
      </div>
      <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "flex-end" }}>
        <E placeholder="page 4 · your zine · 2025" style={{ fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.55, color: ink1 }} />
      </div>
    </div>
  );
}

const LAYOUTS: Record<Template, React.FC<{ink1:string;ink2:string}>> = {
  cover: CoverLayout, spread: SpreadLayout, pullquote: PullquoteLayout, collage: CollageLayout,
};

function TemplateMini({ id }: { id: Template }) {
  const s = { background: "rgba(0,0,0,0.22)", borderRadius: 1 };
  const b = { background: "rgba(0,0,0,0.09)", borderRadius: 1, flex: 1 };
  if (id === "cover") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: 6, height: "100%", background: "#e4ddd0" }}>
      <div style={{ ...s, height: 4 }} /><div style={{ ...b, flex: 2 }} /><div style={{ ...s, height: 2 }} /><div style={{ ...b }} /><div style={{ ...s, height: 3 }} />
    </div>
  );
  if (id === "spread") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: 5, height: "100%", background: "#e4ddd0" }}>
      <div style={{ ...s, height: 4 }} />
      <div style={{ display: "flex", gap: 3, flex: 1 }}><div style={{ ...b }} /><div style={{ ...b }} /></div>
    </div>
  );
  if (id === "pullquote") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: 5, height: "100%", background: "#e4ddd0" }}>
      <div style={{ ...s, height: 4 }} /><div style={{ ...b }} /><div style={{ ...s, height: 9 }} /><div style={{ ...b }} />
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: 5, height: "100%", background: "#e4ddd0" }}>
      <div style={{ ...s, height: 4 }} />
      <div style={{ display: "flex", gap: 3, flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 2 }}><div style={{ ...b }} /><div style={{ ...b }} /></div>
        <div style={{ ...b, flex: 1 }} />
      </div>
    </div>
  );
}

function SL({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,235,224,0.38)", marginBottom: "0.55rem" }}>{children}</div>;
}

/* ── Main component ── */
export default function ZineBuilder() {
  const [pages, setPages]       = useState<PageData[]>([
    { id: 0, template: "cover", ink1: PACKS[0].ink1, ink2: PACKS[0].ink2, texture: "grain-fine", elements: [] },
  ]);
  const [current, setCurrent]   = useState(0);
  const [colorTab, setColorTab] = useState<"packs"|"custom">("packs");
  const [toolTab, setToolTab]   = useState<"images"|"shapes"|"marks">("images");
  const [selected, setSelected] = useState<number | null>(null);
  const [library, setLibrary]   = useState<string[]>([]);  // uploaded image data URLs

  const page = pages.find(p => p.id === current) ?? pages[0];

  // Drag state stored in ref (no re-render during drag)
  const drag = useRef<{
    elId: number; mode: "move"|"resize";
    sx: number; sy: number; ox: number; oy: number; ow: number; oh: number;
  } | null>(null);

  /* Page ops */
  function updatePage(id: number, patch: Partial<PageData>) {
    setPages(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p));
  }
  function addPage() {
    const id = uid();
    setPages(ps => [...ps, { id, template: "cover", ink1: page.ink1, ink2: page.ink2, texture: page.texture, elements: [] }]);
    setCurrent(id);
  }
  function deletePage(id: number) {
    if (pages.length === 1) return;
    const idx = pages.findIndex(p => p.id === id);
    const next = pages[idx === 0 ? 1 : idx - 1];
    setPages(ps => ps.filter(p => p.id !== id));
    setCurrent(next.id);
  }

  /* Element ops */
  function addElement(patch: Omit<ZineElement, "id"|"x"|"y"|"opacity"|"blendMode">) {
    const { w: pw, h: ph, ...rest } = patch;
    const el: ZineElement = { id: uid(), x: 100, y: 120, w: pw ?? 160, h: ph ?? 120, opacity: 1, blendMode: "normal", ...rest };
    updatePage(page.id, { elements: [...page.elements, el] });
    setSelected(el.id);
  }
  function updateElement(elId: number, patch: Partial<ZineElement>) {
    updatePage(page.id, { elements: page.elements.map(e => e.id === elId ? { ...e, ...patch } : e) });
  }
  function deleteElement(elId: number) {
    updatePage(page.id, { elements: page.elements.filter(e => e.id !== elId) });
    setSelected(null);
  }

  /* Image upload */
  const fileRef = useRef<HTMLInputElement>(null);
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const src = ev.target?.result as string;
        setLibrary(lib => [src, ...lib]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  /* Drag handlers on canvas */
  function onCanvasMouseMove(e: React.MouseEvent) {
    if (!drag.current) return;
    const d = drag.current;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (d.mode === "move") {
      updateElement(d.elId, {
        x: Math.max(0, Math.min(360, d.ox + dx)),
        y: Math.max(0, Math.min(520, d.oy + dy)),
      });
    } else {
      updateElement(d.elId, {
        w: Math.max(40, d.ow + dx),
        h: Math.max(40, d.oh + dy),
      });
    }
  }
  function onCanvasMouseUp() { drag.current = null; }

  const selectedEl = page.elements.find(e => e.id === selected);

  const dim    = "rgba(240,235,224,0.4)";
  const border = "rgba(240,235,224,0.1)";
  const panelBg = "#161412";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 260px", gridTemplateRows: "48px 1fr 72px", height: "100vh", fontFamily: ff, background: "#1c1a18", color: "#f0ebe0" }}>

      {/* ── TOPBAR ── */}
      <div data-noprint style={{ gridColumn: "1/-1", background: "#111", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", padding: "0 1.2rem", gap: "1.5rem" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" }}>ZINE</span>
        <div style={{ width: 1, height: 20, background: border }} />
        <span style={{ fontSize: 9, letterSpacing: "0.12em", color: "rgba(240,235,224,0.28)", textTransform: "uppercase" }}>
          {pages.length} page{pages.length !== 1 ? "s" : ""} · click text to edit · drag elements
        </span>
        <button onClick={() => window.print()}
          style={{ marginLeft: "auto", fontFamily: ff, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 16px", border: `1px solid ${border}`, background: "#f0ebe0", color: "#1c1a18", cursor: "pointer" }}>
          Print / Save
        </button>
      </div>

      {/* ── LEFT SIDEBAR — page settings ── */}
      <div data-noprint style={{ background: panelBg, borderRight: `1px solid ${border}`, overflowY: "auto", padding: "1.1rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Layout */}
        <div>
          <SL>Layout</SL>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {TEMPLATES.map(t => (
              <div key={t.id} onClick={() => updatePage(page.id, { template: t.id })} title={t.label}
                style={{ aspectRatio: "5/7", border: `2px solid ${page.template === t.id ? "#f0ebe0" : "transparent"}`, cursor: "pointer", overflow: "hidden", transition: "border-color 0.15s" }}>
                <TemplateMini id={t.id} />
              </div>
            ))}
          </div>
        </div>

        {/* Ink colors */}
        <div>
          <SL>Ink Colors</SL>
          <div style={{ display: "flex", marginBottom: "0.6rem", borderBottom: `1px solid ${border}` }}>
            {(["packs","custom"] as const).map(t => (
              <button key={t} onClick={() => setColorTab(t)}
                style={{ flex: 1, fontFamily: ff, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", padding: "4px 0", background: "transparent", border: "none", borderBottom: `2px solid ${colorTab === t ? "#f0ebe0" : "transparent"}`, color: colorTab === t ? "#f0ebe0" : dim, cursor: "pointer", marginBottom: -1 }}>
                {t}
              </button>
            ))}
          </div>
          {colorTab === "packs" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {PACKS.map(pack => {
                const active = page.ink1 === pack.ink1 && page.ink2 === pack.ink2;
                return (
                  <div key={pack.name} onClick={() => updatePage(page.id, { ink1: pack.ink1, ink2: pack.ink2 })}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 6px", cursor: "pointer", background: active ? "rgba(240,235,224,0.08)" : "transparent", border: `1px solid ${active ? "rgba(240,235,224,0.18)" : "transparent"}` }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      <div style={{ width: 12, height: 12, background: pack.ink1, borderRadius: 2 }} />
                      <div style={{ width: 12, height: 12, background: pack.ink2, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 9, letterSpacing: "0.08em", color: active ? "#f0ebe0" : dim }}>{pack.name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(["ink1","ink2"] as const).map(key => (
                <div key={key}>
                  <div style={{ fontSize: 8, letterSpacing: "0.2em", color: dim, marginBottom: 5, textTransform: "uppercase" }}>Ink {key === "ink1" ? "1" : "2"}</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {ALL_INKS.map(c => (
                      <div key={c} onClick={() => updatePage(page.id, { [key]: c })}
                        style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: `2px solid ${page[key] === c ? "white" : "transparent"}`, cursor: "pointer" }}
                        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.2)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Texture */}
        <div>
          <SL>Paper Texture</SL>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {TEXTURES.map(t => (
              <div key={t.id} onClick={() => updatePage(page.id, { texture: t.id })}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 6px", cursor: "pointer", background: page.texture === t.id ? "rgba(240,235,224,0.08)" : "transparent", border: `1px solid ${page.texture === t.id ? "rgba(240,235,224,0.18)" : "transparent"}` }}>
                <div style={{ width: 20, height: 14, background: paperBg(t.id), border: "1px solid rgba(0,0,0,0.12)", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                  {t.id === "lined"     && <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(to bottom, transparent 3px, transparent 5px, rgba(0,0,0,0.18) 5px, rgba(0,0,0,0.18) 6px)" }} />}
                  {t.id === "grid"      && <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)", backgroundSize: "5px 5px" }} />}
                  {t.id === "blueprint" && <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,51,102,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0,51,102,0.25) 1px, transparent 1px)", backgroundSize: "5px 5px" }} />}
                </div>
                <span style={{ fontSize: 9, letterSpacing: "0.08em", color: page.texture === t.id ? "#f0ebe0" : dim }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── CANVAS ── */}
      <div data-canvas style={{
        overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#242220",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 0)",
        backgroundSize: "36px 36px", padding: "2rem",
        cursor: drag.current ? "grabbing" : "default",
      }}
        onMouseMove={onCanvasMouseMove}
        onMouseUp={onCanvasMouseUp}
        onMouseLeave={onCanvasMouseUp}
      >
        <div data-pages-container style={{ position: "relative" }}>
          {pages.map(p => {
            const Layout = LAYOUTS[p.template];
            return (
              <div key={p.id} data-page-wrapper style={{ display: p.id === current ? "block" : "none" }}>
                <div data-zine-page
                  style={{ width: 400, height: 566, background: paperBg(p.texture), position: "relative", flexShrink: 0,
                    boxShadow: "0 12px 80px rgba(0,0,0,0.7), 0 2px 12px rgba(0,0,0,0.5)", overflow: "hidden" }}
                  onClick={() => setSelected(null)}
                >
                  {/* Template text layout */}
                  <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                    <Layout ink1={p.ink1} ink2={p.ink2} />
                  </div>

                  {/* Elements layer */}
                  {p.elements.map(el => (
                    <div key={el.id}
                      style={{ position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h, zIndex: selected === el.id ? 20 : 10,
                        outline: selected === el.id ? "1.5px dashed rgba(0,0,0,0.4)" : "none",
                        cursor: "grab",
                        opacity: el.opacity,
                        mixBlendMode: el.blendMode as React.CSSProperties["mixBlendMode"],
                      }}
                      onClick={e => { e.stopPropagation(); setSelected(el.id); }}
                      onMouseDown={e => {
                        e.stopPropagation();
                        drag.current = { elId: el.id, mode: "move", sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y, ow: el.w, oh: el.h };
                      }}
                    >
                      {el.type === "image" && <img src={el.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none" }} draggable={false} />}
                      {el.type === "shape" && <div style={{ width: "100%", height: "100%", background: el.color, borderRadius: el.shape === "circle" ? "50%" : 0 }} />}
                      {el.type === "mark"  && (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: Math.min(el.w, el.h) * 0.6, color: p.ink2, fontFamily: "sans-serif", userSelect: "none", lineHeight: 1 }}>
                          {el.content}
                        </div>
                      )}

                      {/* Resize handle */}
                      {selected === el.id && (
                        <div onMouseDown={e => {
                            e.stopPropagation();
                            drag.current = { elId: el.id, mode: "resize", sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y, ow: el.w, oh: el.h };
                          }}
                          style={{ position: "absolute", bottom: -4, right: -4, width: 10, height: 10, background: "#fff", border: "1.5px solid rgba(0,0,0,0.5)", borderRadius: 2, cursor: "se-resize", zIndex: 30 }} />
                      )}
                    </div>
                  ))}

                  <TextureOverlay texture={p.texture} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL — creative tools ── */}
      <div data-noprint style={{ background: panelBg, borderLeft: `1px solid ${border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          {(["images","shapes","marks"] as const).map(t => (
            <button key={t} onClick={() => setToolTab(t)}
              style={{ flex: 1, fontFamily: ff, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", padding: "12px 0", background: "transparent", border: "none", borderBottom: `2px solid ${toolTab === t ? "#f0ebe0" : "transparent"}`, color: toolTab === t ? "#f0ebe0" : dim, cursor: "pointer", marginBottom: -1 }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>

          {/* IMAGES TAB */}
          {toolTab === "images" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: "none" }} />
              <button onClick={() => fileRef.current?.click()}
                style={{ fontFamily: ff, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", padding: "10px", border: `1.5px dashed rgba(240,235,224,0.25)`, background: "transparent", color: "#f0ebe0", cursor: "pointer", width: "100%", transition: "border-color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(240,235,224,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(240,235,224,0.25)")}>
                + Upload Image
              </button>

              {library.length === 0 && (
                <p style={{ fontSize: 9, color: dim, lineHeight: 1.7, letterSpacing: "0.06em" }}>
                  Upload photos, illustrations, or scans. Click a thumbnail to place it on the current page. Drag to reposition, corner handle to resize.
                </p>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                {library.map((src, i) => (
                  <div key={i} onClick={() => addElement({ type: "image", src, w: 160, h: 120 })}
                    style={{ aspectRatio: "1", overflow: "hidden", cursor: "pointer", border: "1px solid rgba(240,235,224,0.1)", position: "relative" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(240,235,224,0.5)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(240,235,224,0.1)")}>
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SHAPES TAB */}
          {toolTab === "shapes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SL>Rectangles</SL>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                {[page.ink1, page.ink2, "#ffffff", "#000000", ...ALL_INKS.slice(0, 8)].map(c => (
                  <div key={c} onClick={() => addElement({ type: "shape", color: c, shape: "rect", w: 120, h: 80 })}
                    style={{ height: 36, background: c, cursor: "pointer", border: "1px solid rgba(0,0,0,0.15)", transition: "transform 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(0.96)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                ))}
              </div>

              <div style={{ marginTop: "0.5rem" }}><SL>Circles</SL></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {[page.ink1, page.ink2, "#ffffff", "#000000", ...ALL_INKS.slice(0, 6)].map(c => (
                  <div key={c} onClick={() => addElement({ type: "shape", color: c, shape: "circle", w: 60, h: 60 })}
                    style={{ width: 36, height: 36, borderRadius: "50%", background: c, cursor: "pointer", border: "1px solid rgba(0,0,0,0.15)", transition: "transform 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.12)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                ))}
              </div>
            </div>
          )}

          {/* MARKS TAB */}
          {toolTab === "marks" && (
            <div>
              <SL>Stamps — click to place</SL>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: "1.2rem" }}>
                {MARKS.map(m => (
                  <div key={m.label} onClick={() => addElement({ type: "mark", content: m.label, w: 48, h: 48 })} title={m.name}
                    style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: "rgba(240,235,224,0.05)", border: `1px solid ${border}`, cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(240,235,224,0.12)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(240,235,224,0.05)")}>
                    {m.label}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Selected element controls */}
        {selectedEl && (
          <div style={{ borderTop: `1px solid ${border}`, padding: "0.75rem 1rem", flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: dim }}>Selected</span>
              <button onClick={() => deleteElement(selectedEl.id)}
                style={{ fontFamily: ff, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", border: "1px solid #cc2200", background: "transparent", color: "#cc2200", cursor: "pointer" }}>
                Delete
              </button>
            </div>

            {/* Opacity */}
            <div>
              <div style={{ fontSize: 8, color: dim, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
                Opacity — {Math.round(selectedEl.opacity * 100)}%
              </div>
              <input type="range" min={0} max={1} step={0.05} value={selectedEl.opacity}
                onChange={e => updateElement(selectedEl.id, { opacity: parseFloat(e.target.value) })}
                style={{ width: "100%", accentColor: "#f0ebe0" }} />
            </div>

            {/* Blend mode */}
            <div>
              <div style={{ fontSize: 8, color: dim, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Blend Mode</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {BLEND_MODES.map(m => (
                  <div key={m} onClick={() => updateElement(selectedEl.id, { blendMode: m })}
                    style={{ fontSize: 8, letterSpacing: "0.06em", padding: "2px 6px", cursor: "pointer", background: selectedEl.blendMode === m ? "#f0ebe0" : "rgba(240,235,224,0.06)", color: selectedEl.blendMode === m ? "#1c1a18" : dim, border: `1px solid ${selectedEl.blendMode === m ? "#f0ebe0" : "transparent"}` }}>
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PAGE STRIP ── */}
      <div data-noprint style={{ gridColumn: "1/-1", background: "#111", borderTop: `1px solid ${border}`, display: "flex", alignItems: "center", padding: "0 1.2rem", gap: "0.75rem", overflowX: "auto" }}>
        {pages.map((p, idx) => (
          <div key={p.id} onClick={() => { setCurrent(p.id); setSelected(null); }} style={{ position: "relative", flexShrink: 0, paddingBottom: 18 }}>
            <div style={{ width: 36, height: 51, background: paperBg(p.texture), border: `2px solid ${p.id === current ? "#f0ebe0" : "rgba(240,235,224,0.15)"}`, cursor: "pointer", overflow: "hidden", transition: "border-color 0.15s", display: "flex", flexDirection: "column", padding: 3, gap: 2 }}>
              <div style={{ height: 3, background: p.ink2, opacity: 0.7 }} />
              <div style={{ flex: 1, background: p.ink1, opacity: 0.08 }} />
              <div style={{ height: 2, background: p.ink1, opacity: 0.2 }} />
            </div>
            <div style={{ position: "absolute", bottom: 2, left: 0, right: 0, textAlign: "center", fontSize: 8, color: dim }}>{idx + 1}</div>
            {pages.length > 1 && p.id === current && (
              <div onClick={e => { e.stopPropagation(); deletePage(p.id); }}
                style={{ position: "absolute", top: -5, right: -5, width: 13, height: 13, background: "#cc2200", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 9, color: "#fff", lineHeight: 1 }}>
                ×
              </div>
            )}
          </div>
        ))}
        <div onClick={addPage}
          style={{ width: 36, height: 51, border: `2px dashed rgba(240,235,224,0.18)`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: dim, fontSize: 20 }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(240,235,224,0.5)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(240,235,224,0.18)")}>
          +
        </div>
      </div>

      <style>{`
        [data-ph]:empty::before { content: attr(data-ph); opacity: 0.2; font-style: italic; pointer-events: none; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

        @media print {
          @page { size: 400px 566px; margin: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          [data-noprint] { display: none !important; }
          body, html { margin: 0; padding: 0; background: white; }
          body > div { display: block !important; height: auto !important; width: 400px !important; }
          [data-canvas] { display: block !important; background: none !important; padding: 0 !important; overflow: visible !important; width: 400px !important; height: auto !important; }
          [data-pages-container] { position: static !important; width: 400px; }
          [data-page-wrapper] { display: block !important; width: 400px; height: 566px; overflow: hidden; page-break-after: always; break-after: page; }
          [data-page-wrapper]:last-child { page-break-after: avoid; break-after: avoid; }
          [data-zine-page] { box-shadow: none !important; width: 400px !important; height: 566px !important; }
        }
      `}</style>
    </div>
  );
}

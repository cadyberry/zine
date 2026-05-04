"use client";
import { useState, useId } from "react";

/* ── Types ── */
type Template = "cover" | "spread" | "pullquote" | "collage";
type Texture  = "none" | "grain-fine" | "grain-coarse" | "lined" | "grid" | "aged" | "blueprint";

interface PageData {
  id:       number;
  template: Template;
  ink1:     string;
  ink2:     string;
  texture:  Texture;
}

/* ── Color packs ── */
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

/* ── Textures ── */
const TEXTURES: { id: Texture; label: string }[] = [
  { id: "none",        label: "Clean"      },
  { id: "grain-fine",  label: "Fine Grain" },
  { id: "grain-coarse",label: "Coarse"     },
  { id: "lined",       label: "Lined"      },
  { id: "grid",        label: "Grid"       },
  { id: "aged",        label: "Aged"       },
  { id: "blueprint",   label: "Blueprint"  },
];

function paperBg(texture: Texture) {
  if (texture === "aged")      return "#e8dfc8";
  if (texture === "blueprint") return "#d8e8f0";
  if (texture === "grid")      return "#f8f8f6";
  return "#f0ebe0";
}

function TextureOverlay({ texture }: { texture: Texture }) {
  const base: React.CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50 };

  if (texture === "none") return null;

  if (texture === "grain-fine") return (
    <div style={{ ...base, opacity: 0.45, mixBlendMode: "multiply",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E")`,
      backgroundSize: "200px 200px",
    }} />
  );

  if (texture === "grain-coarse") return (
    <div style={{ ...base, opacity: 0.55, mixBlendMode: "multiply",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
      backgroundSize: "200px 200px",
    }} />
  );

  if (texture === "lined") return (
    <div style={{ ...base, opacity: 0.12,
      backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 17px, #1a1a1a 17px, #1a1a1a 18px)",
    }} />
  );

  if (texture === "grid") return (
    <div style={{ ...base, opacity: 0.1,
      backgroundImage: "linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)",
      backgroundSize: "20px 20px",
    }} />
  );

  if (texture === "aged") return (
    <>
      <div style={{ ...base, opacity: 0.6, mixBlendMode: "multiply",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
      }} />
      <div style={{ ...base, background: "radial-gradient(ellipse at center, transparent 40%, rgba(100,70,20,0.18) 100%)", zIndex: 51 }} />
    </>
  );

  if (texture === "blueprint") return (
    <div style={{ ...base, opacity: 0.18,
      backgroundImage: "linear-gradient(#003366 1px, transparent 1px), linear-gradient(90deg, #003366 1px, transparent 1px)",
      backgroundSize: "24px 24px",
    }} />
  );

  return null;
}

/* ── Templates ── */
function E({ placeholder, style = {} }: { placeholder: string; style?: React.CSSProperties }) {
  return (
    <div
      contentEditable suppressContentEditableWarning
      data-ph={placeholder}
      style={{ outline: "none", border: "1.5px dashed transparent", padding: 3, cursor: "text",
        wordBreak: "break-word", overflow: "hidden", minHeight: "1em", ...style }}
      onFocus={e  => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.18)")}
      onBlur={e   => (e.currentTarget.style.borderColor = "transparent")}
    />
  );
}

const ff = "'Courier New', monospace";

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
        <E placeholder="Write your story, thoughts, or essay in the left column." style={{ fontSize: 8, lineHeight: 1.7, color: ink1, flex: 1 }} />
        <E placeholder="Caption · Source" style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.55, color: ink1 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ flex: 1, background: ink2, opacity: 0.14, minHeight: 80 }} />
        <E placeholder="Image caption or pull fact here." style={{ fontSize: 8, lineHeight: 1.7, color: ink1 }} />
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
      <E placeholder="Body text continues here. Wrap up your thought or sign off." style={{ fontSize: 8, lineHeight: 1.7, color: ink1, flex: 1 }} />
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
        <E placeholder="A note on the left. Two or three lines." style={{ fontSize: 8, lineHeight: 1.7, color: ink1 }} />
      </div>
      <div style={{ gridRow: "2/4", background: ink1, display: "flex", alignItems: "flex-end", padding: 6 }}>
        <E placeholder="caption" style={{ fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", color: ink2 }} />
      </div>
      <div>
        <E placeholder="More notes, a small story, a list of things you noticed." style={{ fontSize: 8, lineHeight: 1.7, color: ink1 }} />
      </div>
      <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "flex-end" }}>
        <E placeholder="page 4 · your zine · 2025" style={{ fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.55, color: ink1 }} />
      </div>
    </div>
  );
}

const LAYOUT_COMPONENTS: Record<Template, React.FC<{ ink1: string; ink2: string }>> = {
  cover:     CoverLayout,
  spread:    SpreadLayout,
  pullquote: PullquoteLayout,
  collage:   CollageLayout,
};

const TEMPLATES: { id: Template; label: string }[] = [
  { id: "cover",     label: "Cover"     },
  { id: "spread",    label: "Spread"    },
  { id: "pullquote", label: "Pull Quote"},
  { id: "collage",   label: "Collage"   },
];

function TemplateMini({ id }: { id: Template }) {
  const s = { background: "rgba(0,0,0,0.22)", borderRadius: 1 };
  const b = { background: "rgba(0,0,0,0.09)", borderRadius: 1, flex: 1 };
  if (id === "cover") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: 6, height: "100%", background: "#e4ddd0" }}>
      <div style={{ ...s, height: 4 }} /><div style={{ ...b, flex: 2 }} />
      <div style={{ ...s, height: 2 }} /><div style={{ ...b }} /><div style={{ ...s, height: 3 }} />
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

/* ── Sidebar section label ── */
function SL({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,235,224,0.38)", marginBottom: "0.55rem" }}>{children}</div>;
}

let nextId = 1;

export default function ZineBuilder() {
  const [pages, setPages]       = useState<PageData[]>([
    { id: 0, template: "cover", ink1: PACKS[0].ink1, ink2: PACKS[0].ink2, texture: "grain-fine" },
  ]);
  const [current, setCurrent]   = useState(0);
  const [tab, setTab]           = useState<"packs"|"custom">("packs");

  const page = pages.find(p => p.id === current) ?? pages[0];

  function updatePage(id: number, patch: Partial<PageData>) {
    setPages(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p));
  }

  function addPage() {
    const id = nextId++;
    const newPage: PageData = { id, template: "cover", ink1: page.ink1, ink2: page.ink2, texture: page.texture };
    setPages(ps => [...ps, newPage]);
    setCurrent(id);
  }

  function deletePage(id: number) {
    if (pages.length === 1) return;
    const idx = pages.findIndex(p => p.id === id);
    const next = pages[idx === 0 ? 1 : idx - 1];
    setPages(ps => ps.filter(p => p.id !== id));
    setCurrent(next.id);
  }

  const dim = "rgba(240,235,224,0.4)";
  const border = "rgba(240,235,224,0.1)";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "270px 1fr", gridTemplateRows: "48px 1fr 72px", height: "100vh", fontFamily: "'Courier New', monospace", background: "#1c1a18", color: "#f0ebe0" }}>

      {/* TOPBAR */}
      <div style={{ gridColumn: "1/-1", background: "#111", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", padding: "0 1rem", gap: "1.5rem" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" }}>ZINE</span>
        <div style={{ width: 1, height: 20, background: border }} />
        <span style={{ fontSize: 9, letterSpacing: "0.12em", color: "rgba(240,235,224,0.28)", textTransform: "uppercase" }}>
          {pages.length} page{pages.length !== 1 ? "s" : ""} · click any text to edit
        </span>
        <button
          onClick={() => window.print()}
          style={{ marginLeft: "auto", fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 16px", border: `1px solid ${border}`, background: "#f0ebe0", color: "#1c1a18", cursor: "pointer" }}
        >
          Print / Save
        </button>
      </div>

      {/* SIDEBAR */}
      <div style={{ background: "#161412", borderRight: `1px solid ${border}`, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>

        {/* Layout */}
        <div>
          <SL>Layout</SL>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {TEMPLATES.map(t => (
              <div key={t.id} onClick={() => updatePage(page.id, { template: t.id })} title={t.label}
                style={{ aspectRatio: "5/7", border: `2px solid ${page.template === t.id ? "#f0ebe0" : "transparent"}`, cursor: "pointer", overflow: "hidden", transition: "border-color 0.15s" }}>
                <TemplateMini id={t.id} />
              </div>
            ))}
          </div>
        </div>

        {/* Color tab switcher */}
        <div>
          <SL>Ink Colors</SL>
          <div style={{ display: "flex", marginBottom: "0.75rem", borderBottom: `1px solid ${border}` }}>
            {(["packs","custom"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", padding: "5px 0", background: "transparent", border: "none", borderBottom: `2px solid ${tab === t ? "#f0ebe0" : "transparent"}`, color: tab === t ? "#f0ebe0" : dim, cursor: "pointer", marginBottom: -1 }}>
                {t}
              </button>
            ))}
          </div>

          {tab === "packs" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {PACKS.map(pack => {
                const active = page.ink1 === pack.ink1 && page.ink2 === pack.ink2;
                return (
                  <div key={pack.name} onClick={() => updatePage(page.id, { ink1: pack.ink1, ink2: pack.ink2 })}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 7px", cursor: "pointer", background: active ? "rgba(240,235,224,0.08)" : "transparent", border: `1px solid ${active ? "rgba(240,235,224,0.2)" : "transparent"}`, transition: "background 0.1s" }}>
                    <div style={{ display: "flex", gap: 3 }}>
                      <div style={{ width: 14, height: 14, background: pack.ink1, borderRadius: 2 }} />
                      <div style={{ width: 14, height: 14, background: pack.ink2, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 9, letterSpacing: "0.1em", color: active ? "#f0ebe0" : dim }}>{pack.name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 8, letterSpacing: "0.2em", color: dim, marginBottom: 6, textTransform: "uppercase" }}>Ink 1</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {ALL_INKS.map(c => (
                    <div key={c} onClick={() => updatePage(page.id, { ink1: c })}
                      style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: `2px solid ${page.ink1 === c ? "white" : "transparent"}`, cursor: "pointer", transition: "transform 0.1s" }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.2)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 8, letterSpacing: "0.2em", color: dim, marginBottom: 6, textTransform: "uppercase" }}>Ink 2</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {ALL_INKS.map(c => (
                    <div key={c} onClick={() => updatePage(page.id, { ink2: c })}
                      style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: `2px solid ${page.ink2 === c ? "white" : "transparent"}`, cursor: "pointer", transition: "transform 0.1s" }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.2)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Texture */}
        <div>
          <SL>Paper Texture</SL>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {TEXTURES.map(t => (
              <div key={t.id} onClick={() => updatePage(page.id, { texture: t.id })}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 7px", cursor: "pointer", background: page.texture === t.id ? "rgba(240,235,224,0.08)" : "transparent", border: `1px solid ${page.texture === t.id ? "rgba(240,235,224,0.2)" : "transparent"}`, transition: "background 0.1s" }}>
                <div style={{ width: 22, height: 16, background: paperBg(t.id), border: "1px solid rgba(0,0,0,0.12)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                  {t.id === "lined" && <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(to bottom, transparent 3px, transparent 5px, rgba(0,0,0,0.15) 5px, rgba(0,0,0,0.15) 6px)" }} />}
                  {t.id === "grid"  && <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.12) 1px, transparent 1px)", backgroundSize: "5px 5px" }} />}
                  {t.id === "blueprint" && <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,51,102,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,51,102,0.2) 1px, transparent 1px)", backgroundSize: "5px 5px" }} />}
                </div>
                <span style={{ fontSize: 9, letterSpacing: "0.1em", color: page.texture === t.id ? "#f0ebe0" : dim }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CANVAS */}
      <div style={{
        overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#2a2825",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 0)",
        backgroundSize: "40px 40px", padding: "2rem",
      }}>
        {/* All pages mounted, only current visible — preserves contenteditable content */}
        <div style={{ position: "relative" }}>
          {pages.map(p => {
            const Layout = LAYOUT_COMPONENTS[p.template];
            return (
              <div key={p.id} style={{ display: p.id === current ? "block" : "none" }}>
                <div style={{
                  width: 400, height: 566, background: paperBg(p.texture),
                  position: "relative", flexShrink: 0,
                  boxShadow: "0 8px 60px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
                  overflow: "hidden",
                }}>
                  <Layout ink1={p.ink1} ink2={p.ink2} />
                  <TextureOverlay texture={p.texture} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PAGE STRIP */}
      <div style={{ gridColumn: "1/-1", background: "#111", borderTop: `1px solid ${border}`, display: "flex", alignItems: "center", padding: "0 1rem", gap: "0.75rem", overflowX: "auto" }}>
        {pages.map((p, idx) => (
          <div key={p.id} onClick={() => setCurrent(p.id)}
            style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 38, height: 54,
              background: paperBg(p.texture),
              border: `2px solid ${p.id === current ? "#f0ebe0" : "rgba(240,235,224,0.15)"}`,
              cursor: "pointer", transition: "border-color 0.15s",
              display: "flex", flexDirection: "column", padding: 3, gap: 2,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ height: 3, background: p.ink2, opacity: 0.7 }} />
              <div style={{ flex: 1, background: p.ink1, opacity: 0.08 }} />
              <div style={{ height: 2, background: p.ink1, opacity: 0.2 }} />
            </div>
            <div style={{ position: "absolute", bottom: -16, left: 0, right: 0, textAlign: "center", fontSize: 8, color: dim, letterSpacing: "0.05em" }}>{idx + 1}</div>
            {pages.length > 1 && p.id === current && (
              <div
                onClick={e => { e.stopPropagation(); deletePage(p.id); }}
                style={{ position: "absolute", top: -6, right: -6, width: 14, height: 14, background: "#cc2200", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 9, color: "#fff", lineHeight: 1 }}>
                ×
              </div>
            )}
          </div>
        ))}

        {/* Add page */}
        <div onClick={addPage}
          style={{ width: 38, height: 54, border: `2px dashed rgba(240,235,224,0.2)`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: dim, fontSize: 20, transition: "border-color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(240,235,224,0.5)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(240,235,224,0.2)")}>
          +
        </div>
      </div>

      <style>{`
        @media print {
          body > div { display: block !important; height: auto !important; }
        }
        [data-ph]:empty::before { content: attr(data-ph); opacity: 0.22; font-style: italic; pointer-events: none; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>
    </div>
  );
}

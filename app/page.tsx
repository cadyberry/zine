"use client";
import { useState, useCallback } from "react";

const INKS = [
  "#1a1a1a", "#cc2200", "#0033aa", "#006644", "#7700cc",
  "#cc7700", "#cc0066", "#004466",
];
const INK_LABELS = ["Black", "Red", "Blue", "Green", "Purple", "Amber", "Pink", "Navy"];

type Template = "cover" | "spread" | "pullquote" | "collage";
const TEMPLATES: { id: Template; label: string }[] = [
  { id: "cover",     label: "Cover"     },
  { id: "spread",    label: "Spread"    },
  { id: "pullquote", label: "Pull Quote"},
  { id: "collage",   label: "Collage"   },
];

function TemplateThumbnail({ id }: { id: Template }) {
  const s = { background: "rgba(0,0,0,0.18)", borderRadius: 1 };
  const b = { background: "rgba(0,0,0,0.08)", borderRadius: 1, flex: 1 };
  if (id === "cover") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: 6, height: "100%", background: "#e4ddd0" }}>
      <div style={{ ...s, height: 4 }} /><div style={{ ...b, flex: 2 }} />
      <div style={{ ...s, height: 2 }} /><div style={{ ...b }} />
      <div style={{ ...s, height: 3 }} />
    </div>
  );
  if (id === "spread") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: 5, height: "100%", background: "#e4ddd0" }}>
      <div style={{ ...s, height: 4 }} />
      <div style={{ display: "flex", gap: 3, flex: 1 }}>
        <div style={{ ...b }} /><div style={{ ...b }} />
      </div>
    </div>
  );
  if (id === "pullquote") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: 5, height: "100%", background: "#e4ddd0" }}>
      <div style={{ ...s, height: 4 }} /><div style={{ ...b }} />
      <div style={{ ...s, height: 9 }} /><div style={{ ...b }} />
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: 5, height: "100%", background: "#e4ddd0" }}>
      <div style={{ ...s, height: 4 }} />
      <div style={{ display: "flex", gap: 3, flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 2 }}>
          <div style={{ ...b }} /><div style={{ ...b }} />
        </div>
        <div style={{ ...b, flex: 1 }} />
      </div>
    </div>
  );
}

function E({ placeholder, style = {}, tag = "div" }: { placeholder: string; style?: React.CSSProperties; tag?: string }) {
  const base: React.CSSProperties = {
    outline: "none", border: "1.5px dashed transparent", padding: 3,
    cursor: "text", wordBreak: "break-word", overflow: "hidden",
    width: "100%", minHeight: "1em",
  };
  return (
    <div
      contentEditable suppressContentEditableWarning
      data-placeholder={placeholder}
      style={{ ...base, ...style }}
      onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.2)")}
      onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
    />
  );
}

function CoverLayout({ ink1, ink2 }: { ink1: string; ink2: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "28px 24px", height: "100%", fontFamily: "'Courier New', monospace" }}>
      <E placeholder="ISSUE NO. 01 — 2025" style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.5, color: ink2, marginBottom: 12 }} />
      <div style={{ flex: 1 }}>
        <E placeholder="YOUR ZINE TITLE HERE" style={{ fontSize: 42, fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.025em", color: ink1, marginBottom: 16 }} />
        <div style={{ height: 3, background: ink2, marginBottom: 16 }} />
        <E placeholder="A description, subtitle, or tagline. Keep it short and punchy." style={{ fontSize: 8, lineHeight: 1.7, color: ink1 }} />
      </div>
      <E placeholder="By your name · yoursite.com" style={{ fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.55, color: ink1, marginTop: "auto" }} />
    </div>
  );
}

function SpreadLayout({ ink1, ink2 }: { ink1: string; ink2: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "28px 1fr", padding: 20, gap: 12, height: "100%", fontFamily: "'Courier New', monospace" }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <E placeholder="SECTION TITLE" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ink2 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <E placeholder="Write your story, thoughts, or essay. This is your left column — fill it with words." style={{ fontSize: 8, lineHeight: 1.7, color: ink1, flex: 1 }} />
        <E placeholder="Caption · Source" style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.55, color: ink1 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ flex: 1, background: ink2, opacity: 0.15, minHeight: 80 }} />
        <E placeholder="Image caption or pull fact here." style={{ fontSize: 8, lineHeight: 1.7, color: ink1 }} />
        <div style={{ height: 2, background: ink2 }} />
        <E placeholder="pg. 2" style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.55, color: ink1 }} />
      </div>
    </div>
  );
}

function PullquoteLayout({ ink1, ink2 }: { ink1: string; ink2: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "32px 28px", gap: 16, height: "100%", fontFamily: "'Courier New', monospace" }}>
      <E placeholder="SECTION TITLE OR DATE" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ink2 }} />
      <E placeholder="Body text goes here. This layout centers on a dramatic pull quote below — write your setup copy in this zone." style={{ fontSize: 8, lineHeight: 1.7, color: ink1, flex: 1 }} />
      <div style={{ borderLeft: `4px solid ${ink2}`, paddingLeft: 14 }}>
        <E placeholder='"The most important thing I ever did was decide to begin."' style={{ fontFamily: "Georgia, serif", fontSize: 22, fontStyle: "italic", lineHeight: 1.38, color: ink1 }} />
      </div>
      <E placeholder="Body text continues. Wrap up your thought, add a reflection, sign off." style={{ fontSize: 8, lineHeight: 1.7, color: ink1, flex: 1 }} />
      <E placeholder="· END ·" style={{ fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.55, color: ink2, textAlign: "center" } as React.CSSProperties} />
    </div>
  );
}

function CollageLayout({ ink1, ink2 }: { ink1: string; ink2: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gridTemplateRows: "36px 1fr 1fr 28px", padding: 20, gap: 8, height: "100%", fontFamily: "'Courier New', monospace" }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <E placeholder="COLLAGE — VOL. III" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ink2 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ flex: 1, background: ink2, opacity: 0.12 }} />
        <E placeholder="A note on the left. Two or three lines." style={{ fontSize: 8, lineHeight: 1.7, color: ink1 }} />
      </div>
      <div style={{ gridRow: "2 / 4", background: ink1, display: "flex", alignItems: "flex-end", padding: 6 }}>
        <E placeholder="caption" style={{ fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", color: ink2 }} />
      </div>
      <div>
        <E placeholder="More notes, a small story, a list of things." style={{ fontSize: 8, lineHeight: 1.7, color: ink1 }} />
      </div>
      <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "flex-end" }}>
        <E placeholder="page 4 · your zine · 2025" style={{ fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.55, color: ink1 }} />
      </div>
    </div>
  );
}

export default function ZineBuilder() {
  const [template, setTemplate] = useState<Template>("cover");
  const [ink1, setInk1]         = useState(INKS[0]);
  const [ink2, setInk2]         = useState(INKS[1]);
  const [grain, setGrain]       = useState(true);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gridTemplateRows: "48px 1fr", height: "100vh", fontFamily: "'Courier New', monospace", background: "#1c1a18", color: "#f0ebe0" }}>

      {/* TOPBAR */}
      <div style={{ gridColumn: "1 / -1", background: "#111", borderBottom: "1px solid rgba(240,235,224,0.12)", display: "flex", alignItems: "center", padding: "0 1rem", gap: "1.5rem" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" }}>ZINE</span>
        <div style={{ width: 1, height: 20, background: "rgba(240,235,224,0.12)" }} />
        <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(240,235,224,0.3)", textTransform: "uppercase" }}>Click any text to edit</span>
        <button
          onClick={() => window.print()}
          style={{ marginLeft: "auto", fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 14px", border: "1px solid rgba(240,235,224,0.12)", background: "#f0ebe0", color: "#1c1a18", cursor: "pointer" }}
        >
          Print / Save
        </button>
      </div>

      {/* SIDEBAR */}
      <div style={{ background: "#161412", borderRight: "1px solid rgba(240,235,224,0.12)", overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,235,224,0.4)", marginBottom: "0.6rem" }}>Layout</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {TEMPLATES.map(t => (
              <div
                key={t.id}
                onClick={() => setTemplate(t.id)}
                title={t.label}
                style={{
                  aspectRatio: "5/7", border: `2px solid ${template === t.id ? "#f0ebe0" : "transparent"}`,
                  cursor: "pointer", overflow: "hidden", transition: "border-color 0.15s",
                }}
              >
                <TemplateThumbnail id={t.id} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,235,224,0.4)", marginBottom: "0.6rem" }}>Ink 1 — primary</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {INKS.map((c, i) => (
              <div key={c} onClick={() => setInk1(c)} title={INK_LABELS[i]}
                style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: `2px solid ${ink1 === c ? "white" : "transparent"}`, cursor: "pointer", transition: "transform 0.1s", }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.2)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,235,224,0.4)", marginBottom: "0.6rem" }}>Ink 2 — accent</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {INKS.map((c, i) => (
              <div key={c} onClick={() => setInk2(c)} title={INK_LABELS[i]}
                style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: `2px solid ${ink2 === c ? "white" : "transparent"}`, cursor: "pointer", transition: "transform 0.1s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.2)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,235,224,0.4)", marginBottom: "0.6rem" }}>Texture</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, letterSpacing: "0.1em", color: "rgba(240,235,224,0.4)" }}>
            <span>Paper grain</span>
            <div
              onClick={() => setGrain(g => !g)}
              style={{ width: 32, height: 17, background: grain ? "#f0ebe0" : "rgba(255,255,255,0.1)", borderRadius: 9, position: "relative", cursor: "pointer", transition: "background 0.2s" }}
            >
              <div style={{ position: "absolute", top: 2, left: 2, width: 13, height: 13, background: "#1c1a18", borderRadius: "50%", transition: "transform 0.2s", transform: grain ? "translateX(15px)" : "none" }} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid rgba(240,235,224,0.1)" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,235,224,0.4)", marginBottom: "0.5rem" }}>Tips</div>
          <p style={{ fontSize: 9, lineHeight: 1.7, color: "rgba(240,235,224,0.35)", letterSpacing: "0.05em" }}>
            Click any text zone to edit it.<br />
            Switch layouts anytime.<br />
            Use Print / Save to export.
          </p>
        </div>
      </div>

      {/* CANVAS */}
      <div style={{
        overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#2a2825",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 0)",
        backgroundSize: "40px 40px",
        padding: "2rem",
      }}>
        <div style={{
          width: 400, height: 566,
          background: "#f0ebe0",
          position: "relative", flexShrink: 0,
          boxShadow: "0 8px 60px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}>
          {template === "cover"     && <CoverLayout ink1={ink1} ink2={ink2} />}
          {template === "spread"    && <SpreadLayout ink1={ink1} ink2={ink2} />}
          {template === "pullquote" && <PullquoteLayout ink1={ink1} ink2={ink2} />}
          {template === "collage"   && <CollageLayout ink1={ink1} ink2={ink2} />}

          {/* grain overlay */}
          {grain && (
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50,
              opacity: 0.5, mixBlendMode: "multiply",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px",
            }} />
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body > div { display: block !important; height: auto !important; }
          div[style*="background: #111"], div[style*="background: #161412"] { display: none !important; }
          div[style*="background: #2a2825"] { background: none !important; padding: 0 !important; display: block !important; }
          div[style*="width: 400px"] { box-shadow: none !important; margin: 0 auto; }
        }
        [contenteditable]:empty::before { content: attr(data-placeholder); opacity: 0.25; font-style: italic; pointer-events: none; }
        [contenteditable]:focus { outline: none; border-color: rgba(0,0,0,0.2) !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>
    </div>
  );
}

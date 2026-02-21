"use client";

import { useState, useRef, useEffect } from "react";

// ── Button ─────────────────────────────────────────────────────────────────
export function Btn({
  children, onClick, variant = "primary", size = "md", disabled = false, style = {},
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md"; disabled?: boolean; style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    borderRadius: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit", fontWeight: 500, transition: "all 0.15s",
    opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap",
    padding: size === "sm" ? "5px 10px" : "8px 16px",
    fontSize: size === "sm" ? 12 : 13,
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: "var(--accent)", color: "#fff" },
    secondary: { background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border2)" },
    ghost: { background: "transparent", color: "var(--text2)" },
    danger: { background: "rgba(247,112,106,0.12)", color: "var(--high)", border: "1px solid rgba(247,112,106,0.2)" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ── IconBtn ────────────────────────────────────────────────────────────────
export function IconBtn({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button onClick={onClick} title={title} style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)",
      background: "var(--surface2)", color: "var(--text2)", cursor: "pointer",
      transition: "all 0.15s",
    }}>
      {children}
    </button>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────
export function Input({
  value, onChange, placeholder, autoFocus, type = "text", style = {},
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  autoFocus?: boolean; type?: string; style?: React.CSSProperties;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      style={{
        width: "100%", padding: "9px 12px", background: "var(--surface2)",
        border: "1px solid var(--border2)", borderRadius: 8,
        color: "var(--text)", fontSize: 13.5, outline: "none", fontFamily: "inherit",
        ...style,
      }}
      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--border2)")}
    />
  );
}

// ── Textarea ───────────────────────────────────────────────────────────────
export function Textarea({
  value, onChange, placeholder, rows = 3,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%", padding: "9px 12px", background: "var(--surface2)",
        border: "1px solid var(--border2)", borderRadius: 8, color: "var(--text)",
        fontSize: 13.5, outline: "none", fontFamily: "inherit", resize: "vertical",
      }}
      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--border2)")}
    />
  );
}

// ── Select ─────────────────────────────────────────────────────────────────
export function Select({
  value, onChange, children,
}: {
  value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", padding: "9px 12px", background: "var(--surface2)",
        border: "1px solid var(--border2)", borderRadius: 8, color: "var(--text)",
        fontSize: 13.5, outline: "none", fontFamily: "inherit", cursor: "pointer",
      }}
    >
      {children}
    </select>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({
  isOpen, onClose, title, children, footer,
}: {
  isOpen: boolean; onClose: () => void; title: string;
  children: React.ReactNode; footer?: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(10,9,20,0.7)",
        backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
        justifyContent: "center", zIndex: 1000, padding: 16,
      }}
    >
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border2)",
        borderRadius: 16, width: "100%", maxWidth: 500, maxHeight: "92vh",
        overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        animation: "modal-in 0.2s ease",
      }}>
        <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontWeight: 700, fontSize: 16 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: "18px 20px" }}>{children}</div>
        {footer && (
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            {footer}
          </div>
        )}
      </div>
      <style>{`@keyframes modal-in { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}

// ── FormGroup ─────────────────────────────────────────────────────────────
export function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text2)", marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ children, color = "slate" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    slate: "background:var(--surface2);color:var(--text2);border:1px solid var(--border2)",
    violet: "background:var(--accent-glow);color:var(--accent2);border:1px solid var(--accent)",
    high: "background:rgba(247,112,106,0.15);color:var(--high)",
    med: "background:rgba(247,193,106,0.15);color:var(--med)",
    low: "background:rgba(106,247,184,0.15);color:var(--low)",
    done: "background:rgba(106,247,184,0.15);color:var(--done)",
    inprog: "background:rgba(106,175,247,0.15);color:var(--inprog)",
    todo: "background:rgba(157,151,196,0.15);color:var(--todo)",
  };
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500 }}
      dangerouslySetInnerHTML={{ __html: `<span style="${colors[color] || colors.slate}">${String(children)}</span>` }}
    />
  );
}

// ── ProgressBar ────────────────────────────────────────────────────────────
export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ height: 3, background: "var(--border)", borderRadius: 99, overflow: "hidden", marginTop: 8 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 99, transition: "width 0.4s ease" }} />
    </div>
  );
}

// ── Breadcrumb ─────────────────────────────────────────────────────────────
export function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text3)", marginBottom: 16 }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && <span>›</span>}
          <span
            onClick={item.onClick}
            style={{ cursor: item.onClick ? "pointer" : "default", color: item.onClick ? "var(--text3)" : "var(--text2)", fontWeight: i === items.length - 1 ? 500 : 400 }}
          >
            {item.label}
          </span>
        </span>
      ))}
    </div>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: {
  tabs: { id: string; label: string; count?: number }[];
  active: string; onChange: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 18, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 4, width: "fit-content" }}>
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => onChange(tab.id)} style={{
          padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500,
          cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.15s",
          background: active === tab.id ? "var(--accent)" : "transparent",
          color: active === tab.id ? "#fff" : "var(--text2)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {tab.label}
          {tab.count !== undefined && (
            <span style={{
              fontSize: 10, padding: "1px 6px", borderRadius: 99,
              background: active === tab.id ? "rgba(255,255,255,0.2)" : "var(--border)",
              color: active === tab.id ? "#fff" : "var(--text3)",
            }}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Empty ──────────────────────────────────────────────────────────────────
export function Empty({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text3)" }}>
      <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.5 }}>{emoji}</div>
      <h3 style={{ fontSize: 15, color: "var(--text2)", marginBottom: 4 }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 13 }}>{subtitle}</p>}
    </div>
  );
}

// ── VoiceButton ────────────────────────────────────────────────────────────
export function VoiceButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const recRef = useRef<any>(null);

  const toggle = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice not supported. Please use Chrome or Safari.");
      return;
    }
    if (recording) {
      recRef.current?.stop();
      setRecording(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      onTranscript(e.results[0][0].transcript);
      setRecording(false);
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);
    recRef.current = rec;
    rec.start();
    setRecording(true);
  };

  return (
    <button onClick={toggle} style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px",
      borderRadius: 7, border: `1px solid ${recording ? "var(--high)" : "var(--border2)"}`,
      background: recording ? "rgba(247,112,106,0.1)" : "var(--surface2)",
      color: recording ? "var(--high)" : "var(--text2)", cursor: "pointer",
      fontSize: 12, fontFamily: "inherit", transition: "all 0.2s",
      animation: recording ? "pulse 1.2s ease-in-out infinite" : "none",
    }}>
      {recording ? (
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--high)" }} />
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      )}
      {recording ? "Listening…" : "Voice"}
      <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(247,112,106,0.3)} 50%{box-shadow:0 0 0 5px rgba(247,112,106,0)} }`}</style>
    </button>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, onClick, style = {} }: {
  children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: 18, cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s, box-shadow 0.15s",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 1px var(--accent)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {children}
    </div>
  );
}

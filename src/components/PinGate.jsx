import { useEffect, useRef, useState } from "react";
import { UI_EN } from "../content/ui.en.js";
import { getUiStrings } from "../voice/uiLocalize.js";
import { INK } from "../theme.js";

export function PinGate({ lang, onDone, onCancel }) {
  const [pin, setPin] = useState("");
  const [ui, setUi] = useState(UI_EN);
  const dialogRef = useRef(null);
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  useEffect(() => {
    if (!lang || lang === "en") {
      setUi(UI_EN);
      return;
    }
    let active = true;
    setUi(UI_EN);
    getUiStrings(lang)
      .then((strings) => { if (active) setUi({ ...UI_EN, ...strings }); })
      .catch(() => { if (active) setUi(UI_EN); });
    return () => { active = false; };
  }, [lang]);

  useEffect(() => {
    if (pin.length === 4) {
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
  }, [pin, onDone]);

  // Move focus into the dialog, and support a real keyboard (digits, Backspace,
  // Escape) — this is the transaction gate, it must be operable without a mouse.
  useEffect(() => {
    dialogRef.current?.focus?.();
    const onKey = (e) => {
      if (e.key >= "0" && e.key <= "9") setPin((p) => (p.length < 4 ? p + e.key : p));
      else if (e.key === "Backspace") setPin((p) => p.slice(0, -1));
      else if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const t = (key) => ui[key] || UI_EN[key] || "";
  const subtitle = t("pinSubtitle").split("\n").map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {line}
    </span>
  ));

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("pinTitle")}
      tabIndex={-1}
      style={{ position: "absolute", inset: 0, zIndex: 60, background: "rgba(0,0,0,.6)", display: "flex", flexDirection: "column", justifyContent: "flex-end", outline: "none" }}
    >
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 22px 28px" }}>
        <div style={{ textAlign: "center", fontWeight: 800, fontSize: 20 }}>{t("pinTitle")}</div>
        <div style={{ textAlign: "center", color: "#767676", fontWeight: 600, margin: "6px 0 22px", fontSize: 13, lineHeight: 1.4 }}>
          {subtitle}
        </div>
        <div
          style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 28 }}
          role="status"
          aria-label={`${pin.length} of 4 digits entered`}
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i} aria-hidden="true" style={{ width: 14, height: 14, borderRadius: 7, background: i < pin.length ? INK : "#ddd", transition: "background .15s" }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, maxWidth: 280, margin: "0 auto" }}>
          {keys.map((k, i) =>
            k ? (
              <button
                key={i}
                type="button"
                className="tap btn-reset"
                aria-label={k === "⌫" ? "Delete" : k}
                onClick={() => {
                  if (k === "⌫") setPin((p) => p.slice(0, -1));
                  else setPin((p) => (p.length < 4 ? p + k : p));
                }}
                style={{ padding: 18, textAlign: "center", fontSize: 22, fontWeight: 700, borderRadius: 16, background: "#f5f5f5", cursor: "pointer" }}
              >
                {k}
              </button>
            ) : (
              <div key={i} aria-hidden="true" style={{ padding: 18 }} />
            )
          )}
        </div>
        <button type="button" className="tap btn-reset" onClick={onCancel} style={{ display: "block", width: "100%", textAlign: "center", marginTop: 18, color: "#767676", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>{t("pinCancel")}</button>
      </div>
    </div>
  );
}

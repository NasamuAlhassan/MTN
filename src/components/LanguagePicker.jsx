import { LANGS } from "../content/langs.js";
import { UI_EN } from "../content/ui.en.js";
import { YELLOW, shadow } from "../theme.js";

export function LanguagePicker({ onSelect, compact = false, ui = UI_EN }) {
  const t = (key) => ui[key] || UI_EN[key] || "";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: compact ? "stretch" : "center", width: "100%" }}>
      {!compact && (
        <>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>{t("chooseLanguage")}</div>
          <div style={{ color: "#777", fontWeight: 600, marginBottom: 20, fontSize: 13, textAlign: "center" }}>
            {t("chooseLanguageHint")}
          </div>
        </>
      )}
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          className="tap btn-reset"
          onClick={() => onSelect(l.code)}
          aria-label={`${l.label} — ${l.hi}`}
          style={{
            width: "100%",
            background: l.code === "en" ? "#f5f5f5" : YELLOW,
            borderRadius: 16,
            padding: compact ? "14px 16px" : "16px 18px",
            marginBottom: 10,
            fontWeight: 800,
            fontSize: compact ? 15 : 17,
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: l.code !== "en" ? shadow.md : shadow.sm,
            border: l.code === "en" ? "1px solid #e8e8e8" : "none",
          }}
        >
          <span>{l.label}</span>
          <span style={{ fontWeight: 700, opacity: 0.65, fontSize: 14 }}>{l.hi}</span>
        </button>
      ))}
    </div>
  );
}
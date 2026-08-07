import { YELLOW, INK, GRAY_400 } from "../theme.js";
import { Ico } from "./Icons.jsx";

export function PageShell({ title, subtitle, onBack, children, noPad }) {
  return (
    <div className="page" style={{ position: "relative", minHeight: "100%" }}>
      {onBack && (
        <button type="button" className="page-back tap btn-reset" onClick={onBack} aria-label="Go back">
          {Ico.back(INK)}
        </button>
      )}
      {title && <div className="page-title">{title}</div>}
      {subtitle && <div className="page-sub">{subtitle}</div>}
      <div style={{ paddingTop: noPad ? 0 : 4 }}>{children}</div>
    </div>
  );
}

export function BalCard({ label, value, sub = "No bonus", onTopUp, onOpen }) {
  return (
    <div
      style={{
        minWidth: 160,
        background: "#1a1a1a",
        borderRadius: 18,
        padding: "14px 16px 16px",
        color: "#fff",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", bottom: -30, right: -30, width: 90, height: 90, borderRadius: 45, border: "12px solid rgba(255,255,255,.04)" }} />
      <button
        type="button"
        className="tap btn-reset"
        onClick={onOpen}
        aria-label={`${label} balance details`}
        disabled={!onOpen}
        style={{ display: "flex", width: "100%", justifyContent: "space-between", color: "#9a9a9a", fontWeight: 600, fontSize: 13, cursor: onOpen ? "pointer" : "default" }}
      >
        {label}{Ico.chevronRight("#9a9a9a")}
      </button>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 18, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ color: "#8a8a8a", fontSize: 12, marginTop: 2 }}>{sub}</div>
      <button type="button" className="tap btn-reset" onClick={onTopUp} aria-label={`Top up ${label}`} style={{ marginTop: 14, background: YELLOW, color: INK, fontWeight: 800, borderRadius: 22, padding: "8px 0", textAlign: "center", width: 100, fontSize: 13, cursor: "pointer" }}>
        Top Up
      </button>
    </div>
  );
}

export function BuyTile({ label, icon, onClick }) {
  return (
    <button type="button" className="tap cat-tile btn-reset" onClick={onClick} aria-label={label} style={{ aspectRatio: "1", minHeight: 110, width: "100%" }}>
      <div className="icon-circle">{icon("#fff")}</div>
      <span>{label}</span>
    </button>
  );
}

export function ListRow({ title, desc, onClick, icon }) {
  return (
    <button type="button" className="tap btn-reset" onClick={onClick} aria-label={desc ? `${title}. ${desc}` : title} style={{ margin: "0 16px 10px", width: "calc(100% - 32px)", border: "1px solid #ebebeb", borderRadius: 16, padding: "14px 16px", display: "flex", gap: 14, alignItems: "center", cursor: "pointer", background: "#fff" }}>
      {icon && <div className="icon-circle-sm">{icon("#fff")}</div>}
      <span style={{ flex: 1, textAlign: "left" }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{title}</div>
        {desc && <div style={{ color: GRAY_400, fontWeight: 500, fontSize: 13, marginTop: 3, lineHeight: 1.35 }}>{desc}</div>}
      </span>
      <span style={{ color: "#bbb" }}>{Ico.chevronRight("#bbb")}</span>
    </button>
  );
}

export function BundleCard({ title, data, cost, hot, onClick }) {
  const costStr = String(cost).includes("GHS") ? cost : `GHS ${cost}`;
  return (
    <button
      type="button"
      className="tap btn-reset"
      onClick={onClick}
      disabled={!onClick}
      aria-pressed={hot || undefined}
      aria-label={`${title}. Data ${data}. Cost ${costStr}.`}
      style={{
        display: "block",
        width: "calc(100% - 32px)",
        background: "#1a1a1a",
        borderRadius: 18,
        padding: 18,
        margin: "0 16px 12px",
        border: hot ? `2px solid ${YELLOW}` : "2px solid transparent",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ color: "#fff", fontWeight: 800, marginBottom: 16, fontSize: 16 }}>{title}</div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#9a9a9a", fontSize: 13, fontWeight: 600 }}>Data</div>
          <div style={{ color: YELLOW, fontWeight: 800, fontSize: 17, marginTop: 2 }}>{data}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#9a9a9a", fontSize: 13, fontWeight: 600 }}>Cost</div>
          <div style={{ color: YELLOW, fontWeight: 800, fontSize: 17, marginTop: 2 }}>{costStr}</div>
        </div>
      </div>
    </button>
  );
}
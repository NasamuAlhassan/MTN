import { USER } from "../data/user.js";
import { YELLOW, INK } from "../theme.js";
import { HistoryBtn } from "../components/ui.jsx";
import { PageShell } from "../components/Layout.jsx";

export function BalanceDetails({ type = "airtime", onBack, onTopUp }) {
  const isData = type === "data";
  const amount = isData ? USER.data : `GHS ${USER.airtime.toFixed(2)}`;
  const label = isData ? "Data" : "Airtime";

  return (
    <PageShell title="Balance Details" onBack={onBack} noPad>
      <div style={{ padding: "8px 16px 0", position: "relative", minHeight: "60vh" }}>
        <div style={{ background: "#1a1a1a", borderRadius: 20, padding: "20px 20px 24px", position: "relative", overflow: "hidden", marginBottom: 28 }}>
          <div style={{ position: "absolute", bottom: -40, right: -40, width: 120, height: 120, borderRadius: 60, border: "16px solid rgba(255,255,255,.04)" }} />
          <div style={{ color: "#9a9a9a", fontWeight: 600, fontSize: 14 }}>{label}</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: "16px 0 20px" }}>{amount}</div>
          <button type="button" className="tap btn-reset" onClick={onTopUp} aria-label={`Top up ${label}`} style={{ width: "100%", background: YELLOW, color: INK, fontWeight: 800, borderRadius: 24, padding: "12px 0", textAlign: "center", fontSize: 15, cursor: "pointer" }}>
            Top Up
          </button>
        </div>

        <div style={{ height: 1, background: "#eee", marginBottom: 20 }} />

        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Balance Breakdown</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 700 }}>{label}</span>
          <span style={{ fontWeight: 700 }}>{amount}</span>
        </div>
        <div style={{ color: "#888", fontSize: 14 }}>Non-expiry</div>
      </div>
      <HistoryBtn onClick={onBack} />
    </PageShell>
  );
}
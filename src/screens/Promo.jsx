import { USER } from "../data/user.js";
import { YELLOW } from "../theme.js";
import { PageShell } from "../components/Layout.jsx";
import { useState } from "react";

export function Promo({ onBack }) {
  const [tab, setTab] = useState("points");

  return (
    <PageShell
      title="Mega Promo"
      subtitle="Three decades together, Earn points every time you call, browse or buy and compete for prizes in your zone."
      onBack={onBack}
      noPad
    >
      <div style={{ display: "flex", gap: 10, padding: "0 16px 16px" }}>
        {["Zone1", "Greater Accra Region"].map((z) => (
          <div key={z} style={{ flex: 1, border: "1px solid #ddd", borderRadius: 14, padding: "12px 10px", textAlign: "center", fontWeight: 700, fontSize: 13 }}>{z}</div>
        ))}
      </div>

      <div style={{ margin: "0 16px 20px", background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#888", fontSize: 13, fontWeight: 600 }}>Total Points</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{USER.promo}</div>
        </div>
        <div style={{ fontSize: 48 }}>🪙</div>
      </div>

      <div style={{ display: "flex", margin: "0 16px 16px", background: "#f0f0f0", borderRadius: 14, padding: 4 }}>
        {[
          { id: "points", label: "My Points" },
          { id: "how", label: "How it works" },
        ].map((t) => (
          <button
            type="button"
            key={t.id}
            className="tap btn-reset"
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 12, fontWeight: 700, fontSize: 14, background: tab === t.id ? "#fff" : "transparent", cursor: "pointer" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>This Month</div>
        <div style={{ border: `2px solid ${YELLOW}`, borderRadius: 16, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>July, 2026</div>
            <div style={{ color: "#2e7d32", fontWeight: 700, fontSize: 13, marginTop: 4 }}>● Active</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{USER.promo}</div>
            <div style={{ color: "#888", fontSize: 12 }}>Points Earned</div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
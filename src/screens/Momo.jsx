import { useState } from "react";
import { USER } from "../data/user.js";
import { SCREENS } from "../navigation/screens.js";
import { YELLOW, INK } from "../theme.js";
import { Ico } from "../components/Icons.jsx";
import { ListRow } from "../components/Layout.jsx";

export function Momo({ onNavigate }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ paddingBottom: 90, background: "#fff" }}>
      {/* Yellow header with wave — ref photo_36 */}
      <div style={{ background: YELLOW, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.15, background: "radial-gradient(ellipse at 30% 80%, #fff 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, #fff 0%, transparent 50%)" }} />
        <div style={{ padding: "22px 16px 8px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#3d3000", display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
            MoMo Balance
            <button type="button" className="tap btn-reset" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide balance" : "Show balance"} aria-pressed={show} style={{ cursor: "pointer", display: "flex" }}>{Ico.eye("#3d3000")}</button>
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, margin: "10px 0 18px", letterSpacing: "-0.02em", color: INK }}>
            {show ? `GHS ${USER.momo.toFixed(2)}` : "GHS ****"}
          </div>
          <button type="button" className="tap btn-reset" onClick={() => onNavigate(SCREENS.MOMO_PAY)} aria-label="MoMo pay" style={{ background: "rgba(255,255,255,.45)", display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 26, fontWeight: 800, fontSize: 14, cursor: "pointer", color: INK }}>
            {Ico.qr(INK)} Momo pay
          </button>
        </div>
        <svg viewBox="0 0 390 24" style={{ display: "block", width: "100%", marginBottom: -1 }}>
          <path d="M0 0h390v8c-80 18-150 22-195 22S50 26 0 8V0z" fill="#fff" />
        </svg>
      </div>

      <div style={{ display: "flex", padding: "18px 8px 20px", gap: 2 }}>
        {[
          { label: "Send MoMo", icon: Ico.sendMomo, id: SCREENS.SEND },
          { label: "Approvals", icon: Ico.check, id: SCREENS.APPROVALS },
          { label: "Cashout", icon: Ico.cashout, id: SCREENS.CASHOUT },
          { label: "Bank Services", icon: Ico.bank, id: SCREENS.BANK },
        ].map((a) => (
          <button type="button" key={a.label} className="tap btn-reset" onClick={() => onNavigate(a.id)} aria-label={a.label} style={{ textAlign: "center", flex: 1, cursor: "pointer" }}>
            <div style={{ width: 54, height: 54, borderRadius: 27, background: INK, margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {a.icon("#fff")}
            </div>
            <div style={{ fontWeight: 700, fontSize: 11, lineHeight: 1.2 }}>{a.label}</div>
          </button>
        ))}
      </div>

      <ListRow title="Statements" desc="View and manage your transactions." icon={Ico.doc} onClick={() => onNavigate(SCREENS.STATEMENTS)} />
      <ListRow title="Report Fraud" desc="Report suspicious activities." icon={Ico.shield} onClick={() => onNavigate(SCREENS.FRAUD)} />

      {/* Promo strip like ref */}
      <div style={{ margin: "8px 16px 0", borderRadius: 14, height: 72, background: "linear-gradient(135deg,#ffe066,#ffcc00)", overflow: "hidden", opacity: 0.9 }} />
    </div>
  );
}
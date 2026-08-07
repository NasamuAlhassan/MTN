import { USER } from "../data/user.js";
import { SCREENS } from "../navigation/screens.js";
import { YELLOW, INK } from "../theme.js";
import { Ico } from "../components/Icons.jsx";
import { BalCard } from "../components/Layout.jsx";

const BUY_TILES = [
  { label: "Just4U", screen: SCREENS.JUST4U, bg: "linear-gradient(135deg,#4a6741,#2a3a28)" },
  { label: "Mashup", screen: SCREENS.MASHUP, bg: "linear-gradient(135deg,#3d4a5c,#1e2836)" },
  { label: "Data Bundles", screen: SCREENS.DATA_CATEGORIES, bg: "linear-gradient(135deg,#5c4a3d,#2e2418)" },
];

export function Home({ onNavigate }) {
  const goBuy = (screen) => onNavigate({ tab: "buy", sub: screen });
  const now = new Date();
  const ts = `${now.toLocaleString("en-GB", { month: "short", day: "numeric", year: "numeric" }).replace(",", "")}; ${now.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true })}`;

  return (
    <div className="page">
      {/* Header — ref photo_45 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 4px" }}>
        <button type="button" className="tap btn-reset" onClick={() => onNavigate({ sub: SCREENS.PROFILE })} aria-label="Open my profile" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: "#c8c8c8" }} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontStyle: "italic", fontWeight: 800, fontSize: 17 }}>{`Y'ello ${USER.name}!`}</div>
            <div style={{ color: "#767676", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 2 }}>
              {USER.number} {Ico.chevronDown("#767676")}
            </div>
          </div>
        </button>
        <button type="button" className="tap btn-reset" onClick={() => onNavigate({ sub: SCREENS.NOTIFICATIONS })} aria-label="Notifications" style={{ cursor: "pointer" }}>
          {Ico.bell(INK)}
        </button>
      </div>

      {/* Mega Promo banner */}
      <button type="button" className="tap btn-reset" onClick={() => onNavigate({ sub: SCREENS.PROMO })} aria-label={`Mega Promo Points: ${USER.promo}. View`} style={{ margin: "8px 16px", width: "calc(100% - 32px)", background: YELLOW, borderRadius: 16, padding: "14px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", position: "relative", overflow: "hidden", textAlign: "left" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.08, background: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }} />
        <div style={{ width: 48, height: 48, borderRadius: 24, background: INK, color: YELLOW, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, lineHeight: 1.1, flexShrink: 0, zIndex: 1 }}>
          <span>30</span><span style={{ fontSize: 7 }}>MTN</span>
        </div>
        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Mega Promo Points</div>
          <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{USER.promo}</div>
        </div>
        <div style={{ background: INK, color: "#fff", borderRadius: 20, padding: "7px 14px", fontWeight: 700, fontSize: 13, zIndex: 1, display: "flex", alignItems: "center", gap: 4 }}>
          View {Ico.chevronRight("#fff")}
        </div>
      </button>

      {/* Loyalty */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "6px 16px 10px" }}>
        <div>
          <div style={{ color: "#666", fontWeight: 600, fontSize: 13 }}>Loyalty Points</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{USER.loyalty}</div>
        </div>
        <button type="button" className="tap btn-reset" onClick={() => onNavigate({ sub: SCREENS.LOYALTY })} aria-label="Redeem loyalty points" style={{ fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          Redeem Points <span style={{ color: YELLOW }}>{Ico.chevronRight(YELLOW)}</span>
        </button>
      </div>

      {/* Balances */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 6px" }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Balances</div>
        <div style={{ background: "#efefef", borderRadius: 20, padding: "7px 14px", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          Update {Ico.refresh(INK)}
        </div>
      </div>
      <div className="hide-scrollbar" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 16px 6px" }}>
        <BalCard label="Airtime" value={`GHS ${USER.airtime.toFixed(2)}`} onTopUp={() => goBuy(SCREENS.AIRTIME)} onOpen={() => onNavigate({ sub: SCREENS.BALANCE_DETAIL, meta: { balanceType: "airtime" } })} />
        <BalCard label="Data" value={USER.data} onTopUp={() => goBuy(SCREENS.DATA_CATEGORIES)} onOpen={() => onNavigate({ sub: SCREENS.BALANCE_DETAIL, meta: { balanceType: "data" } })} />
        <BalCard label="Minutes" value={USER.minutes} onTopUp={() => goBuy(SCREENS.MASHUP)} />
        <BalCard label="Sms" value={USER.sms} onTopUp={() => goBuy(SCREENS.MASHUP)} />
      </div>
      <div style={{ padding: "4px 16px 10px", color: "#8a8a8a", fontWeight: 600, fontSize: 12 }}>
        Last Updated Balances<br />
        <span style={{ color: INK, fontWeight: 700 }}>{ts}</span>
      </div>

      {/* Buy shortcuts with photo-style tiles */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 16px 8px" }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Buy</div>
        <button type="button" className="tap btn-reset" onClick={() => onNavigate({ tab: "buy" })} aria-label="View all buy options" style={{ color: "#767676", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>View All →</button>
      </div>
      <div className="hide-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 16px 8px" }}>
        {BUY_TILES.map((x) => (
          <button type="button" key={x.label} className="tap btn-reset" onClick={() => goBuy(x.screen)} aria-label={x.label} style={{ minWidth: 130, height: 130, borderRadius: 14, background: x.bg, cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0 }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px", background: "linear-gradient(transparent, rgba(0,0,0,.7))", color: "#fff", fontWeight: 800, fontSize: 14, textAlign: "left" }}>{x.label}</div>
            <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 50, height: 50, borderRadius: 25, background: "rgba(255,255,255,.2)" }} />
          </button>
        ))}
      </div>
    </div>
  );
}
import { SCREENS } from "../navigation/screens.js";
import { Ico } from "../components/Icons.jsx";
import { BuyTile } from "../components/Layout.jsx";
import { PageShell } from "../components/Layout.jsx";

export function Buy({ onNavigate }) {
  return (
    <PageShell title="Buy" subtitle="Amazing Offers For You" noPad>
      {/* Promo carousel — original artwork (no MTN campaign creative is redistributed). */}
      <div style={{ margin: "0 16px 4px", borderRadius: 16, overflow: "hidden", minHeight: 168, position: "relative", background: `url(/promo-banner.svg) center center / cover no-repeat` }} />
      <div className="promo-dots">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <span key={i} className={i === 1 ? "on" : ""} />)}
      </div>

      <div style={{ fontSize: 20, fontWeight: 800, padding: "16px 16px 12px" }}>What Would You Like to Buy?</div>
      <div className="cat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 12 }}>
        <BuyTile label="Data" icon={Ico.data} onClick={() => onNavigate(SCREENS.DATA_CATEGORIES)} />
        <BuyTile label="Airtime" icon={Ico.airtime} onClick={() => onNavigate(SCREENS.AIRTIME)} />
        <BuyTile label="Mashup" icon={Ico.mashup} onClick={() => onNavigate(SCREENS.MASHUP)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 16px 16px" }}>
        <BuyTile label="International Bundles" icon={Ico.globe} onClick={() => onNavigate(SCREENS.INTERNATIONAL)} />
        <BuyTile label="Business Bundles" icon={Ico.briefcase} onClick={() => onNavigate(SCREENS.BUSINESS)} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 16px 8px" }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Broadband Bundles</div>
        <button type="button" className="tap btn-reset" onClick={() => onNavigate(SCREENS.BROADBAND)} aria-label="View all broadband bundles" style={{ color: "#767676", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>View All →</button>
      </div>
    </PageShell>
  );
}
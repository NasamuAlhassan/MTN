import { useState } from "react";
import { RECENT } from "../data/contacts.js";
import { ContinueBtn } from "../components/ui.jsx";
import { PageShell } from "../components/Layout.jsx";
import { Ico } from "../components/Icons.jsx";
import { PrefField, FieldLabel } from "../components/ui.jsx";

export function BuyAirtime({ prefill, onContinue, onUpdatePrefill, onBack }) {
  const [who, setWho] = useState(prefill.recipient === "other" ? "other" : "self");
  const merged = { ...prefill };

  const pick = (w) => {
    setWho(w);
    onUpdatePrefill?.({ ...merged, recipient: w });
  };

  return (
    <PageShell title="Buy airtime" onBack={onBack} noPad>
      <div style={{ padding: "0 16px" }}>
        <FieldLabel>Who is this purchase for?</FieldLabel>
        <div role="radiogroup" aria-label="Who is this purchase for?" style={{ border: "1px solid #e0e0e0", borderRadius: 16, marginBottom: 20 }}>
          <button type="button" role="radio" aria-checked={who === "self"} className="radio-row tap btn-reset" onClick={() => pick("self")} style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: "#d0d0d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Ico.personFill("#888")}
              </div>
              <b>Myself</b>
            </div>
            <div className={`radio-dot${who === "self" ? " on" : ""}`} />
          </button>
          <div style={{ height: 1, background: "#f0f0f0", margin: "0 12px" }} />
          <button type="button" role="radio" aria-checked={who === "other"} className="radio-row tap btn-reset" onClick={() => pick("other")} style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: "#d0d0d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Ico.personFill("#888")}
              </div>
              <b>Someone Else</b>
            </div>
            <div className={`radio-dot${who === "other" ? " on" : ""}`} />
          </button>
        </div>

        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Recent Recipients</div>
        <div style={{ border: "1px solid #e0e0e0", borderRadius: 16, marginBottom: 16 }}>
          <button type="button" className="radio-row tap btn-reset" onClick={() => pick("other")} aria-label={`Recent recipient ${RECENT}`} style={{ width: "100%", textAlign: "left" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>{RECENT}</div>
              <div style={{ color: "#767676", fontSize: 13, marginTop: 2 }}>Recent recipient</div>
            </div>
            <div className="radio-dot" />
          </button>
        </div>
      </div>

      {merged.amount && <PrefField label="Amount" value={`GHS ${merged.amount}`} />}
      {who === "other" && merged.number && <PrefField label="Number" value={merged.number} />}

      <ContinueBtn onClick={onContinue} />
    </PageShell>
  );
}
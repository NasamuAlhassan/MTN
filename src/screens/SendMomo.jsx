import { useEffect, useState } from "react";
import { SCREENS } from "../navigation/screens.js";
import { ContinueBtn, FieldLabel } from "../components/ui.jsx";
import { PageShell } from "../components/Layout.jsx";
import { Ico } from "../components/Icons.jsx";

const fieldInput = {
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  fontWeight: 600,
  fontSize: 15,
  fontFamily: "inherit",
  minWidth: 0,
};

export function SendMomo({ prefill, onNavigate, onContinue, onBack, onUpdatePrefill }) {
  const [number, setNumber] = useState(prefill.number || "");
  const [amount, setAmount] = useState(prefill.amount != null ? String(prefill.amount) : "");
  const [ref, setRef] = useState(prefill.ref || "");

  useEffect(() => {
    setNumber(prefill.number || "");
    setAmount(prefill.amount != null ? String(prefill.amount) : "");
    setRef(prefill.ref || "");
  }, [prefill.number, prefill.amount, prefill.ref]);

  const sync = (patch) => {
    onUpdatePrefill?.({ ...prefill, ...patch });
  };

  const parsedAmount = parseFloat(amount);
  const canContinue = !!number.trim() && !!amount && !Number.isNaN(parsedAmount) && parsedAmount > 0;

  return (
    <PageShell title="Send MoMo" subtitle="Quickly send money to friends or family." onBack={onBack} noPad>
      <div style={{ padding: "0 16px" }}>
        <FieldLabel>Select Network</FieldLabel>
        <button type="button" className="tap input-field btn-reset" onClick={() => onNavigate?.(SCREENS.NETWORK_PICKER)} aria-label="Select network, currently MTN" style={{ cursor: "pointer", marginBottom: 16, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Ico.mtnLogo()}
            <span>MTN</span>
          </div>
          <span style={{ color: "#767676" }}>⌄</span>
        </button>

        <FieldLabel>Phone Number</FieldLabel>
        <div className={`input-field${number ? "" : " muted"}`} style={{ marginBottom: 16 }}>
          <input
            type="tel"
            value={number}
            placeholder="Enter Phone Number"
            onChange={(e) => {
              setNumber(e.target.value);
              sync({ number: e.target.value });
            }}
            style={fieldInput}
          />
          <button
            type="button"
            className="tap"
            onClick={() => onNavigate?.(SCREENS.CONTACTS)}
            aria-label="Pick contact"
            style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex" }}
          >
            {Ico.phone("#333")}
          </button>
        </div>

        <FieldLabel>Enter Amount to Pay</FieldLabel>
        <div className={`input-field${amount ? "" : " muted"}`} style={{ marginBottom: 16, gap: 8 }}>
          <span>GHS</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            placeholder="0.00"
            onChange={(e) => {
              setAmount(e.target.value);
              const val = e.target.value;
              sync({ amount: val ? parseFloat(val) || val : "" });
            }}
            style={fieldInput}
          />
        </div>

        <FieldLabel>Enter Reference</FieldLabel>
        <div className={`input-field${ref ? "" : " muted"}`} style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={ref}
            placeholder="Enter reference"
            maxLength={50}
            onChange={(e) => {
              setRef(e.target.value);
              sync({ ref: e.target.value });
            }}
            style={fieldInput}
          />
        </div>
      </div>
      <ContinueBtn active={canContinue} gray={!canContinue} onClick={onContinue} />
    </PageShell>
  );
}
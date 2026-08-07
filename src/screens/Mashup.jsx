import { MASHUP_TIERS } from "../data/bundles.js";
import { YELLOW } from "../theme.js";
import { ContinueBtn } from "../components/ui.jsx";
import { PageShell } from "../components/Layout.jsx";

export function Mashup({ highlight, onSelect, onContinue, onBack }) {
  return (
    <PageShell title="Mashup" subtitle="Combine voice, data and SMS into one flexible, non-expiring package." onBack={onBack} noPad>
      {MASHUP_TIERS.map((m) => (
        <button
          type="button"
          key={m}
          className="tap btn-reset"
          onClick={() => onSelect?.(m)}
          aria-pressed={highlight === m}
          aria-label={`Mashup GHS ${m}`}
          style={{
            margin: "0 16px 12px",
            width: "calc(100% - 32px)",
            background: "#f5f5f5",
            borderRadius: 16,
            padding: 18,
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 800,
            fontSize: 17,
            border: highlight === m ? `2px solid ${YELLOW}` : "1px solid #e8e8e8",
            cursor: "pointer",
          }}
        >
          GHS {m}{highlight === m ? "  ✓" : ""}<span style={{ color: "#8a8a8a" }}>⌄</span>
        </button>
      ))}
      <ContinueBtn active={!!highlight} onClick={onContinue} />
    </PageShell>
  );
}
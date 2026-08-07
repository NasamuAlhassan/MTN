import { MIDNIGHT } from "../data/bundles.js";
import { BundleCard } from "../components/Layout.jsx";
import { ContinueBtn } from "../components/ui.jsx";
import { PageShell } from "../components/Layout.jsx";

export function MidnightBundle({ highlight, onSelect, onContinue, onBack }) {
  return (
    <PageShell title="Midnight Bundles" subtitle="Browse at night for less" onBack={onBack} noPad>
      <BundleCard title={MIDNIGHT.title} data={MIDNIGHT.data} cost={MIDNIGHT.cost} hot={highlight === MIDNIGHT.id} onClick={() => onSelect?.(MIDNIGHT.id)} />
      <ContinueBtn active={!!highlight} onClick={onContinue} />
    </PageShell>
  );
}
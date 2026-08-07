import { JUST4U } from "../data/bundles.js";
import { BundleCard } from "../components/Layout.jsx";
import { ContinueBtn } from "../components/ui.jsx";
import { PageShell } from "../components/Layout.jsx";

export function Just4U({ highlight, onSelect, onContinue, onBack }) {
  return (
    <PageShell title="Just4U" subtitle="Offers picked just for you" onBack={onBack} noPad>
      {JUST4U.map((b) => (
        <BundleCard key={b.id} title={`Just4U · ${b.days} days`} data={b.data} cost={b.cost} hot={highlight === b.id} onClick={() => onSelect?.(b.id)} />
      ))}
      <ContinueBtn active={!!highlight} onClick={onContinue} />
    </PageShell>
  );
}
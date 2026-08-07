import { DATA_BUNDLES } from "../data/bundles.js";
import { BundleCard } from "../components/Layout.jsx";
import { ContinueBtn } from "../components/ui.jsx";
import { PageShell } from "../components/Layout.jsx";

export function DataBundles({ highlight, onSelect, onContinue, onBack }) {
  return (
    <PageShell title="Data Bundles" subtitle="Low Cost Non Expiry Bundles" onBack={onBack} noPad>
      {DATA_BUNDLES.map((b) => (
        <BundleCard
          key={b.id}
          title={b.title}
          data={b.data}
          cost={b.cost}
          hot={highlight === b.id}
          onClick={() => onSelect?.(b.id)}
        />
      ))}
      <ContinueBtn active={!!highlight} onClick={onContinue} />
    </PageShell>
  );
}
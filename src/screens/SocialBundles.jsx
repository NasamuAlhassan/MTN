import { BundleCard } from "../components/Layout.jsx";
import { ContinueBtn } from "../components/ui.jsx";
import { PageShell } from "../components/Layout.jsx";

const SOCIAL_BUNDLES = [
  { id: "social-d", title: "Social Daily", data: "350MB", cost: 2 },
  { id: "social-w", title: "Social Weekly", data: "1.95GB", cost: 13 },
  { id: "social-m", title: "Social Monthly", data: "4.5GB", cost: 25 },
];

export function SocialBundles({ highlight, onSelect, onContinue, onBack }) {
  return (
    <PageShell title="Social Bundles" subtitle="WhatsApp, Facebook & social apps" onBack={onBack} noPad>
      {SOCIAL_BUNDLES.map((b) => (
        <BundleCard key={b.id} title={b.title} data={b.data} cost={b.cost} hot={highlight === b.id} onClick={() => onSelect?.(b.id)} />
      ))}
      <ContinueBtn active={!!highlight} onClick={onContinue} />
    </PageShell>
  );
}
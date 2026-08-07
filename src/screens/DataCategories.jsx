import { DATA_CATEGORIES, SCREENS } from "../navigation/screens.js";
import { CategoryIcon } from "../components/Icons.jsx";
import { PageShell } from "../components/Layout.jsx";
import { Ico } from "../components/Icons.jsx";

export function DataCategories({ onNavigate, onBack }) {
  return (
    <PageShell
      title="Buy Data Bundles"
      subtitle="Stay online with affordable data bundles for every need. Browse, stream, and connect with ease."
      onBack={onBack}
    >
      <div className="cat-grid">
        {DATA_CATEGORIES.map((cat) => (
          <button type="button" key={cat.id} className="tap cat-tile btn-reset" onClick={() => onNavigate(cat.id)} aria-label={cat.label}>
            <CategoryIcon name={cat.icon} />
            <span>{cat.label}</span>
          </button>
        ))}
        <button type="button" className="tap cat-tile cat-tile-wide btn-reset" onClick={() => onNavigate(SCREENS.VIDEO)} aria-label="Video Bundles">
          <div className="icon-circle">{Ico.play("#fff")}</div>
          <span style={{ fontSize: 14 }}>Video Bundles</span>
        </button>
      </div>
    </PageShell>
  );
}
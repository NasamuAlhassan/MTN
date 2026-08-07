import { INK } from "../theme.js";
import { Ico } from "./Icons.jsx";

const TABS = [
  { id: "home", label: "Home", icon: (c, active) => Ico.home(c, active) },
  { id: "buy", label: "Buy", icon: (c) => Ico.cart(c) },
  { id: "momo", label: "MoMo", icon: (c) => Ico.momo(c) },
  { id: "more", label: "More", icon: (c) => Ico.more(c) },
];

export function TabBar({ active, onChange }) {
  return (
    <nav aria-label="Main" style={{ display: "flex", padding: "8px 0 6px", borderTop: "1px solid #eee", background: "#fff", flexShrink: 0 }}>
      {TABS.map(({ id, label, icon }) => {
        const isActive = active === id;
        const color = isActive ? INK : "#B0B0B0";
        return (
          <button
            key={id}
            type="button"
            className="tap btn-reset"
            onClick={() => onChange(id)}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
            style={{ flex: 1, textAlign: "center", cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>{icon(color, isActive)}</div>
            <div style={{ fontSize: 11, fontWeight: isActive ? 800 : 500, color }}>{label}</div>
          </button>
        );
      })}
    </nav>
  );
}
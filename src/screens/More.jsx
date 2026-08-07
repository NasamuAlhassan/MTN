import { USER } from "../data/user.js";
import { MORE_MENU } from "../navigation/screens.js";
import { Ico, CategoryIcon } from "../components/Icons.jsx";

export function More({ onNavigate }) {
  return (
    <div className="page" style={{ paddingTop: 16 }}>
      {/* Profile — ref photo_41 */}
      <div style={{ textAlign: "center", padding: "8px 16px 24px" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{ width: 88, height: 88, borderRadius: 44, background: "#d0d0d0", margin: "0 auto" }} />
          <div style={{ position: "absolute", bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {Ico.camera("#fff")}
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 14 }}>{USER.fullName}</div>
        <div style={{ color: "#888", fontWeight: 600, fontSize: 15, marginTop: 2 }}>{USER.number}</div>
      </div>

      {MORE_MENU.map((item) => (
        <button
          type="button"
          key={item.id}
          className="tap btn-reset"
          onClick={() => onNavigate(item.id)}
          aria-label={`${item.label}. ${item.desc}`}
          style={{ margin: "0 16px 12px", width: "calc(100% - 32px)", border: "1px solid #ebebeb", borderRadius: 16, padding: "16px", display: "flex", gap: 14, alignItems: "center", cursor: "pointer", textAlign: "left" }}
        >
          <div className="icon-circle-sm"><CategoryIcon name={item.icon} color="#fff" /></div>
          <span style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{item.label}</div>
            <div style={{ color: "#767676", fontWeight: 500, fontSize: 13, marginTop: 3, lineHeight: 1.35 }}>{item.desc}</div>
          </span>
          <span style={{ color: "#ccc" }}>{Ico.chevronRight("#ccc")}</span>
        </button>
      ))}
    </div>
  );
}
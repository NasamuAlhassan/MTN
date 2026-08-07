import { PageShell } from "../components/Layout.jsx";
import { Ico } from "../components/Icons.jsx";
import { YELLOW } from "../theme.js";

export function MenuRow({ label, desc, onClick }) {
  return (
    <button type="button" className="tap btn-reset" onClick={onClick} aria-label={desc ? `${label}. ${desc}` : label} style={{ margin: "0 16px 10px", width: "calc(100% - 32px)", border: "1px solid #ebebeb", borderRadius: 16, padding: "15px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700, cursor: "pointer", background: "#fafafa", textAlign: "left" }}>
      <span>
        {label}
        {desc && <><br /><span style={{ color: "#888", fontWeight: 500, fontSize: 13 }}>{desc}</span></>}
      </span>
      <span style={{ color: YELLOW, fontWeight: 800 }}>{Ico.chevronRight(YELLOW)}</span>
    </button>
  );
}

export function InfoStub({ title, body, onBack }) {
  return (
    <PageShell title={title} onBack={onBack} noPad>
      <div style={{ margin: "8px 16px", background: "#f7f7f7", borderRadius: 18, padding: 22, lineHeight: 1.6, fontWeight: 500, color: "#444", fontSize: 15 }}>
        {body}
        <div style={{ marginTop: 18, fontSize: 12, color: "#aaa", fontWeight: 600, borderTop: "1px solid #e8e8e8", paddingTop: 12 }}>
          Concept prototype — navigation only.
        </div>
      </div>
    </PageShell>
  );
}
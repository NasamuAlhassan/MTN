import { useEffect, useState } from "react";
import { font } from "../theme.js";

export function PhoneFrame({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #e8e8ed 0%, #d8d8e0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: font,
      }}
    >
      <div
        className="app-shell"
        style={{
          width: 390,
          height: 844,
          maxHeight: "92vh",
          background: "#fff",
          borderRadius: 44,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,.28), 0 0 0 1px rgba(0,0,0,.06)",
          border: "8px solid #1a1a1a",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function StatusBar() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })
  );
  useEffect(() => {
    const id = setInterval(
      () => setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })),
      30000
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div
      style={{
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        fontSize: 12,
        fontWeight: 700,
        color: "#000",
        background: "#fff",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 11 }}>MTN</span>
      <span>{time}</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="#000"><rect x="0" y="8" width="3" height="4" rx=".5"/><rect x="4.5" y="5" width="3" height="7" rx=".5"/><rect x="9" y="2" width="3" height="10" rx=".5"/><rect x="13.5" y="0" width="2.5" height="12" rx=".5"/></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1 9c2-2 5-3 7-3s5 1 7 3" stroke="#000" strokeWidth="1.2"/><path d="M3.5 6.5c1.2-1.2 2.8-1.8 4.5-1.8s3.3.6 4.5 1.8" stroke="#000" strokeWidth="1.2"/><circle cx="8" cy="10" r="1.2" fill="#000"/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x=".5" y=".5" width="18" height="10" rx="2" stroke="#000"/><rect x="2" y="2" width="13" height="7" rx="1" fill="#000"/><path d="M20 4v3" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
    </div>
  );
}

export function ConceptBanner() {
  return <div className="concept-footer">Unofficial concept · Not affiliated with MTN / MMFL · No real money</div>;
}
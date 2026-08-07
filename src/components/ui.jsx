export function ContinueBtn({ children = "Continue", active = true, onClick, gray }) {
  return (
    <button
      type="button"
      className={`continue-btn tap${gray || !active ? " gray" : ""}`}
      disabled={!active && !gray}
      onClick={active || gray ? onClick : undefined}
    >
      {children}
    </button>
  );
}

export function HistoryBtn({ onClick }) {
  return <button type="button" className="history-btn tap" onClick={onClick}>History</button>;
}

export function FieldLabel({ children }) {
  return <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>{children}</div>;
}

export function PrefField({ label, value }) {
  return (
    <div style={{ marginTop: 16, padding: "0 16px" }}>
      <FieldLabel>{label}</FieldLabel>
        <div style={{ border: "2px solid #FFCC00", background: "#FFFBEA", borderRadius: 14, padding: "15px 16px", fontWeight: 700 }}>{value}</div>
    </div>
  );
}
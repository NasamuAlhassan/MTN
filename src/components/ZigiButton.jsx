import { YELLOW } from "../theme.js";

/** Yellow chat bubble — matches ref home screen Zigi FAB */
export function ZigiButton({ onClick }) {
  return (
    <button
      type="button"
      className="tap btn-reset"
      onClick={onClick}
      aria-label="Open Zigi voice assistant"
      style={{
        position: "absolute",
        right: 16,
        bottom: 70,
        width: 52,
        height: 52,
        borderRadius: 26,
        background: YELLOW,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 14px rgba(255,204,0,.5)",
        cursor: "pointer",
        zIndex: 10,
      }}
    >
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M8 24c0-8 5-14 12-14s12 6 12 14-5 14-12 14c-1.5 0-3-.2-4.5-.6L8 30l1.5-6z" fill="#1a1a1a" />
        <circle cx="12" cy="14" r="1.8" fill={YELLOW} />
        <circle cx="16" cy="14" r="1.8" fill={YELLOW} />
        <circle cx="20" cy="14" r="1.8" fill={YELLOW} />
      </svg>
    </button>
  );
}
import { INK, YELLOW } from "../theme.js";

export const Ico = {
  home: (c, filled) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" stroke={c} strokeWidth="2" strokeLinejoin="round" fill={filled ? c : "none"} />
    </svg>
  ),
  cart: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 6h15l-1.5 9H7.5L6 6z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.5" fill={c} /><circle cx="18" cy="20" r="1.5" fill={c} />
      <path d="M6 6L5 3H2" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  momo: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M18 8a4 4 0 00-8 0v4l-2 2h12l-2-2V8z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 14v3" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  more: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="12" r="1.8" fill={c} /><circle cx="12" cy="12" r="1.8" fill={c} /><circle cx="18" cy="12" r="1.8" fill={c} />
    </svg>
  ),
  bell: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M5 17h14l-1.5-2V10a6 6 0 10-12 0v5L5 17z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 20a2 2 0 004 0" stroke={c} strokeWidth="1.8" />
    </svg>
  ),
  eye: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke={c} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.5" stroke={c} strokeWidth="1.8" />
    </svg>
  ),
  back: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M14 6l-6 6 6 6" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chevronDown: (c) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  chevronRight: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  mic: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="11" rx="3" fill={c} />
      <path d="M5 11a7 7 0 0014 0M12 18v3" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  send: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 12l16-8-6 16-3-6-7-2z" fill={c} />
    </svg>
  ),
  refresh: (c) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 12a8 8 0 0114-5M20 12a8 8 0 01-14 5" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 4v5h-5M4 20v-5h5" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  phone: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6.5 4h3l1.5 5-2 1.5a11 11 0 005 5L17 14l5 1.5v3A2 2 0 0119.2 21C10 21 3 14 3 4.8 2 3.5 3.5 2 4.5 2z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  person: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  personFill: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={c}>
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  ),
  dataArrows: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M8 6l-3 3 3 3M16 18l3-3-3-3" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M5 9h14M5 15h14" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  bag: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 8h12l-1 12H7L6 8z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 016 0v2" stroke={c} strokeWidth="2" />
      <path d="M12 11v4M10 13h4" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  router: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="10" width="16" height="8" rx="2" stroke={c} strokeWidth="2" />
      <path d="M8 10V7a4 4 0 018 0v3" stroke={c} strokeWidth="2" />
      <circle cx="8" cy="14" r="1" fill={c} /><circle cx="12" cy="14" r="1" fill={c} />
    </svg>
  ),
  social: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke={c} strokeWidth="2" />
      <circle cx="9" cy="10" r="1" fill={c} /><circle cx="15" cy="10" r="1" fill={c} />
      <path d="M9 15c1 1 5 1 6 0" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  moon: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M20 14a8 8 0 11-6-12 6 6 0 006 12z" stroke={c} strokeWidth="2" />
    </svg>
  ),
  sun: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke={c} strokeWidth="2" />
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  play: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2" />
      <path d="M10 8l6 4-6 4V8z" fill={c} />
    </svg>
  ),
  globe: (c) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke={c} strokeWidth="2" />
    </svg>
  ),
  briefcase: (c) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="8" width="18" height="12" rx="2" stroke={c} strokeWidth="2" />
      <path d="M8 8V6a2 2 0 014 0v2" stroke={c} strokeWidth="2" />
    </svg>
  ),
  mashup: (c) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <ellipse cx="8" cy="8" rx="3" ry="5" stroke={c} strokeWidth="2" />
      <ellipse cx="16" cy="8" rx="3" ry="5" stroke={c} strokeWidth="2" />
      <path d="M5 18h14" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  airtime: (c) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M6.5 4h3l1.5 5-2 1.5a11 11 0 005 5L17 14l5 1.5v3A2 2 0 0119.2 21C10 21 3 14 3 4.8 2 3.5 3.5 2 4.5 2z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  data: (c) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M7 16l-3-3 3-3M17 8l3 3-3 3" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M4 13h16M4 11h16" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  qr: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" stroke={c} strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" stroke={c} strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" stroke={c} strokeWidth="2" />
      <path d="M14 14h3v3M17 17h4v4M14 21h3" stroke={c} strokeWidth="2" />
    </svg>
  ),
  sendMomo: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="10" cy="9" r="3" stroke={c} strokeWidth="2" />
      <path d="M4 20c0-3 2.5-5 6-5h1" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 8v6M15 11h6" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  check: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" />
      <path d="M8 12l3 3 5-6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  cashout: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M8 10l-4 4 4 4M16 14l4-4-4-4" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  bank: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 10h18M5 10v8M9 10v8M15 10v8M19 10v8M2 18h20" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 3L2 10h20L12 3z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  doc: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 4h9l5 5v11H6V4z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 4v5h5M9 12h6M9 16h6" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  shield: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l8 4v6c0 5-3.5 8-8 8s-8-3-8-8V7l8-4z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  grid: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="6" height="6" rx="1" stroke={c} strokeWidth="2" />
      <rect x="14" y="4" width="6" height="6" rx="1" stroke={c} strokeWidth="2" />
      <rect x="4" y="14" width="6" height="6" rx="1" stroke={c} strokeWidth="2" />
      <rect x="14" y="14" width="6" height="6" rx="1" stroke={c} strokeWidth="2" />
    </svg>
  ),
  camera: (c) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 8h4l2-3h4l2 3h4v12H4V8z" stroke={c} strokeWidth="2" />
      <circle cx="12" cy="13" r="3" stroke={c} strokeWidth="2" />
    </svg>
  ),
  mtnLogo: () => (
    <div style={{ width: 28, height: 28, borderRadius: 14, background: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 8, color: INK, lineHeight: 1 }}>MTN</div>
  ),
};

export function CategoryIcon({ name, color = "#fff" }) {
  const icons = {
    dataArrows: Ico.dataArrows,
    bag: Ico.bag,
    router: Ico.router,
    social: Ico.social,
    moon: Ico.moon,
    sun: Ico.sun,
    play: Ico.play,
    person: Ico.person,
    grid: Ico.grid,
    phone: Ico.phone,
    help: Ico.bell,
  };
  const fn = icons[name] || Ico.data;
  return <div className="icon-circle">{fn(color)}</div>;
}
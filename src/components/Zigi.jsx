import { YELLOW } from "../theme.js";

export function Zigi({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <path d="M10 26c0-10 9-16 22-16s22 6 22 16-9 16-22 16c-2 0-4-.2-6-.6L14 46l2-8c-4-3-6-7-6-12z" fill={YELLOW} />
      <circle cx="24" cy="26" r="2.6" fill="#1b6" />
      <circle cx="32" cy="26" r="2.6" fill="#1b6" />
      <circle cx="40" cy="26" r="2.6" fill="#1b6" />
      <circle cx="32" cy="9" r="2.2" fill="#1b6" />
    </svg>
  );
}
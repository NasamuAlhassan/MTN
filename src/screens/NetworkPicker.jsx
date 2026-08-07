import { CONTACTS } from "../data/contacts.js";
import { MenuRow } from "./MenuScreen.jsx";
import { PageShell } from "../components/Layout.jsx";

const NETWORKS = ["MTN", "Telecel", "AT"];

export function NetworkPicker({ onSelect, onBack }) {
  return (
    <PageShell title="Select Network" subtitle="Choose the recipient's network" onBack={onBack} noPad>
      {NETWORKS.map((n) => <MenuRow key={n} label={n} onClick={() => onSelect?.(n)} />)}
    </PageShell>
  );
}

export function ContactsPicker({ onSelect, onBack }) {
  return (
    <PageShell title="Phone Number" subtitle="Pick a contact" onBack={onBack} noPad>
      {CONTACTS.map((c) => <MenuRow key={c.number} label={c.full} desc={c.number} onClick={() => onSelect?.({ name: c.name, number: c.number })} />)}
    </PageShell>
  );
}
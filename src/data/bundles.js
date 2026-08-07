export const DATA_BUNDLES = [
  { id: "flexi", title: "Flexi Data Bundle", data: "1.23 - 217.34GB", cost: "0.03 GHS - 399", tag: "Non-expiry" },
  { id: "d1", title: "Data Bundle", data: "20.73MB", cost: "0.5" },
  { id: "d2", title: "Data Bundle", data: "41.46MB", cost: "1" },
  { id: "d3", title: "Data Bundle", data: "406.89MB", cost: "3" },
];

export const JUST4U = [
  { id: "j3", data: "1.37GB", cost: 7, days: 3 },
  { id: "j7", data: "1.95GB", cost: 13, days: 7 },
  { id: "j15", data: "2.34GB", cost: 16, days: 15 },
];

export const MASHUP_TIERS = [1, 5, 10, 30];

// Which bundle Zigi offers for a generic "data for a day / week / month".
// Chosen by id (not array position) so reordering the lists can't silently
// change what the assistant recommends.
const DURATION_BUNDLE_ID = { day: "d3", week: "j7", month: "j15" };

export function bundleForDuration(duration) {
  const id = DURATION_BUNDLE_ID[duration];
  if (!id) return null;
  return [...DATA_BUNDLES, ...JUST4U].find((b) => b.id === id) || null;
}

export const MIDNIGHT = {
  id: "mid",
  title: "Midnight Bundle",
  data: "1.5GB",
  cost: 2,
  window: "12am–5am",
};
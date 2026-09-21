export type CardTone = "success" | "warning" | "danger" | "neutral" | "info";
export type DetailPageTab = "ratecard" | "test" | "policies" | "activity";

export interface MealPlan {
  code: string;
  label: string;
}

export interface Room {
  id: string;
  name: string;
  note: string;
  baseOccupancy: number;
  maxOccupancy: number;
  maxBeds: number;
}

export interface Season {
  name: string;
  colorToken: "ink-3" | "accent" | "pink" | "warn";
  dates: string;
  summary: string;
  nights: number;
  priority: string;
}

/** roomId, guestClass, ageBand, bed, mealPlanId, amount|null, max */
export type GuestRule = [string, string, string, string, string, number | null, number];

export interface Supplement {
  name: string;
  applies: string;
  amount: number | null;
  unit: string;
  basis: string;
  tone: CardTone;
}

export interface ServiceRow {
  name: string;
  note: string;
  applies: string;
  basis: string;
  amount: number | null;
}

export interface ActivityRow {
  name: string;
  note: string;
  group: string;
  basis: string;
  amount: number | null;
}

export interface CancelRow {
  window: string;
  charge: string;
  basis: string;
  tone: CardTone;
}

export interface PolicyDocument {
  name: string;
  file: string;
  size: string;
}

/** Terms & conditions row shown on the Policies DataSheet. */
export interface PolicyRow {
  id: string;
  title: string;
  category: string;
  /** Short line shown in the table. */
  summary: string;
  /** Full readable policy text shown in the View policy modal. */
  body: string;
  document: PolicyDocument | null;
  status: "ok" | "unresolved" | "none";
}

export interface ActivityEvent {
  date: string;
  time: string;
  member: string;
  role: string;
  initials: string;
  avatarTone: "pink" | "default" | "warn" | "channel";
  event: string;
  area: string;
}

export interface RateCardNote {
  body: string;
  author: string;
  when: string;
}

export interface RateCardDetail {
  id: string;
  name: string;
  ref: string;
  vendor: string;
  property: string;
  service: string;
  currency: string;
  validity: string;
  state: string;
  tone: CardTone;
  ready: string;
  readyTone: CardTone;
  taxConfirmed: boolean;
  mealBasis: string;
  mealLabel: string;
  hasWeekendExtra?: boolean;
  meals: MealPlan[];
  rooms: Room[];
  /** [room][meal][season] */
  prices: (number | null)[][][];
  weekendExtra?: (number | null)[][];
  seasons: Season[];
  guests: GuestRule[];
  guestNote?: string;
  supplements: Supplement[];
  services: ServiceRow[];
  activities: ActivityRow[];
  rules: [string, string, string, string, CardTone][];
  cancel: CancelRow[];
  policies: PolicyRow[];
  activity: ActivityEvent[];
  notes: RateCardNote[];
  catLabels?: Partial<Record<string, string>>;
}

export const TEMPLATES = [
  {
    id: "hotel",
    label: "Accommodation",
    enabled: true,
    blurb: "Hotels, resorts, houseboats and villas priced per night.",
    detail: "Season × meal plan price matrix, per-night quoting.",
  },
  {
    id: "flight",
    label: "Flight",
    enabled: false,
    blurb: "Air tickets issued outside Paryatech, with the agency’s own fees carded here.",
    detail: "Travel period × passenger type, fare captured as an actual at booking.",
  },
  {
    id: "trip",
    label: "Trip",
    enabled: false,
    blurb: "DMC FIT packages with a contracted per-person rate and a named itinerary.",
    detail: "Departure window × occupancy slab, per-person quoting.",
  },
  {
    id: "visa",
    label: "Visa",
    enabled: true,
    blurb: "Visa service fees from a processing partner — not a hotel grid and not a case file.",
    detail: "Destination × nationality × apply-from × category × applicant × processing tier.",
  },
  {
    id: "cruise",
    label: "Cruise",
    enabled: false,
    blurb: "Sailings priced per cabin grade and berth occupancy, with port charges.",
    detail: "Sailing date × cabin grade × occupancy, per-cabin quoting.",
  },
  {
    id: "transport",
    label: "Transport",
    enabled: false,
    blurb: "Vehicles on point-to-point routes, hourly hire or per-day disposal.",
    detail: "Journey date × vehicle class × route, per-vehicle quoting.",
  },
] as const;

export const DEFAULT_ACTIVITIES: ActivityRow[] = [
  {
    name: "Sunrise kayak",
    note: "Experience · 06:30 · 2 hrs",
    group: "1A min · max 6",
    basis: "Per person",
    amount: 1800,
  },
  {
    name: "Guided reef walk",
    note: "Experience · 08:00 · 3 hrs",
    group: "2A min · max 10",
    basis: "Per person",
    amount: 2400,
  },
  {
    name: "Sunset cruise",
    note: "Experience · 17:30 · 2 hrs",
    group: "2A min · max 12",
    basis: "Per person",
    amount: 3200,
  },
];

export const TEST_DATES: [string, number][] = [
  ["20 Sep 2026", 0],
  ["21 Sep 2026", 0],
  ["05 Oct 2026", 1],
  ["12 Oct 2026", 1],
  ["02 Nov 2026", 1],
  ["15 Nov 2026", 1],
  ["10 Dec 2026", 1],
  ["22 Dec 2026", 2],
  ["24 Dec 2026", 2],
  ["31 Dec 2026", 2],
];

/** Calendar season index per night for each card */
export const TEST_CAL: Record<string, [number, string][]> = {
  "rc-acc-2627": [
    [0, "Low"],
    [0, "Low"],
    [1, "Shoulder"],
    [1, "Shoulder"],
    [1, "Shoulder"],
    [1, "Shoulder"],
    [1, "Shoulder"],
    [2, "Peak"],
    [2, "Peak"],
    [2, "Peak"],
  ],
  "rc-hill-2627": [
    [0, "Off season"],
    [0, "Off season"],
    [1, "Season"],
    [1, "Season"],
    [1, "Season"],
    [1, "Season"],
    [1, "Season"],
    [-1, "Unpriced"],
    [-1, "Unpriced"],
    [-1, "Unpriced"],
  ],
  "rc-visa-uae": [
    [0, "Current"],
    [0, "Current"],
    [0, "Current"],
    [0, "Current"],
    [0, "Current"],
    [1, "Announced"],
    [1, "Announced"],
    [1, "Announced"],
    [1, "Announced"],
    [1, "Announced"],
  ],
};

import type { StatusTone } from "@paryatech/design-system";

export interface TradeMetric {
  id: string;
  label: string;
  value: string;
  note: string;
  tab?: string;
  tone?: "warn" | "ok";
}

export interface AttentionItem {
  id: string;
  label: string;
  tab: string;
}

export interface ServiceCoverage {
  id: string;
  service: string;
  kind: string;
  coverage: string;
  hubs: string;
  season: string;
}

export interface OperatingFact {
  id: string;
  label: string;
  value: string;
}

export interface CommercialFact {
  id: string;
  label: string;
  value: string;
  note?: string;
  tab?: string;
}

export interface KeyContact {
  id: string;
  name: string;
  initials: string;
  role: string;
  phone: string;
  email: string;
  whatsapp?: string;
}

export interface VendorContact {
  id: string;
  name: string;
  initials: string;
  role: string;
  property: string;
  phone: string;
  email: string;
  primary?: boolean;
}

export type VendorBookingStatus = "upcoming" | "on-trip" | "completed" | "at-risk" | "cancelled";

export type VendorBookingFinance = "settled" | "to-collect" | "overdue" | "part-paid";

export interface VendorBooking {
  id: string;
  title: string;
  ref: string;
  travel: string;
  party: string;
  service: string;
  serviceDetail: string;
  status: VendorBookingStatus;
  amount: string;
  finance: VendorBookingFinance;
  ownerName: string;
  ownerInitials: string;
}

/** Attention strip — only when something needs action. */
export const ATTENTION_ITEMS: AttentionItem[] = [
  { id: "rate-expiry", label: "Rate card expires in 12 days", tab: "rate-cards" },
  { id: "blackout", label: "Peak blackout window starts 20 Dec", tab: "services" },
  { id: "at-risk", label: "1 booking at risk this week", tab: "bookings" },
];

/**
 * Operational snapshot — coverage / commercial / ops only.
 * Finance lives on Finance & docs, so it is not repeated here.
 */
export const SNAPSHOT_METRICS: TradeMetric[] = [
  {
    id: "coverage",
    label: "Coverage",
    value: "6 regions",
    note: "14 destinations · Kerala focus",
    tab: "services",
  },
  {
    id: "commercial",
    label: "Commercial readiness",
    value: "1 rate card",
    note: "Valid until 31 Mar 2027",
    tab: "rate-cards",
  },
  {
    id: "services",
    label: "Services",
    value: "3 live",
    note: "Stay · activity · transfers",
    tab: "services",
  },
  {
    id: "operations",
    label: "Operations",
    value: "4 upcoming",
    note: "1 at risk",
    tab: "bookings",
    tone: "warn",
  },
];

/** Services with coverage attached per service (not one global map). */
export const SERVICE_COVERAGE: ServiceCoverage[] = [
  {
    id: "sc1",
    service: "Lake & garden stay",
    kind: "Accommodation",
    coverage: "Alleppey · Kumarakom · Vembanad shore",
    hubs: "Example Lake Resort",
    season: "Year-round · Peak Dec–Jan",
  },
  {
    id: "sc2",
    service: "Hill trek & plantation walk",
    kind: "Activity",
    coverage: "Munnar · Thekkady trails",
    hubs: "Munnar base camp",
    season: "Oct–May · Monsoon closed",
  },
  {
    id: "sc3",
    service: "Airport & intercity transfers",
    kind: "Transport",
    coverage: "All Kerala · COK / TRV hubs",
    hubs: "Kochi · Trivandrum",
    season: "Daily · 05:00–23:00",
  },
];

export const OPERATING_FACTS: OperatingFact[] = [
  { id: "hours", label: "Operating hours", value: "Daily · 05:00–23:00 IST" },
  { id: "notice", label: "Minimum notice", value: "48 hours · 7 days for groups 12+" },
  { id: "capacity", label: "Capacity", value: "Up to 22 pax / booking · 8 rooms block" },
  { id: "languages", label: "Languages", value: "English · Malayalam · Hindi" },
  { id: "blackouts", label: "Blackouts", value: "20–26 Dec · 31 Dec–02 Jan" },
  { id: "hubs", label: "Pickup hubs", value: "COK · TRV · Alleppey jetty" },
];

export const COMMERCIAL_FACTS: CommercialFact[] = [
  {
    id: "rate-card",
    label: "Current rate card",
    value: "Accommodation tariff 2026–27",
    note: "01 Apr 2026 – 31 Mar 2027",
    tab: "rate-cards",
  },
  {
    id: "currency",
    label: "Currency & tax",
    value: "INR · Tax included",
    note: "Confirmed on live card",
  },
  {
    id: "payment",
    label: "Payment terms",
    value: "50% on confirmation",
    note: "Balance 21 days before arrival",
  },
  {
    id: "cancel",
    label: "Cancellation",
    value: "Free ≥30 days",
    note: "25% / 50% / 100% closer in",
  },
  {
    id: "markup",
    label: "Contracted markup",
    value: "12% NET",
    note: "Preferred supplier",
  },
  {
    id: "updated",
    label: "Last price update",
    value: "12 Aug 2026",
    note: "2 cells still missing on Peak",
    tab: "rate-cards",
  },
];

/** Compact role contacts for Overview — full directory stays light. */
export const KEY_CONTACTS: KeyContact[] = [
  {
    id: "kc1",
    name: "Ravi Nair",
    initials: "RN",
    role: "Reservations",
    phone: "+91 98470 11220",
    email: "ravi.nair@examplehosp.in",
    whatsapp: "+919847011220",
  },
  {
    id: "kc2",
    name: "Vikram Das",
    initials: "VD",
    role: "Operations",
    phone: "+91 98470 12402",
    email: "vikram.das@examplehosp.in",
    whatsapp: "+919847012402",
  },
  {
    id: "kc3",
    name: "Deepa Thomas",
    initials: "DT",
    role: "Finance",
    phone: "+91 98470 11884",
    email: "deepa.thomas@examplehosp.in",
  },
  {
    id: "kc4",
    name: "Jose Mathew",
    initials: "JM",
    role: "Emergency",
    phone: "+91 98470 12010",
    email: "jose.mathew@examplehosp.in",
    whatsapp: "+919847012010",
  },
];

export const BOOKING_STATUS_LABEL: Record<VendorBookingStatus, string> = {
  upcoming: "Upcoming",
  "on-trip": "On trip",
  completed: "Completed",
  "at-risk": "At risk",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_TONE: Record<VendorBookingStatus, StatusTone> = {
  upcoming: "open",
  "on-trip": "progress",
  completed: "done",
  "at-risk": "blocked",
  cancelled: "blocked",
};

export const BOOKING_FINANCE_LABEL: Record<VendorBookingFinance, string> = {
  settled: "Settled",
  "to-collect": "To collect",
  overdue: "Overdue",
  "part-paid": "Part paid",
};

export const BOOKING_FINANCE_TONE: Record<VendorBookingFinance, StatusTone> = {
  settled: "done",
  "to-collect": "progress",
  overdue: "blocked",
  "part-paid": "progress",
};

/** Recent bookings that used this vendor — full list lives on Bookings tab. */
export const VENDOR_BOOKINGS: VendorBooking[] = [
  {
    id: "vb1",
    title: "XYZ Family · Dubai",
    ref: "BK-2026-000003",
    travel: "18–22 Aug",
    party: "3N · 3 pax",
    service: "Lake View Suite",
    serviceDetail: "2 rooms · MAP",
    status: "at-risk",
    amount: "₹1,65,000",
    finance: "overdue",
    ownerName: "Vrushabh Jain",
    ownerInitials: "VJ",
  },
  {
    id: "vb2",
    title: "Kapoor group · Alleppey",
    ref: "BK-2026-000010",
    travel: "12–19 Sep",
    party: "7N · 4 pax",
    service: "Premium houseboat",
    serviceDetail: "1 cabin · AP",
    status: "on-trip",
    amount: "₹82,400",
    finance: "to-collect",
    ownerName: "Anjali Menon",
    ownerInitials: "AM",
  },
  {
    id: "vb3",
    title: "Mehta honeymoon",
    ref: "BK-2026-000014",
    travel: "02–06 Oct",
    party: "4N · 2 pax",
    service: "Hill Retreat suite",
    serviceDetail: "1 suite · CP",
    status: "upcoming",
    amount: "₹48,000",
    finance: "settled",
    ownerName: "Vrushabh Jain",
    ownerInitials: "VJ",
  },
  {
    id: "vb4",
    title: "Singh family · Kochi",
    ref: "BK-2026-000018",
    travel: "10–12 Oct",
    party: "2N · 5 pax",
    service: "Garden Villa",
    serviceDetail: "3 rooms · EP",
    status: "upcoming",
    amount: "₹36,200",
    finance: "part-paid",
    ownerName: "Rahul Sharma",
    ownerInitials: "RS",
  },
  {
    id: "vb5",
    title: "Corporate retreat · Munnar",
    ref: "BK-2026-000021",
    travel: "20–23 Oct",
    party: "3N · 16 pax",
    service: "Hill Retreat block",
    serviceDetail: "8 rooms · MAP",
    status: "upcoming",
    amount: "₹2,14,000",
    finance: "to-collect",
    ownerName: "Meera Iyer",
    ownerInitials: "MI",
  },
  {
    id: "vb6",
    title: "Nair anniversary",
    ref: "BK-2026-000025",
    travel: "28–30 Oct",
    party: "2N · 2 pax",
    service: "Lake View Suite",
    serviceDetail: "1 suite · AP",
    status: "upcoming",
    amount: "₹41,500",
    finance: "settled",
    ownerName: "Anjali Menon",
    ownerInitials: "AM",
  },
  {
    id: "vb7",
    title: "Desai group · Thekkady",
    ref: "BK-2026-000028",
    travel: "05–07 Nov",
    party: "2N · 8 pax",
    service: "Spice lodge",
    serviceDetail: "4 rooms · MAP",
    status: "upcoming",
    amount: "₹72,800",
    finance: "to-collect",
    ownerName: "Rahul Sharma",
    ownerInitials: "RS",
  },
  {
    id: "vb8",
    title: "Iyer family · Varkala",
    ref: "BK-2026-000031",
    travel: "14–17 Nov",
    party: "3N · 4 pax",
    service: "Cliff stay",
    serviceDetail: "2 rooms · CP",
    status: "upcoming",
    amount: "₹54,600",
    finance: "part-paid",
    ownerName: "Vrushabh Jain",
    ownerInitials: "VJ",
  },
  {
    id: "vb9",
    title: "Sharma Family · Goa",
    ref: "BK-2026-000004",
    travel: "02–06 Aug",
    party: "4N · 2 pax",
    service: "Beach cottage",
    serviceDetail: "1 cottage · MAP",
    status: "completed",
    amount: "₹48,000",
    finance: "settled",
    ownerName: "Vrushabh Jain",
    ownerInitials: "VJ",
  },
  {
    id: "vb10",
    title: "Patel Family · Manali",
    ref: "BK-2026-000006",
    travel: "24–28 Jul",
    party: "4N · 5 pax",
    service: "Mountain lodge",
    serviceDetail: "2 rooms · EP",
    status: "completed",
    amount: "₹61,200",
    finance: "settled",
    ownerName: "Meera Iyer",
    ownerInitials: "MI",
  },
  {
    id: "vb11",
    title: "Banerjee wedding party",
    ref: "BK-2026-000001",
    travel: "10–14 Jun",
    party: "4N · 22 pax",
    service: "Lake Resort wing",
    serviceDetail: "11 rooms · AP",
    status: "completed",
    amount: "₹4,80,000",
    finance: "settled",
    ownerName: "Anjali Menon",
    ownerInitials: "AM",
  },
  {
    id: "vb12",
    title: "Thomas family · cancelled",
    ref: "BK-2026-000009",
    travel: "01–04 Sep",
    party: "3N · 3 pax",
    service: "Garden Villa",
    serviceDetail: "1 room · CP",
    status: "cancelled",
    amount: "₹18,400",
    finance: "settled",
    ownerName: "Rahul Sharma",
    ownerInitials: "RS",
  },
];

/** At-risk first, then upcoming / on-trip — for Overview preview. */
export function overviewBookingsPreview(limit = 5): VendorBooking[] {
  const rank = (s: VendorBookingStatus) =>
    s === "at-risk" ? 0 : s === "on-trip" ? 1 : s === "upcoming" ? 2 : 9;
  return [...VENDOR_BOOKINGS]
    .filter((b) => b.status === "at-risk" || b.status === "upcoming" || b.status === "on-trip")
    .sort((a, b) => rank(a.status) - rank(b.status))
    .slice(0, limit);
}

export const VENDOR_CONTACTS: VendorContact[] = [
  {
    id: "c1",
    name: "Ravi Nair",
    initials: "RN",
    role: "Reservations manager",
    property: "Example Lake Resort",
    phone: "+91 98470 11220",
    email: "ravi.nair@examplehosp.in",
    primary: true,
  },
  {
    id: "c2",
    name: "Deepa Thomas",
    initials: "DT",
    role: "Accounts lead",
    property: "Example Hospitality",
    phone: "+91 98470 11884",
    email: "deepa.thomas@examplehosp.in",
  },
  {
    id: "c3",
    name: "Farah Khan",
    initials: "FK",
    role: "Groups desk",
    property: "Example Hospitality",
    phone: "+91 98470 11901",
    email: "farah.khan@examplehosp.in",
  },
  {
    id: "c4",
    name: "Jose Mathew",
    initials: "JM",
    role: "Front office",
    property: "Example Lake Resort",
    phone: "+91 98470 12010",
    email: "jose.mathew@examplehosp.in",
  },
  {
    id: "c5",
    name: "Sneha Pillai",
    initials: "SP",
    role: "Revenue manager",
    property: "Example Hospitality",
    phone: "+91 98470 12155",
    email: "sneha.pillai@examplehosp.in",
  },
  {
    id: "c6",
    name: "Arun Krishnan",
    initials: "AK",
    role: "Sales coordinator",
    property: "Example Lake Resort",
    phone: "+91 98470 12240",
    email: "arun.krishnan@examplehosp.in",
  },
  {
    id: "c7",
    name: "Priya Menon",
    initials: "PM",
    role: "Banquets lead",
    property: "Example Hospitality",
    phone: "+91 98470 12318",
    email: "priya.menon@examplehosp.in",
  },
  {
    id: "c8",
    name: "Vikram Das",
    initials: "VD",
    role: "Transport desk",
    property: "Example Hospitality",
    phone: "+91 98470 12402",
    email: "vikram.das@examplehosp.in",
  },
  {
    id: "c9",
    name: "Leena George",
    initials: "LG",
    role: "Guest relations",
    property: "Example Lake Resort",
    phone: "+91 98470 12566",
    email: "leena.george@examplehosp.in",
  },
  {
    id: "c10",
    name: "Mohammed Irfan",
    initials: "MI",
    role: "Night manager",
    property: "Example Lake Resort",
    phone: "+91 98470 12690",
    email: "m.irfan@examplehosp.in",
  },
  {
    id: "c11",
    name: "Anitha Roy",
    initials: "AR",
    role: "Contracting",
    property: "Example Hospitality",
    phone: "+91 98470 12744",
    email: "anitha.roy@examplehosp.in",
  },
  {
    id: "c12",
    name: "Samuel Joseph",
    initials: "SJ",
    role: "F&B coordinator",
    property: "Example Lake Resort",
    phone: "+91 98470 12811",
    email: "samuel.joseph@examplehosp.in",
  },
];

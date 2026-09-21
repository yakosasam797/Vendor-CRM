import type { StatusTone } from "@paryatech/design-system";

export type RateCardStatus = "published" | "expired" | "draft";
export type RateCardAction = "open" | "continue";

export interface RateCard {
  id: string;
  ref: string;
  title: string;
  category: string;
  currency: string;
  property: string;
  validity: string;
  validityNote: string;
  status: RateCardStatus;
  coverageCount: number;
  coverageUnit: string;
  coverageDetail: string;
  action: RateCardAction;
}

export const RATE_CARDS: RateCard[] = [
  {
    id: "rc-acc-2627",
    ref: "RC-2026-0114",
    title: "Accommodation tariff · 2026–27",
    category: "Accommodation",
    currency: "INR",
    property: "Example Lake Resort",
    validity: "01 Apr 2026 – 31 Mar 2027",
    validityNote: "2 price sets",
    status: "published",
    coverageCount: 4,
    coverageUnit: "combinations",
    coverageDetail: "8 prices",
    action: "open",
  },
  {
    id: "rc-acc-2526",
    ref: "RC-2025-0114",
    title: "Accommodation tariff · 2025–26",
    category: "Accommodation",
    currency: "INR",
    property: "Example Lake Resort",
    validity: "01 Apr 2025 – 31 Mar 2026",
    validityNote: "Superseded",
    status: "expired",
    coverageCount: 4,
    coverageUnit: "combinations",
    coverageDetail: "8 prices",
    action: "open",
  },
  {
    id: "rc-hill-2627",
    ref: "RC-2026-0218",
    title: "Hill Retreat tariff · 2026–27",
    category: "Accommodation",
    currency: "INR",
    property: "Example Hill Retreat",
    validity: "01 Apr 2026 – 31 Mar 2027",
    validityNote: "3 price sets",
    status: "draft",
    coverageCount: 6,
    coverageUnit: "combinations",
    coverageDetail: "2 unpriced",
    action: "continue",
  },
  {
    id: "rc-air-2026",
    ref: "RC-2026-0119",
    title: "Airport transfer rates · 2026",
    category: "Transport",
    currency: "INR",
    property: "Fleet — Kochi",
    validity: "01 Jan – 31 Dec 2026",
    validityNote: "Single price set",
    status: "published",
    coverageCount: 5,
    coverageUnit: "vehicle types",
    coverageDetail: "5 prices",
    action: "open",
  },
  {
    id: "rc-visa-uae",
    ref: "RC-2026-0301",
    title: "Visa services tariff · UAE",
    category: "Visa",
    currency: "INR",
    property: "Atlas Visa Services",
    validity: "01 Apr – 30 Sep 2026",
    validityNote: "Single price set",
    status: "published",
    coverageCount: 4,
    coverageUnit: "products",
    coverageDetail: "1 unpriced",
    action: "open",
  },
];

export const STATUS_TONE: Record<RateCardStatus, StatusTone> = {
  published: "done",
  expired: "open",
  draft: "progress",
};

export const STATUS_LABEL: Record<RateCardStatus, string> = {
  published: "Published",
  expired: "Expired",
  draft: "Draft",
};

export const VENDOR = {
  code: "V-EXHOSP",
  location: "Kochi, India",
  updated: "Updated 3 days ago",
  name: "Example Hospitality",
  supplierState: "Active supplier",
  category: "Accommodation",
  ownerName: "Anjali Menon",
  ownerDesk: "Vendor desk",
  ownerInitials: "AM",
};

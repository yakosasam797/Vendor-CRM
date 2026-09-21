import type { StatusTone } from "@paryatech/design-system";

export type PackageStatus = "live" | "reprice" | "draft";

export interface VendorPackage {
  id: string;
  name: string;
  detail: string;
  services: string;
  pricedFrom: string;
  pricedFromKind: string;
  sellPrice: string;
  status: PackageStatus;
}

export const PACKAGE_STATUS_LABEL: Record<PackageStatus, string> = {
  live: "Live",
  reprice: "Re-price",
  draft: "Draft",
};

export const PACKAGE_STATUS_TONE: Record<PackageStatus, StatusTone> = {
  live: "done",
  reprice: "progress",
  draft: "open",
};

export const VENDOR_PACKAGES: VendorPackage[] = [
  {
    id: "pkg-1",
    name: "Kerala Backwaters Escape",
    detail: "4N · Kochi–Alleppey",
    services: "Lake Resort 2N · houseboat 1N · transfer",
    pricedFrom: "Accom. 2026–27",
    pricedFromKind: "Rate card",
    sellPrice: "₹68,400",
    status: "live",
  },
  {
    id: "pkg-2",
    name: "Cardamom Trail Weekend",
    detail: "2N · Thekkady",
    services: "Hill Retreat 2N · tour · safari",
    pricedFrom: "Accom. 2025–26",
    pricedFromKind: "Rate card",
    sellPrice: "₹32,800",
    status: "reprice",
  },
  {
    id: "pkg-3",
    name: "Family Kochi Stay",
    detail: "3N · Kochi",
    services: "Lake Resort 3N · city tour · transfer",
    pricedFrom: "Accom. 2026–27",
    pricedFromKind: "Rate card",
    sellPrice: "₹54,200",
    status: "live",
  },
  {
    id: "pkg-4",
    name: "Spice Belt Day",
    detail: "Day · Munnar foothills",
    services: "Plantation tour · lunch · transfers",
    pricedFrom: "Activity 2026",
    pricedFromKind: "Rate card",
    sellPrice: "₹8,900",
    status: "live",
  },
  {
    id: "pkg-5",
    name: "Hill Weekend Circuit",
    detail: "3N · Munnar–Thekkady",
    services: "Hill 2N · Lake 1N · transfers",
    pricedFrom: "Accom. 2025–26",
    pricedFromKind: "Rate card",
    sellPrice: "₹41,600",
    status: "reprice",
  },
  {
    id: "pkg-6",
    name: "Monsoon Lake Soft Launch",
    detail: "2N · Kochi",
    services: "Lake Resort 2N · monsoon walk",
    pricedFrom: "—",
    pricedFromKind: "Unpriced",
    sellPrice: "—",
    status: "draft",
  },
  {
    id: "pkg-7",
    name: "Corporate Offsite Kochi",
    detail: "2N · Kochi",
    services: "Lake 2N · meeting room · transfers",
    pricedFrom: "Accom. 2026–27",
    pricedFromKind: "Rate card",
    sellPrice: "₹96,000",
    status: "live",
  },
  {
    id: "pkg-8",
    name: "Honeymoon Backwaters",
    detail: "5N · Alleppey–Kumarakom",
    services: "Houseboat 2N · Lake 3N · dinner",
    pricedFrom: "Accom. 2026–27",
    pricedFromKind: "Rate card",
    sellPrice: "₹1,12,500",
    status: "live",
  },
];

export function packageStats(packages: VendorPackage[] = VENDOR_PACKAGES) {
  const live = packages.filter((p) => p.status === "live").length;
  const reprice = packages.filter((p) => p.status === "reprice").length;
  return { live, reprice, total: packages.length };
}

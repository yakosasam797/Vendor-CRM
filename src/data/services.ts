import type { StatusTone } from "@paryatech/design-system";

export type ServiceType = "Accommodation" | "Activity";
export type ServiceStatus = "published" | "active" | "draft";

export interface ServiceMedia {
  id: string;
  title: string;
  /** Soft placeholder tone for demo imagery */
  tone: "lake" | "garden" | "suite" | "tour" | "spice" | "hill" | "lobby";
  /** Media feeds package cards; banner marks the hero image used in a package */
  usedInBanner?: boolean;
  usedInPackages?: string[];
}

export interface VendorService {
  id: string;
  name: string;
  type: ServiceType;
  details: string;
  pricingLabel: string;
  rateCardCount: number;
  status: ServiceStatus;
  media: ServiceMedia[];
}

export const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  published: "Published",
  active: "Active",
  draft: "Draft",
};

export const SERVICE_STATUS_TONE: Record<ServiceStatus, StatusTone> = {
  published: "done",
  active: "done",
  draft: "progress",
};

export const VENDOR_SERVICES: VendorService[] = [
  {
    id: "svc-lake",
    name: "Example Lake Resort",
    type: "Accommodation",
    details: "Lake resort · 2 room categories",
    pricingLabel: "Accommodation tariff · 2026–27",
    rateCardCount: 2,
    status: "published",
    media: [
      {
        id: "m-lake-1",
        title: "Lakeside façade",
        tone: "lake",
        usedInBanner: true,
        usedInPackages: ["Kerala lake escape", "Family Kochi stay"],
      },
      {
        id: "m-lake-2",
        title: "Garden View room",
        tone: "garden",
        usedInPackages: ["Kerala lake escape"],
      },
      {
        id: "m-lake-3",
        title: "Lake View Suite",
        tone: "suite",
      },
    ],
  },
  {
    id: "svc-cardamom",
    name: "Cardamom plantation tour",
    type: "Activity",
    details: "Guests · included with stay",
    pricingLabel: "Accommodation tariff · 2026–27",
    rateCardCount: 2,
    status: "active",
    media: [
      {
        id: "m-tour-1",
        title: "Plantation walk",
        tone: "tour",
        usedInBanner: true,
        usedInPackages: ["Spice belt day"],
      },
      {
        id: "m-tour-2",
        title: "Cardamom drying yard",
        tone: "spice",
        usedInPackages: ["Spice belt day"],
      },
    ],
  },
  {
    id: "svc-hill",
    name: "Example Hill Retreat",
    type: "Accommodation",
    details: "Hill resort · 3 room categories",
    pricingLabel: "Hill retreat tariff · 2026–27",
    rateCardCount: 2,
    status: "draft",
    media: [
      {
        id: "m-hill-1",
        title: "Valley approach",
        tone: "hill",
        usedInBanner: true,
        usedInPackages: ["Hill weekend"],
      },
      {
        id: "m-hill-2",
        title: "Lobby lounge",
        tone: "lobby",
      },
    ],
  },
];

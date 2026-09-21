import type { StatusTone } from "@paryatech/design-system";

/** Activity / type of the service — used by the Services toolbar filter. */
export type ServiceType =
  | "Accommodation"
  | "Activity"
  | "Transport"
  | "DMC/Ground handling"
  | "Visa"
  | "Flights";

export type ServiceStatus = "published" | "active" | "draft";

const thumb = (id: string, w = 640, h = 480) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export interface ServiceMedia {
  id: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  /** Defaults to image when omitted */
  kind?: "image" | "video";
  /** Banner marks the hero image used on packages / list thumb */
  usedInBanner?: boolean;
  usedInPackages?: string[];
}

/** Linked rate card shown by name only on the service (opens the rate card). */
export interface ServiceRateCardLink {
  id: string;
  name: string;
}

export interface VendorService {
  id: string;
  vendorId: string;
  name: string;
  type: ServiceType;
  details: string;
  /** Short about copy on the service detail */
  about: string;
  location: string;
  inclusions: string[];
  pricingLabel: string;
  rateCardCount: number;
  /** Linked rate cards — name only in the UI */
  rateCards: ServiceRateCardLink[];
  status: ServiceStatus;
  /** Primary / list thumb (usually the banner media) */
  imageUrl: string;
  imageAlt: string;
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

export const SERVICE_TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "Accommodation", label: "Accommodation" },
  { value: "Activity", label: "Activity" },
  { value: "Transport", label: "Transport" },
  { value: "DMC/Ground handling", label: "DMC / Ground" },
  { value: "Visa", label: "Visa" },
  { value: "Flights", label: "Flights" },
];

export const VENDOR_SERVICES: VendorService[] = [
  {
    id: "svc-lake",
    vendorId: "exhosp",
    name: "Example Lake Resort",
    type: "Accommodation",
    details: "Lake resort · 2 room categories",
    about:
      "Lakeside resort on Vembanad with garden and lake-view rooms. Soft check-in from 14:00; pool and jetty access included for staying guests.",
    location: "Alleppey · Kochi corridor",
    inclusions: [
      "Garden View and Lake View room categories",
      "Breakfast options on meal plans",
      "Pool and jetty access for in-house guests",
      "Early check-in subject to availability",
    ],
    pricingLabel: "Accommodation tariff · 2026–27",
    rateCardCount: 2,
    rateCards: [
      { id: "rc-acc-2627", name: "Accommodation tariff · 2026–27" },
      { id: "rc-acc-2526", name: "Accommodation tariff · 2025–26" },
    ],
    status: "published",
    imageUrl: thumb("photo-1566073771259-6a8506099945", 96, 96),
    imageAlt: "Example Lake Resort exterior",
    media: [
      {
        id: "m-lake-1",
        title: "Lakeside façade",
        imageUrl: thumb("photo-1566073771259-6a8506099945"),
        imageAlt: "Lakeside resort façade",
        usedInBanner: true,
        usedInPackages: ["Kerala lake escape", "Family Kochi stay"],
      },
      {
        id: "m-lake-2",
        title: "Garden View room",
        imageUrl: thumb("photo-1631049307264-da0ec9d70304"),
        imageAlt: "Garden View guest room",
        usedInPackages: ["Kerala lake escape"],
      },
      {
        id: "m-lake-3",
        title: "Lake View Suite",
        imageUrl: thumb("photo-1582719478250-c89cae4dc85b"),
        imageAlt: "Lake View suite interior",
      },
      {
        id: "m-lake-4",
        title: "Pool deck",
        imageUrl: thumb("photo-1571896349842-33c89424de2d"),
        imageAlt: "Resort pool overlooking water",
      },
    ],
  },
  {
    id: "svc-cardamom",
    vendorId: "exhosp",
    name: "Cardamom plantation tour",
    type: "Activity",
    details: "Guests · included with stay",
    about:
      "Guided walk through working cardamom estates with drying-yard stop. Usually bundled with Hill Retreat stays; half-day timing.",
    location: "Thekkady foothills",
    inclusions: [
      "Guided plantation walk",
      "Drying-yard visit",
      "Bottled water",
      "Transfer from Hill Retreat when bundled",
    ],
    pricingLabel: "Accommodation tariff · 2026–27",
    rateCardCount: 2,
    rateCards: [
      { id: "rc-acc-2627", name: "Accommodation tariff · 2026–27" },
      { id: "rc-hill-2627", name: "Hill Retreat tariff · 2026–27" },
    ],
    status: "active",
    imageUrl: thumb("photo-1544735716-392fe2489ffa", 96, 96),
    imageAlt: "Cardamom plantation path",
    media: [
      {
        id: "m-tour-1",
        title: "Plantation walk",
        imageUrl: thumb("photo-1544735716-392fe2489ffa"),
        imageAlt: "Plantation walk through spice estates",
        usedInBanner: true,
        usedInPackages: ["Spice belt day"],
      },
      {
        id: "m-tour-2",
        title: "Cardamom drying yard",
        imageUrl: thumb("photo-1464226184884-fa280b87c399"),
        imageAlt: "Cardamom drying yard",
        usedInPackages: ["Spice belt day"],
      },
    ],
  },
  {
    id: "svc-hill",
    vendorId: "exhosp",
    name: "Example Hill Retreat",
    type: "Accommodation",
    details: "Hill resort · 3 room categories",
    about:
      "Valley-facing hill resort with deluxe, premium, and family suites. Winter rates still open — treat unpriced seasons as blocked.",
    location: "Munnar belt",
    inclusions: [
      "Deluxe, Premium, and Family Suite categories",
      "Valley views on premium stock",
      "Bonfire on request",
      "Airport SUV transfer add-on",
    ],
    pricingLabel: "Hill Retreat tariff · 2026–27",
    rateCardCount: 1,
    rateCards: [{ id: "rc-hill-2627", name: "Hill Retreat tariff · 2026–27" }],
    status: "draft",
    imageUrl: thumb("photo-1506905925346-21bda4d32df4", 96, 96),
    imageAlt: "Example Hill Retreat in the mountains",
    media: [
      {
        id: "m-hill-1",
        title: "Valley approach",
        imageUrl: thumb("photo-1506905925346-21bda4d32df4"),
        imageAlt: "Valley approach to the hill retreat",
        usedInBanner: true,
        usedInPackages: ["Hill weekend"],
      },
      {
        id: "m-hill-2",
        title: "Lobby lounge",
        imageUrl: thumb("photo-1618773928121-c32242e63f39"),
        imageAlt: "Hill retreat lobby lounge",
      },
      {
        id: "m-hill-3",
        title: "Family Suite",
        imageUrl: thumb("photo-1590490360182-c33d57733427"),
        imageAlt: "Family suite living space",
      },
    ],
  },
  {
    id: "svc-trek-munnar",
    vendorId: "trailmakers",
    name: "Munnar ridge trek",
    type: "Activity",
    details: "Guided · half day · max 12",
    about:
      "Guided ridge trek above the tea estates. Half-day outing with a hard cap of 12 guests; tea overlook stop included.",
    location: "Munnar ridge",
    inclusions: [
      "Local guide",
      "Safety briefing",
      "Tea estate overlook stop",
      "Bottled water",
    ],
    pricingLabel: "Activity tariff · 2026",
    rateCardCount: 1,
    rateCards: [{ id: "rc-acc-2627", name: "Activity tariff · 2026" }],
    status: "published",
    imageUrl: thumb("photo-1551632811-561732d1e5ec", 96, 96),
    imageAlt: "Ridge path through tea estates",
    media: [
      {
        id: "m-trek-1",
        title: "Ridge path",
        imageUrl: thumb("photo-1551632811-561732d1e5ec"),
        imageAlt: "Trekking path on the ridge",
        kind: "image",
        usedInBanner: true,
        usedInPackages: ["Hill weekend"],
      },
      {
        id: "m-trek-2",
        title: "Tea estate overlook",
        imageUrl: thumb("photo-1506905925346-21bda4d32df4"),
        imageAlt: "Tea estate overlook",
        kind: "image",
        usedInPackages: ["Hill weekend"],
      },
      {
        id: "m-trek-3",
        title: "Ridge walk reel",
        imageUrl: thumb("photo-1464822759023-fed622ff2c3b"),
        imageAlt: "Video still from ridge walk",
        kind: "video",
        usedInPackages: ["Hill weekend"],
      },
    ],
  },
  {
    id: "svc-kayak",
    vendorId: "trailmakers",
    name: "Backwater kayak",
    type: "Activity",
    details: "Alleppey canals · 2–3 hrs",
    about:
      "Kayak through quiet Alleppey canals. Soft launch near the lake resorts; 2–3 hour outing for couples and small groups.",
    location: "Alleppey canals",
    inclusions: [
      "Kayak and paddle",
      "Life jacket",
      "Local pilot for first-timers",
      "Canal launch point pickup when bundled",
    ],
    pricingLabel: "Activity tariff · 2026",
    rateCardCount: 1,
    rateCards: [{ id: "rc-acc-2627", name: "Activity tariff · 2026" }],
    status: "active",
    imageUrl: thumb("photo-1602216056096-3b40cc0c9944", 96, 96),
    imageAlt: "Kayak on backwater canal",
    media: [
      {
        id: "m-kayak-1",
        title: "Canal launch",
        imageUrl: thumb("photo-1602216056096-3b40cc0c9944"),
        imageAlt: "Canal launch for kayaks",
        kind: "image",
        usedInBanner: true,
        usedInPackages: ["Kerala lake escape"],
      },
      {
        id: "m-kayak-2",
        title: "Palm canal stretch",
        imageUrl: thumb("photo-1439066615861-d1af74d74000"),
        imageAlt: "Palm-lined canal stretch",
        kind: "image",
      },
      {
        id: "m-kayak-3",
        title: "Paddle through canals",
        imageUrl: thumb("photo-1544551763-46a013bb70d5"),
        imageAlt: "Video still of kayak paddle",
        kind: "video",
      },
    ],
  },
  {
    id: "svc-transfer-cok",
    vendorId: "trailmakers",
    name: "COK airport transfer",
    type: "Transport",
    details: "Sedan / tempo · statewide",
    about:
      "Meet-and-greet transfers from Cochin airport. Sedan and tempo options; waiting charge after 45 minutes.",
    location: "COK · statewide",
    inclusions: [
      "Meet and greet at arrivals",
      "Sedan or tempo as booked",
      "Toll and parking as quoted",
      "45 min free waiting",
    ],
    pricingLabel: "Airport transfer rates · 2026",
    rateCardCount: 1,
    rateCards: [{ id: "rc-air-2026", name: "Airport transfer rates · 2026" }],
    status: "published",
    imageUrl: thumb("photo-1449965408869-eaa3f722e40d", 96, 96),
    imageAlt: "Transfer vehicle at airport curb",
    media: [
      {
        id: "m-road-1",
        title: "Airport curb",
        imageUrl: thumb("photo-1449965408869-eaa3f722e40d"),
        imageAlt: "Airport curb pickup",
        kind: "image",
        usedInBanner: true,
      },
      {
        id: "m-road-2",
        title: "Highway stretch",
        imageUrl: thumb("photo-1469854523086-cc02fe5d8800"),
        imageAlt: "Highway transfer stretch",
        kind: "image",
      },
      {
        id: "m-road-3",
        title: "Arrival meet clip",
        imageUrl: thumb("photo-1436491865332-7a61a109cc05"),
        imageAlt: "Video still of airport arrival",
        kind: "video",
      },
    ],
  },
];

export function servicesForVendor(vendorId: string): VendorService[] {
  return VENDOR_SERVICES.filter((s) => s.vendorId === vendorId);
}

export function getVendorService(id: string): VendorService | undefined {
  return VENDOR_SERVICES.find((s) => s.id === id);
}

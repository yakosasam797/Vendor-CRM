import { DEFAULT_ACTIVITIES, type PolicyRow, type RateCardDetail } from "./types";

function policy(
  id: string,
  title: string,
  category: string,
  summary: string,
  body: string,
  status: PolicyRow["status"] = "ok",
  document: PolicyRow["document"] = null,
): PolicyRow {
  return { id, title, category, summary, body, status, document };
}

const coralGuests = (): RateCardDetail["guests"] => {
  const rules: [string, string, string, number, number][] = [
    ["Extra adult", "12+", "extra_bed", 2400, 1],
    ["Child", "6–11", "extra_bed", 1600, 1],
    ["Child", "6–11", "no_bed", 900, 1],
    ["Child", "2–5", "existing_bed", 0, 2],
    ["Infant", "0–1", "cot", 0, 1],
  ];
  const rooms = ["garden-view", "sea-view", "sea-view-suite"];
  const out: RateCardDetail["guests"] = [];
  rooms.forEach((roomId) =>
    rules.forEach(([cls, band, bed, amount, max]) => out.push([roomId, cls, band, bed, "all", amount, max])),
  );
  return out;
};

const tashiGuests = (): RateCardDetail["guests"] => {
  const rules: [string, string, string, number | null, number][] = [
    ["Extra adult", "12+", "extra_bed", 1800, 1],
    ["Child", "5–11", "extra_bed", 1200, 1],
    ["Child", "5–11", "no_bed", null, 1],
    ["Child", "0–4", "existing_bed", 0, 1],
  ];
  const rooms = ["deluxe", "premium", "family-suite"];
  const out: RateCardDetail["guests"] = [];
  rooms.forEach((roomId) =>
    rules.forEach(([cls, band, bed, amount, max]) => out.push([roomId, cls, band, bed, "all", amount, max])),
  );
  return out;
};

const blankHotel = (): RateCardDetail => ({
  id: "rc-new-hotel",
  name: "New accommodation tariff",
  ref: "RC-DRAFT",
  vendor: "Example Hospitality",
  property: "Untitled property",
  service: "Accommodation",
  currency: "INR",
  validity: "Not set",
  state: "Draft",
  tone: "warning",
  ready: "Blank — add seasons and prices",
  readyTone: "warning",
  taxConfirmed: false,
  mealBasis: "Tax unconfirmed",
  mealLabel: "Meal plan",
  meals: [
    { code: "EP", label: "Room only" },
    { code: "CP", label: "With breakfast" },
  ],
  rooms: [{ id: "room-1", name: "Standard", note: "Add detail", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 }],
  prices: [[[null], [null]]],
  seasons: [
    {
      name: "Season 1",
      colorToken: "accent",
      dates: "Not set",
      summary: "Add date ranges",
      nights: 0,
      priority: "Base",
    },
  ],
  guests: [],
  supplements: [],
  services: [],
  activities: [],
  rules: [],
  cancel: [],
  policies: [
    policy(
      "tax",
      "Tax treatment",
      "Commercial",
      "Not confirmed",
      "Tax treatment for this draft has not been confirmed with the supplier. Confirm whether published rates are inclusive or exclusive of GST before quoting.",
      "unresolved",
    ),
    policy(
      "currency",
      "Currency",
      "Commercial",
      "INR",
      "All amounts on this rate card are denominated in Indian Rupees (INR) unless a separate currency schedule is attached.",
    ),
  ],
  activity: [
    {
      date: "Today",
      time: "—",
      member: "You",
      role: "Vendor desk",
      initials: "YO",
      avatarTone: "pink",
      event: "Created draft from Accommodation template",
      area: "Card",
    },
  ],
  notes: [],
});

const blankVisa = (): RateCardDetail => ({
  id: "rc-new-visa",
  name: "New visa services tariff",
  ref: "RC-DRAFT",
  vendor: "Example Hospitality",
  property: "Untitled visa product",
  service: "Visa",
  currency: "INR",
  validity: "Not set",
  state: "Draft",
  tone: "warning",
  ready: "Blank — add products and fees",
  readyTone: "warning",
  taxConfirmed: false,
  mealBasis: "Tax unconfirmed",
  mealLabel: "Fee component",
  meals: [
    { code: "GOVT", label: "Government fee" },
    { code: "VENDOR", label: "Vendor fee" },
  ],
  rooms: [{ id: "product-1", name: "Tourist entry", note: "Add detail", baseOccupancy: 1, maxOccupancy: 1, maxBeds: 0 }],
  prices: [[[null], [null]]],
  seasons: [
    {
      name: "Current",
      colorToken: "accent",
      dates: "Not set",
      summary: "Add coverage",
      nights: 0,
      priority: "Base",
    },
  ],
  guests: [],
  supplements: [],
  services: [],
  activities: [],
  rules: [],
  cancel: [],
  policies: [
    policy(
      "tax",
      "Tax treatment",
      "Commercial",
      "Not confirmed",
      "Tax treatment for this draft has not been confirmed with the supplier. Confirm whether fees are inclusive or exclusive of GST before quoting.",
      "unresolved",
    ),
    policy(
      "basis",
      "Charging basis",
      "Commercial",
      "Per applicant",
      "Fees on this card are charged per applicant. Companion or dependent applicants are priced as separate lines unless a family schedule is attached.",
    ),
  ],
  activity: [
    {
      date: "Today",
      time: "—",
      member: "You",
      role: "Vendor desk",
      initials: "YO",
      avatarTone: "pink",
      event: "Created draft from Visa template",
      area: "Card",
    },
  ],
  notes: [],
  catLabels: {
    accommodation: "Visa products",
    special: "Optional services",
    activities: "Vendor services",
    services: "Financial rules",
    seasons: "Coverage",
  },
});

export const DETAIL_CARDS: Record<string, RateCardDetail> = {
  "rc-new-hotel": blankHotel(),
  "rc-new-visa": blankVisa(),
  "rc-acc-2627": {
    id: "rc-acc-2627",
    name: "Accommodation tariff · 2026–27",
    ref: "RC-2026-0114",
    vendor: "Example Hospitality",
    property: "Example Lake Resort",
    service: "Accommodation",
    currency: "INR",
    validity: "01 Apr 2026 – 31 Mar 2027",
    state: "Published",
    tone: "success",
    ready: "Usable in proposals",
    readyTone: "success",
    taxConfirmed: true,
    mealBasis: "Tax included",
    mealLabel: "Meal plan",
    hasWeekendExtra: true,
    meals: [
      { code: "EP", label: "Room only" },
      { code: "CP", label: "With breakfast" },
      { code: "MAP", label: "Breakfast + one meal" },
      { code: "AP", label: "All meals" },
    ],
    rooms: [
      { id: "garden-view", name: "Garden View", note: "Ground floor · 28 sqm", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 },
      { id: "sea-view", name: "Lake View", note: "Upper floors · 32 sqm", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 },
      { id: "sea-view-suite", name: "Lake View Suite", note: "Separate living area · 48 sqm", baseOccupancy: 2, maxOccupancy: 4, maxBeds: 1 },
    ],
    prices: [
      [
        [5200, 6400, 8600],
        [6000, 7200, 9400],
        [7100, 8300, 10500],
        [8400, 9600, 11800],
      ],
      [
        [6800, 8200, 11000],
        [7600, 9000, 11800],
        [8700, 10100, 12900],
        [10000, 11400, 14200],
      ],
      [
        [11500, 13800, 18400],
        [12300, 14600, 19200],
        [13400, 15700, 20300],
        [14700, 17000, 21600],
      ],
    ],
    weekendExtra: [
      [900, 1100, 1600],
      [1200, 1500, 2100],
      [1800, 2200, 3200],
    ],
    seasons: [
      { name: "Low", colorToken: "ink-3", dates: "15 Apr – 30 Sep 2026", summary: "2 ranges · 145 nights", nights: 145, priority: "Base" },
      { name: "Shoulder", colorToken: "accent", dates: "01 Oct – 19 Dec 2026", summary: "3 ranges · 118 nights", nights: 118, priority: "Base" },
      { name: "Peak", colorToken: "pink", dates: "20 Dec 2026 – 14 Apr 2027", summary: "2 ranges · 102 nights", nights: 102, priority: "Overrides base" },
    ],
    guests: coralGuests(),
    guestNote: "A child charge and an extra-adult charge never stack on the same guest.",
    supplements: [
      { name: "Christmas Eve gala", applies: "24 Dec 2026", amount: 3500, unit: "per adult · mandatory", basis: "Mandatory", tone: "danger" },
      { name: "New Year gala", applies: "31 Dec 2026", amount: 4500, unit: "per adult · mandatory", basis: "Mandatory", tone: "danger" },
    ],
    services: [
      { name: "Airport pickup", note: "Transfer · sedan · up to 3 pax", applies: "One way", basis: "Per vehicle", amount: 2200 },
      { name: "Airport drop", note: "Transfer · sedan · up to 3 pax", applies: "One way", basis: "Per vehicle", amount: 2200 },
      { name: "Early check-in", note: "Before 10:00 · subject to availability", applies: "Per booking", basis: "Complimentary", amount: 0 },
      { name: "Laundry service", note: "In-room · same day", applies: "Per item", basis: "Per item", amount: null },
    ],
    activities: DEFAULT_ACTIVITIES,
    rules: [
      ["Minimum stay", "20 Dec 2026 – 02 Jan 2027", "3 nights", "Block", "danger"],
      ["Minimum stay", "15 Apr – 30 Sep 2026", "1 night", "Allow", "success"],
      ["Blackout", "25 Dec 2026", "Closed", "Block", "danger"],
      ["Check-out night", "All dates", "Not charged", "Allow", "success"],
    ],
    cancel: [
      { window: "30 days or more", charge: "Free", basis: "No charge", tone: "success" },
      { window: "15–29 days", charge: "25%", basis: "Of total booking value", tone: "warning" },
      { window: "7–14 days", charge: "50%", basis: "Of total booking value", tone: "warning" },
      { window: "Under 7 days", charge: "100%", basis: "Of total booking value", tone: "danger" },
    ],
    policies: [
      policy(
        "cancel",
        "Cancellation & refunds",
        "Cancellation",
        "Free ≥30 days · 25% / 50% / 100% closer in",
        [
          "Cancellations are measured from the scheduled check-in date at the property.",
          "",
          "• 30 days or more before check-in — free cancellation; no charge.",
          "• 15–29 days before check-in — 25% of the total booking value.",
          "• 7–14 days before check-in — 50% of the total booking value.",
          "• Under 7 days, including no-shows — 100% of the total booking value.",
          "",
          "Refunds, where due, are processed to the original payment method within 14 working days of written confirmation from the vendor desk.",
        ].join("\n"),
        "ok",
        {
          name: "Cancellation schedule",
          file: "EH-Lake-Cancel-2026-27.pdf",
          size: "184 KB",
        },
      ),
      policy(
        "stay",
        "Stay rules & blackouts",
        "Stay",
        "3-night festive minimum · 25 Dec blackout",
        [
          "Minimum stay and blackout rules override season rates when they conflict.",
          "",
          "• 20 Dec 2026 – 02 Jan 2027 — minimum stay of 3 nights. Shorter stays must be refused, not repriced.",
          "• 15 Apr – 30 Sep 2026 — minimum stay of 1 night.",
          "• 25 Dec 2026 — property closed for a private event. Hard blackout; do not sell.",
          "• Check-out night is not charged on any date.",
        ].join("\n"),
        "ok",
        {
          name: "Stay rules extract",
          file: "EH-Lake-StayRules-2026-27.pdf",
          size: "96 KB",
        },
      ),
      policy(
        "tax",
        "Tax treatment",
        "Commercial",
        "Included in rate",
        "Published room and meal rates on this card already include applicable GST. Do not add tax again when costing proposals from this card.",
        "ok",
        {
          name: "Tax confirmation",
          file: "EH-Lake-Tax-Confirm-2026.pdf",
          size: "72 KB",
        },
      ),
      policy(
        "basis",
        "Charging basis",
        "Commercial",
        "Per room / night",
        "Accommodation is sold per room, per night. Meal plans follow the same room-night basis. Extra adult and child rates are applied per person, per night as listed on the guest schedule.",
      ),
      policy(
        "checkin",
        "Check-in & check-out",
        "Stay",
        "Check-in 14:00 · Check-out 11:00",
        [
          "Standard check-in is from 14:00 on the arrival date.",
          "Standard check-out is by 11:00 on the departure date.",
          "",
          "Early check-in before 10:00 is complimentary when the property confirms availability. Late check-out is subject to room availability and may attract a half-day charge.",
        ].join("\n"),
      ),
      policy(
        "currency",
        "Currency",
        "Commercial",
        "INR",
        "All amounts on this rate card are denominated in Indian Rupees (INR). Cross-currency conversions are not offered by the property.",
      ),
      policy(
        "rate-type",
        "Rate type",
        "Commercial",
        "Net non-commissionable",
        "Rates on this card are net and non-commissionable. The agency costs from the net column only. Any published retail figure shown by the resort is for reference and is not used for proposals.",
        "ok",
        {
          name: "Commercial terms",
          file: "EH-Lake-Commercial-2026-27.pdf",
          size: "210 KB",
        },
      ),
      policy(
        "child",
        "Child age proof",
        "Guests",
        "Passport at check-in",
        "Child age bands on this card are verified against passport (or government ID) at check-in. Incorrect age declarations may be re-rated to the adult extra-bed charge for the full stay.",
      ),
      policy(
        "payment",
        "Payment terms",
        "Commercial",
        "50% on confirmation",
        [
          "A deposit of 50% of the total booking value is due on confirmation.",
          "The balance is due no later than 21 days before check-in.",
          "",
          "Bookings made inside 21 days of arrival require full payment at confirmation.",
        ].join("\n"),
        "ok",
        {
          name: "Payment schedule",
          file: "EH-Lake-Payment-2026-27.pdf",
          size: "128 KB",
        },
      ),
      policy(
        "amendment",
        "Amendment fee",
        "Commercial",
        "Not offered",
        "Date and room amendments after confirmation are not offered as a paid service on this card. Changes are treated as a cancellation of the original booking plus a new booking at the rates then in force.",
        "none",
      ),
    ],
    activity: [
      { date: "02 Sep 2026", time: "11:24 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Published card after confirming gala supplements", area: "Rates" },
      { date: "02 Sep 2026", time: "10:05 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Confirmed net rate as the cost basis", area: "Finance" },
      { date: "01 Sep 2026", time: "16:40 IST", member: "Rahul Sharma", role: "Operations", initials: "RS", avatarTone: "channel", event: "Added Lake View Suite across all 4 meal plans", area: "Rates" },
      { date: "01 Sep 2026", time: "14:12 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Set 3-night minimum for the festive window", area: "Stay rules" },
      { date: "31 Aug 2026", time: "09:30 IST", member: "Meera Iyer", role: "Operations", initials: "MI", avatarTone: "warn", event: "Imported tariff · mapped 3 rooms, 4 meal plans", area: "Sources" },
      { date: "30 Aug 2026", time: "17:02 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Created draft from Accommodation template", area: "Card" },
    ],
    notes: [
      { body: "Net rate is the only column we cost from. Published rate is the resort’s own retail figure.", author: "Anjali Menon", when: "02 Sep · 10:05" },
      { body: "Both galas are mandatory and charge per adult, not per room. Children are exempt.", author: "Anjali Menon", when: "01 Sep · 14:30" },
      { body: "25 Dec the property is closed for a private event — hard blackout, not a rate gap.", author: "Rahul Sharma", when: "01 Sep · 11:15" },
      { body: "Festive window carries a 3-night minimum. Shorter stays must be refused, not repriced.", author: "Anjali Menon", when: "31 Aug · 16:20" },
    ],
  },
  "rc-hill-2627": {
    id: "rc-hill-2627",
    name: "Hill Retreat tariff · 2026–27",
    ref: "RC-2026-0119",
    vendor: "Example Hospitality",
    property: "Example Hill Retreat",
    service: "Accommodation",
    currency: "INR",
    validity: "01 Apr 2026 – 31 Mar 2027",
    state: "Draft",
    tone: "warning",
    ready: "7 clarifications open",
    readyTone: "warning",
    taxConfirmed: false,
    mealBasis: "Tax unconfirmed",
    mealLabel: "Meal plan",
    meals: [
      { code: "CP", label: "With breakfast" },
      { code: "MAP", label: "Breakfast + dinner" },
      { code: "AP", label: "All meals" },
    ],
    rooms: [
      { id: "deluxe", name: "Deluxe", note: "Valley facing · 24 sqm", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 },
      { id: "premium", name: "Premium", note: "Corner room · 30 sqm", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 },
      { id: "family-suite", name: "Family Suite", note: "Two bedrooms · 44 sqm", baseOccupancy: 4, maxOccupancy: 6, maxBeds: 2 },
    ],
    prices: [
      [
        [4500, 5800, null],
        [5400, 6700, null],
        [6200, 7500, null],
      ],
      [
        [5800, 7200, null],
        [6700, 8100, null],
        [7500, 8900, null],
      ],
      [
        [9500, 11800, null],
        [10800, 13100, null],
        [12000, 14300, null],
      ],
    ],
    seasons: [
      { name: "Off season", colorToken: "ink-3", dates: "15 Jun – 15 Sep 2026", summary: "1 range · 93 nights", nights: 93, priority: "Base" },
      { name: "Season", colorToken: "accent", dates: "16 Sep – 30 Nov 2026", summary: "2 ranges · 76 nights", nights: 76, priority: "Base" },
      { name: "Winter", colorToken: "pink", dates: "Not provided", summary: "Supplier has not released", nights: 0, priority: "Unpriced" },
    ],
    guests: tashiGuests(),
    guestNote: "Without-bed child charge is unconfirmed.",
    supplements: [
      { name: "Heating charge", applies: "01 Nov – 28 Feb", amount: 500, unit: "per room / night", basis: "Mandatory", tone: "danger" },
      { name: "Permit assistance", applies: "On request", amount: null, unit: "not confirmed", basis: "Unresolved", tone: "warning" },
      { name: "Bonfire", applies: "On request", amount: 1500, unit: "per booking", basis: "Optional", tone: "neutral" },
    ],
    services: [
      { name: "Airport pickup", note: "Transfer · SUV", applies: "One way", basis: "Per vehicle", amount: 3500 },
      { name: "Airport drop", note: "Transfer · SUV", applies: "One way", basis: "Per vehicle", amount: 3500 },
    ],
    activities: [
      { name: "Village walk", note: "Experience · 09:00 · 3 hrs", group: "2A min · max 8", basis: "Per person", amount: 1200 },
    ],
    rules: [
      ["Minimum stay", "16 Sep – 30 Nov 2026", "2 nights", "Block", "danger"],
      ["Road closure", "01 Dec – 14 Jun", "Unpriced", "Block", "danger"],
      ["Check-out night", "All dates", "Not charged", "Allow", "success"],
    ],
    cancel: [
      { window: "21 days or more", charge: "Free", basis: "No charge", tone: "success" },
      { window: "7–20 days", charge: "30%", basis: "Of total booking value", tone: "warning" },
      { window: "Under 7 days", charge: "Not provided", basis: "Awaiting supplier", tone: "warning" },
    ],
    policies: [
      policy(
        "cancel",
        "Cancellation & refunds",
        "Cancellation",
        "Free ≥21 days · under 7 days pending",
        [
          "• 21 days or more before check-in — free cancellation.",
          "• 7–20 days before check-in — 30% of the total booking value.",
          "• Under 7 days — charge not yet confirmed by the supplier. Do not quote firm cancellation terms until resolved.",
        ].join("\n"),
        "unresolved",
        {
          name: "Cancellation draft",
          file: "EH-Hill-Cancel-Draft.pdf",
          size: "64 KB",
        },
      ),
      policy(
        "tax",
        "Tax treatment",
        "Commercial",
        "Not confirmed",
        "Tax treatment has not been confirmed. Clarify whether rates are inclusive or exclusive of GST before publishing.",
        "unresolved",
      ),
      policy(
        "basis",
        "Charging basis",
        "Commercial",
        "Per room / night",
        "Accommodation is sold per room, per night. Meal plans follow the same room-night basis.",
      ),
      policy(
        "checkin",
        "Check-in & check-out",
        "Stay",
        "Check-in 13:00 · Check-out 10:00",
        "Standard check-in is from 13:00. Standard check-out is by 10:00. Early check-in and late check-out are subject to availability.",
      ),
      policy(
        "currency",
        "Currency",
        "Commercial",
        "INR",
        "All amounts on this rate card are denominated in Indian Rupees (INR).",
      ),
      policy(
        "rate-type",
        "Rate type",
        "Commercial",
        "Not confirmed",
        "Whether rates are net, commissionable, or rack has not been confirmed with the supplier.",
        "unresolved",
      ),
      policy(
        "child",
        "Child age proof",
        "Guests",
        "Not stated",
        "The supplier has not stated how child ages are verified at check-in. Hold proposals that rely on child pricing until this is confirmed.",
        "unresolved",
      ),
      policy(
        "payment",
        "Payment terms",
        "Commercial",
        "Not confirmed",
        "Deposit and balance schedule has not been confirmed with the supplier.",
        "unresolved",
      ),
      policy(
        "amendment",
        "Amendment fee",
        "Commercial",
        "Not offered",
        "Amendments after confirmation are not offered as a paid service on this draft.",
        "none",
      ),
    ],
    activity: [
      { date: "05 Sep 2026", time: "15:20 IST", member: "Meera Iyer", role: "Operations", initials: "MI", avatarTone: "warn", event: "Raised 7 clarifications with the supplier", area: "Card" },
      { date: "05 Sep 2026", time: "14:02 IST", member: "Meera Iyer", role: "Operations", initials: "MI", avatarTone: "warn", event: "Flagged winter season as unpriced, not zero", area: "Seasons" },
      { date: "04 Sep 2026", time: "11:40 IST", member: "Meera Iyer", role: "Operations", initials: "MI", avatarTone: "warn", event: "Entered off season and season rates for 3 rooms", area: "Rates" },
      { date: "04 Sep 2026", time: "09:15 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Created draft from Accommodation template", area: "Card" },
    ],
    notes: [
      { body: "Supplier has not released winter rates. Leave unpriced — do not carry season rates forward.", author: "Meera Iyer", when: "05 Sep · 14:02" },
      { body: "Without-bed child charge still unanswered. Third follow-up sent.", author: "Meera Iyer", when: "05 Sep · 15:20" },
    ],
  },
  "rc-visa-uae": {
    id: "rc-visa-uae",
    name: "Visa services tariff · UAE · 2026",
    ref: "RC-2026-0218",
    vendor: "Atlas Visa Services",
    property: "Atlas Visa Services",
    service: "Visa",
    currency: "INR",
    validity: "01 Apr – 30 Sep 2026",
    state: "Published",
    tone: "success",
    ready: "Usable in proposals",
    readyTone: "success",
    taxConfirmed: true,
    mealBasis: "Exclusive of tax",
    mealLabel: "Fee component",
    meals: [
      { code: "GOVT", label: "Government fee" },
      { code: "CENTRE", label: "Visa-centre fee" },
      { code: "VENDOR", label: "Vendor fee" },
      { code: "BIO", label: "Biometrics" },
    ],
    rooms: [
      { id: "tourist-30", name: "Tourist 30 days", note: "Single entry · online", baseOccupancy: 1, maxOccupancy: 1, maxBeds: 0 },
      { id: "tourist-60", name: "Tourist 60 days", note: "Single entry · online", baseOccupancy: 1, maxOccupancy: 1, maxBeds: 0 },
      { id: "tourist-90", name: "Tourist 90 days", note: "Multiple entry · centre", baseOccupancy: 1, maxOccupancy: 1, maxBeds: 0 },
    ],
    prices: [
      [
        [3200, 3400],
        [1800, 1900],
        [2500, 2600],
        [900, 900],
      ],
      [
        [4800, 5100],
        [1800, 1900],
        [2800, 2900],
        [900, 900],
      ],
      [
        [7200, 7600],
        [2200, 2300],
        [3200, 3400],
        [1200, null],
      ],
    ],
    seasons: [
      { name: "Current", colorToken: "accent", dates: "01 Apr – 30 Jun 2026", summary: "Live schedule", nights: 91, priority: "Base" },
      { name: "Announced", colorToken: "pink", dates: "01 Jul – 30 Sep 2026", summary: "Published advance", nights: 92, priority: "Base" },
    ],
    guests: [],
    supplements: [
      { name: "Express processing", applies: "On request", amount: 4500, unit: "per applicant", basis: "Optional", tone: "neutral" },
    ],
    services: [
      { name: "Document review", note: "Vendor desk", applies: "Per case", basis: "Included", amount: 0 },
    ],
    activities: [],
    rules: [["Validity", "Application country", "India", "Allow", "success"]],
    cancel: [
      { window: "Before biometrics", charge: "Vendor fee retained", basis: "Government fee refundable", tone: "warning" },
      { window: "After submission", charge: "100%", basis: "Non-refundable", tone: "danger" },
    ],
    policies: [
      policy(
        "cancel",
        "Cancellation & refunds",
        "Cancellation",
        "Vendor fee retained after biometrics",
        [
          "• Before biometrics — government fee is refundable; vendor processing fee is retained.",
          "• After submission — 100% non-refundable.",
        ].join("\n"),
        "ok",
        {
          name: "Visa cancellation note",
          file: "Atlas-UAE-Cancel-2026.pdf",
          size: "88 KB",
        },
      ),
      policy(
        "tax",
        "Tax treatment",
        "Commercial",
        "Exclusive — add GST",
        "Fees on this card are exclusive of GST. Add applicable GST when costing proposals.",
        "ok",
        {
          name: "Fee schedule",
          file: "Atlas-UAE-Fees-2026.pdf",
          size: "156 KB",
        },
      ),
      policy(
        "basis",
        "Charging basis",
        "Commercial",
        "Per applicant",
        "All visa products on this card are priced per applicant.",
      ),
      policy(
        "currency",
        "Currency",
        "Commercial",
        "INR",
        "All amounts are denominated in Indian Rupees (INR).",
      ),
      policy(
        "scope",
        "Nationality scope",
        "Eligibility",
        "Indian passport holders",
        "This schedule applies to Indian passport holders only. Other nationalities require a separate quote from the vendor.",
      ),
      policy(
        "payment",
        "Payment terms",
        "Commercial",
        "At submission",
        "Full payment is due at case submission. Express processing, where selected, is charged with the same settlement.",
      ),
    ],
    activity: [
      { date: "01 Sep 2026", time: "15:10 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Confirmed vendor processing fee as the exclusive-tax cost basis", area: "Finance" },
      { date: "28 Aug 2026", time: "11:00 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Published UAE tourist products for FY schedule", area: "Rates" },
    ],
    notes: [
      { body: "Biometrics for 90-day multiple entry still missing on the announced season.", author: "Anjali Menon", when: "01 Sep · 15:10" },
    ],
    catLabels: {
      accommodation: "Visa products",
      special: "Optional services",
      activities: "Vendor services",
      services: "Financial rules",
      seasons: "Coverage",
    },
  },
  "rc-acc-2526": {
    id: "rc-acc-2526",
    name: "Accommodation tariff · 2025–26",
    ref: "RC-2025-0114",
    vendor: "Example Hospitality",
    property: "Example Lake Resort",
    service: "Accommodation",
    currency: "INR",
    validity: "01 Apr 2025 – 31 Mar 2026",
    state: "Expired",
    tone: "neutral",
    ready: "Superseded",
    readyTone: "neutral",
    taxConfirmed: true,
    mealBasis: "Tax included",
    mealLabel: "Meal plan",
    meals: [
      { code: "EP", label: "Room only" },
      { code: "CP", label: "With breakfast" },
    ],
    rooms: [
      { id: "garden-view", name: "Garden View", note: "Ground floor · 28 sqm", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 },
      { id: "sea-view", name: "Lake View", note: "Upper floors · 32 sqm", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 },
    ],
    prices: [
      [[4800], [5500]],
      [[6200], [7000]],
    ],
    seasons: [
      { name: "Full year", colorToken: "ink-3", dates: "01 Apr 2025 – 31 Mar 2026", summary: "1 range · 365 nights", nights: 365, priority: "Base" },
    ],
    guests: [],
    supplements: [],
    services: [],
    activities: [],
    rules: [],
    cancel: [{ window: "Under 7 days", charge: "100%", basis: "Of total booking value", tone: "danger" }],
    policies: [
      policy(
        "cancel",
        "Cancellation & refunds",
        "Cancellation",
        "100% under 7 days",
        "Cancellations within 7 days of check-in, including no-shows, are charged at 100% of the total booking value. This card is expired and superseded by the 2026–27 tariff.",
        "ok",
        {
          name: "Archived cancellation",
          file: "EH-Lake-Cancel-2025-26.pdf",
          size: "140 KB",
        },
      ),
      policy(
        "tax",
        "Tax treatment",
        "Commercial",
        "Included in rate",
        "Published rates on this archived card included applicable GST.",
      ),
      policy(
        "currency",
        "Currency",
        "Commercial",
        "INR",
        "All amounts were denominated in Indian Rupees (INR).",
      ),
    ],
    activity: [
      { date: "01 Apr 2026", time: "09:00 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Marked expired — superseded by 2026–27 card", area: "Card" },
    ],
    notes: [],
  },
  "rc-air-2026": {
    id: "rc-air-2026",
    name: "Airport transfer rates · 2026",
    ref: "RC-2026-0301",
    vendor: "Example Hospitality",
    property: "Fleet — Kochi",
    service: "Transport",
    currency: "INR",
    validity: "01 Jan – 31 Dec 2026",
    state: "Published",
    tone: "success",
    ready: "Usable in proposals",
    readyTone: "success",
    taxConfirmed: true,
    mealBasis: "Tax included",
    mealLabel: "Vehicle class",
    meals: [
      { code: "SEDAN", label: "Sedan" },
      { code: "SUV", label: "SUV" },
      { code: "TEMPO", label: "Tempo" },
    ],
    rooms: [
      { id: "cok-city", name: "COK → City", note: "One way · up to 40 km", baseOccupancy: 3, maxOccupancy: 3, maxBeds: 0 },
      { id: "city-cok", name: "City → COK", note: "One way · up to 40 km", baseOccupancy: 3, maxOccupancy: 3, maxBeds: 0 },
    ],
    prices: [
      [[2200], [3200], [4500]],
      [[2200], [3200], [4500]],
    ],
    seasons: [
      { name: "2026", colorToken: "accent", dates: "01 Jan – 31 Dec 2026", summary: "Single price set", nights: 365, priority: "Base" },
    ],
    guests: [],
    supplements: [
      { name: "Waiting charge", applies: "After 45 min", amount: 300, unit: "per hour", basis: "Mandatory", tone: "danger" },
    ],
    services: [],
    activities: [],
    rules: [],
    cancel: [{ window: "Same day", charge: "50%", basis: "Of transfer value", tone: "warning" }],
    policies: [
      policy(
        "cancel",
        "Cancellation & refunds",
        "Cancellation",
        "50% same-day",
        "Same-day cancellations after the vehicle is dispatched are charged at 50% of the transfer value. Cancellations before dispatch are free.",
        "ok",
        {
          name: "Transfer cancellation",
          file: "EH-Kochi-Transfer-Cancel-2026.pdf",
          size: "74 KB",
        },
      ),
      policy(
        "tax",
        "Tax treatment",
        "Commercial",
        "Included in rate",
        "Published transfer rates include applicable GST.",
      ),
      policy(
        "basis",
        "Charging basis",
        "Commercial",
        "Per vehicle",
        "Transfers are charged per vehicle for the stated passenger capacity. Waiting beyond 45 minutes attracts the waiting charge listed on the card.",
      ),
    ],
    activity: [
      { date: "12 Jan 2026", time: "10:00 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Published Kochi fleet transfer rates", area: "Rates" },
    ],
    notes: [],
  },
};

export function getDetailCard(id: string): RateCardDetail | undefined {
  return DETAIL_CARDS[id];
}

export function listDetailCards(): RateCardDetail[] {
  return Object.values(DETAIL_CARDS);
}

export function formatMoney(amount: number | null | undefined, currency = "INR"): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const BED_LABEL: Record<string, string> = {
  extra_bed: "With extra bed",
  existing_bed: "Sharing existing bed",
  cot: "Cot on request",
  no_bed: "Without extra bed",
};

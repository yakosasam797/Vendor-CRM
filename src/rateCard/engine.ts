import { TEST_CAL, TEST_DATES, type RateCardDetail } from "./types";
import { formatMoney } from "./cards";

export interface QuoteInput {
  checkIn: number;
  nights: number;
  roomIndex: number;
  mealIndex: number;
  adults: number;
  rooms: number;
  children: { age: number; bed: "yes" | "no" }[];
}

export interface QuoteLine {
  label: string;
  note?: string;
  amount: number | null;
  emphasis?: boolean;
}

export interface QuoteResult {
  blocker: string;
  trace: { step: string; detail: string }[];
  lines: QuoteLine[];
  total: number | null;
  totalLabel: string;
  totalNote: string;
  indicative: boolean;
  nightsLabel: string;
}

export function runQuote(card: RateCardDetail, input: QuoteInput): QuoteResult {
  const cal = TEST_CAL[card.id] ?? TEST_CAL["rc-acc-2627"];
  const room = card.rooms[Math.min(input.roomIndex, card.rooms.length - 1)];
  const mealIdx = Math.min(input.mealIndex, card.meals.length - 1);
  const roomIdx = Math.min(input.roomIndex, card.rooms.length - 1);
  const nights = Math.max(1, input.nights);
  const startIdx = Math.min(input.checkIn, TEST_DATES.length - 1);
  const childCount = input.children.length;
  const pax = input.adults + childCount;
  const basePax = room.baseOccupancy * input.rooms;
  const maxPax = room.maxOccupancy * input.rooms;

  const trace: QuoteResult["trace"] = [];
  let blocker = "";

  const perNight: { date: string; si: number; sname: string }[] = [];
  for (let i = 0; i < nights; i++) {
    const at = Math.min(startIdx + i, cal.length - 1);
    const [si, sname] = cal[at];
    const [dateLabel] = TEST_DATES[at];
    perNight.push({ date: dateLabel, si, sname });
  }
  const spans = [...new Set(perNight.map((n) => n.sname))];
  trace.push({
    step: "Resolve season per night",
    detail:
      spans.length > 1
        ? `Stay crosses ${spans.length} price sets: ${spans.join(" → ")}. Each night takes its own rate.`
        : `All ${nights} nights fall in ${spans[0]}.`,
  });

  const unpriced = perNight.find((n) => n.si < 0);
  const blackout = card.id === "rc-acc-2627" && perNight.some((n) => n.date === "25 Dec 2026");
  if (unpriced) {
    blocker = `${unpriced.date} falls in a window the supplier has not priced. The engine will not carry another season's rate forward.`;
    trace.push({ step: "Refuse unpriced night", detail: `${unpriced.date} has no price set. Blocked.` });
  }
  if (!blocker && blackout) {
    blocker = "25 Dec 2026 is a hard blackout. The stay must be refused.";
    trace.push({ step: "Refuse blackout", detail: "Property closed for a private event." });
  }

  let minStay = 1;
  let minWindow = "";
  for (const [rule, window, value] of card.rules) {
    if (rule !== "Minimum stay") continue;
    const n = parseInt(value, 10);
    if (!n) continue;
    const applies = perNight.some((pn) => {
      if (window.includes("20 Dec")) return pn.si === 2;
      if (window.includes("16 Sep") || window.includes("01 Oct")) return pn.si === 1;
      return pn.si === 0;
    });
    if (applies && n > minStay) {
      minStay = n;
      minWindow = window;
    }
  }
  if (!blocker && minStay > 1 && nights < minStay) {
    blocker = `${minWindow} carries a ${minStay}-night minimum. This ${nights}-night stay must be refused, not repriced.`;
    trace.push({ step: "Enforce minimum stay", detail: blocker });
  }

  if (!blocker && pax > maxPax) {
    blocker = `${room.name} allows max ${maxPax} guests across ${input.rooms} room(s). This party is ${pax}.`;
    trace.push({ step: "Refuse over occupancy", detail: blocker });
  }

  const lines: QuoteLine[] = [];
  let roomTotal = 0;
  let missingPrice = false;

  if (!blocker) {
    for (const night of perNight) {
      const price = card.prices[roomIdx]?.[mealIdx]?.[night.si] ?? null;
      if (price == null) {
        missingPrice = true;
        lines.push({
          label: `${night.date} · ${night.sname}`,
          note: `${room.name} · ${card.meals[mealIdx]?.label}`,
          amount: null,
        });
      } else {
        const nightAmt = price * input.rooms;
        roomTotal += nightAmt;
        lines.push({
          label: `${night.date} · ${night.sname}`,
          note: `${room.name} · ${card.meals[mealIdx]?.label}`,
          amount: nightAmt,
        });
      }
    }
    if (missingPrice) {
      blocker = "One or more nights have no recorded rate for this room and meal plan.";
      trace.push({ step: "Refuse missing price", detail: blocker });
    } else {
      trace.push({
        step: "Sum room nights",
        detail: `${nights} night(s) × ${input.rooms} room(s) = ${formatMoney(roomTotal, card.currency)}.`,
      });
    }
  }

  let extraTotal = 0;
  if (!blocker && pax > basePax) {
    const extras = pax - basePax;
    const adultRule = card.guests.find((g) => g[0] === room.id && g[1] === "Extra adult");
    const rate = adultRule?.[5] ?? 0;
    if (rate == null) {
      blocker = "Extra guest charge is unconfirmed for this room.";
      trace.push({ step: "Refuse unconfirmed guest charge", detail: blocker });
    } else {
      extraTotal = rate * extras * nights;
      lines.push({
        label: `Extra guests × ${extras}`,
        note: `${formatMoney(rate, card.currency)} / night`,
        amount: extraTotal,
      });
      trace.push({ step: "Add extra guest charges", detail: `${extras} over included occupancy.` });
    }
  }

  let supplementTotal = 0;
  if (!blocker) {
    for (const s of card.supplements.filter((x) => x.basis === "Mandatory" && x.amount != null)) {
      const hits = perNight.some((n) => s.applies.includes(n.date.slice(0, 6)) || s.applies === n.date);
      if (!hits && !/Dec|Jan|Nov|Feb/.test(s.applies)) continue;
      const applies = perNight.some((n) => s.applies.includes(n.date) || (s.applies.includes("24 Dec") && n.date === "24 Dec 2026") || (s.applies.includes("31 Dec") && n.date === "31 Dec 2026"));
      if (!applies) continue;
      const amt = (s.amount ?? 0) * input.adults;
      supplementTotal += amt;
      lines.push({ label: s.name, note: s.unit, amount: amt });
    }
    if (supplementTotal > 0) {
      trace.push({ step: "Add mandatory supplements", detail: formatMoney(supplementTotal, card.currency) });
    }
  }

  const total = blocker ? null : roomTotal + extraTotal + supplementTotal;
  if (!blocker) {
    lines.push({ label: "Stay total", amount: total, emphasis: true });
  }

  return {
    blocker,
    trace,
    lines,
    total,
    totalLabel: blocker ? "Blocked" : card.taxConfirmed ? "Net total" : "Indicative total",
    totalNote: blocker
      ? "Do not send this figure"
      : card.taxConfirmed
        ? `${card.mealBasis} · selling price set in proposal`
        : "Tax treatment unconfirmed — indicative only",
    indicative: !card.taxConfirmed && !blocker,
    nightsLabel: `${nights} night${nights === 1 ? "" : "s"} · ${input.rooms} room${input.rooms === 1 ? "" : "s"} · ${pax} guests`,
  };
}

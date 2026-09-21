import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  Button,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  IconButton,
  LeadCell,
  StatusChip,
  TabBar,
  type StatusTone,
  type TabItem,
} from "@paryatech/design-system";
import {
  BED_LABEL,
  formatMoney,
  getDetailCard,
} from "../../rateCard/cards";
import { runQuote, type QuoteInput } from "../../rateCard/engine";
import {
  TEST_DATES,
  type CardTone,
  type DetailPageTab,
  type RateCardDetail,
} from "../../rateCard/types";
import {
  IconCalendar,
  IconChevronDown,
  IconClose,
  IconNotes,
  IconPlus,
} from "../../icons";
import { RecordHeader } from "../RecordHeader";
import { StatusChipWithDot } from "../StatusChipWithDot";
import { ActivityPanel } from "../ActivityPanel";
import { activityFromEvents } from "../activityFromEvents";
import { PoliciesPanel } from "./PoliciesPanel";
import "./RateCardDetail.css";

function toneToStatus(tone: CardTone): StatusTone {
  if (tone === "success") return "done";
  if (tone === "warning") return "progress";
  if (tone === "danger") return "blocked";
  return "open";
}

function catLabel(card: RateCardDetail, key: string, fallback: string) {
  return card.catLabels?.[key] ?? fallback;
}

function priceTone(amount: number | null, taxConfirmed: boolean): "ok" | "missing" | "warn" {
  if (amount == null) return "missing";
  if (!taxConfirmed) return "warn";
  return "ok";
}

function PriceChip({
  amount,
  currency,
  taxConfirmed,
  sub,
}: {
  amount: number | null;
  currency: string;
  taxConfirmed: boolean;
  sub?: string;
}) {
  const tone = priceTone(amount, taxConfirmed);
  return (
    <span className={`rc-price rc-price--${tone === "ok" ? "ok" : tone}`}>
      <span className="rc-price__main">
        {amount == null ? "Missing" : formatMoney(amount, currency)}
      </span>
      {sub ? <span className="rc-price__sub">{sub}</span> : null}
    </span>
  );
}

function Section({
  title,
  desc,
  action,
  children,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rc-section">
      <div className="rc-section__head">
        <div>
          <h2 className="rc-section__title">{title}</h2>
          {desc ? <p className="rc-section__desc">{desc}</p> : null}
        </div>
        {action}
      </div>
      <div className="rc-section__sheet">{children}</div>
    </section>
  );
}

function sheetCols(template: string): CSSProperties {
  return { ["--rc-cols" as string]: template };
}

export function RateCardDetailPage({
  cardId,
  startEditing = false,
  onBack,
}: {
  cardId: string;
  startEditing?: boolean;
  onBack: () => void;
}) {
  const seed = getDetailCard(cardId);
  const [draft, setDraft] = useState<RateCardDetail | null>(null);
  const card = draft?.id === cardId ? draft : seed ?? draft;
  const [page, setPage] = useState<DetailPageTab>("ratecard");
  const [seasonIdx, setSeasonIdx] = useState(0);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [editing, setEditing] = useState(startEditing);
  const [notesOpen, setNotesOpen] = useState(false);
  const seasonRef = useRef<HTMLDivElement>(null);

  const [quote, setQuote] = useState<QuoteInput>({
    checkIn: 7,
    nights: 3,
    roomIndex: 0,
    mealIndex: 1,
    adults: 2,
    rooms: 1,
    children: [],
  });

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (seasonRef.current && !seasonRef.current.contains(e.target as Node)) setSeasonOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!card) {
    return (
      <div className="rc-detail">
        <p>Rate card not found.</p>
        <Button variant="brand" size="sm" onClick={onBack}>
          Back to list
        </Button>
      </div>
    );
  }

  const unresolved = card.policies.filter((t) => t.status === "unresolved").length;
  const tabs: TabItem[] = [
    { id: "ratecard", label: "Rate card" },
    { id: "test", label: "Test rate" },
    { id: "policies", label: "Policies", count: unresolved || undefined },
    { id: "activity", label: "Activity" },
  ];

  const season = card.seasons[Math.min(seasonIdx, card.seasons.length - 1)];
  const quoteResult = runQuote(card, quote);

  const ensureDraft = () => {
    if (!draft || draft.id !== card.id) setDraft({ ...card, rooms: [...card.rooms], seasons: [...card.seasons] });
  };

  const renameCard = (name: string) => {
    ensureDraft();
    setDraft((d) => (d ? { ...d, name } : { ...card, name }));
  };

  return (
    <div className="rc-detail">
      <RecordHeader
        title={card.name}
        titleNode={
          editing ? (
            <input
              className="record-header__title"
              style={{
                width: "100%",
                maxWidth: 520,
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-md)",
                padding: "6px 12px",
                background: "var(--surface)",
                whiteSpace: "normal",
              }}
              value={card.name}
              onChange={(e) => renameCard(e.target.value)}
              aria-label="Rate card title"
            />
          ) : undefined
        }
        tags={<StatusChipWithDot tone={toneToStatus(card.tone)}>{card.state}</StatusChipWithDot>}
        date={
          <span className="record-header__date">
            <IconCalendar size={13} />
            {card.validity}
          </span>
        }
        recordId={card.ref}
        idTip="Rate card reference"
        metaExtra={
          <>
            <span className="record-header__sep" aria-hidden="true">
              ·
            </span>
            <span>{card.currency}</span>
          </>
        }
        aside={
          <>
            {editing ? (
              <Button variant="primary" size="sm" onClick={() => setEditing(false)}>
                Done
              </Button>
            ) : null}
            <IconButton label="Open notes" onClick={() => setNotesOpen(true)}>
              <IconNotes />
            </IconButton>
          </>
        }
      />

      <div className="rc-tabs">
        <TabBar
          items={tabs}
          value={page}
          onValueChange={(id) => setPage(id as DetailPageTab)}
          aria-label="Rate card sections"
        />
      </div>

      {page === "ratecard" ? (
        <div className="rc-ratecard">
          <div className="rc-season">
            <div className="rc-season__picker" ref={seasonRef}>
              <span className="rc-season__label">Season</span>
              <button
                type="button"
                className={`rc-season__btn${seasonOpen ? " rc-season__btn--open" : ""}`}
                onClick={() => setSeasonOpen((o) => !o)}
                aria-expanded={seasonOpen}
                aria-haspopup="listbox"
              >
                <span className="rc-season__value">
                  {season.name} · {season.dates} · {season.priority}
                </span>
                <IconChevronDown size={13} />
              </button>
              {seasonOpen ? (
                <div className="rc-season__menu" role="listbox">
                  {card.seasons.map((s, i) => (
                    <button
                      key={s.name}
                      type="button"
                      role="option"
                      aria-selected={i === seasonIdx}
                      className={`rc-season__option${i === seasonIdx ? " rc-season__option--on" : ""}`}
                      onClick={() => {
                        setSeasonIdx(i);
                        setSeasonOpen(false);
                      }}
                    >
                      <span className="rc-season__option-copy">
                        <span className="rc-season__option-name">{s.name}</span>
                        <span className="rc-season__option-dates">{s.dates}</span>
                      </span>
                      <StatusChip tone="open">{s.priority}</StatusChip>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="rc-season__actions">
              <Button variant="brand" size="sm" disabled={!editing}>
                Edit current season
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!editing}
                onClick={() => {
                  if (!editing) return;
                  ensureDraft();
                  setDraft((d) => {
                    const base = d ?? card;
                    return {
                      ...base,
                      seasons: [
                        ...base.seasons,
                        {
                          name: `Season ${base.seasons.length + 1}`,
                          colorToken: "accent",
                          dates: "Not set",
                          summary: "New range",
                          nights: 0,
                          priority: "Base",
                        },
                      ],
                    };
                  });
                  setSeasonIdx(card.seasons.length);
                }}
              >
                <IconPlus />
                Add season
              </Button>
            </div>
          </div>

          <Section title={catLabel(card, "accommodation", "Stay / product pricing")}>
            <DataSheet
              className="rc-sheet rc-sheet--pricing"
              style={sheetCols(
                `minmax(220px, 1.6fr) repeat(${card.meals.length}, minmax(130px, 1fr))`,
              )}
              aria-label={catLabel(card, "accommodation", "Stay / product pricing")}
            >
              <DataSheetHeader>
                <DataSheetCell>Room / product</DataSheetCell>
                {card.meals.map((m) => (
                  <DataSheetCell key={m.code}>{m.label}</DataSheetCell>
                ))}
              </DataSheetHeader>
              {card.rooms.map((room, ri) => (
                <DataSheetRow key={room.id}>
                  <DataSheetCell>
                    <div className="rc-sheet__lead">
                      <div className="rc-sheet__lead-title">{room.name}</div>
                      <div className="rc-sheet__lead-meta">
                        {room.note} · incl. {room.baseOccupancy} / max {room.maxOccupancy}
                      </div>
                    </div>
                  </DataSheetCell>
                  {card.meals.map((_, mi) => {
                    const amount = card.prices[ri]?.[mi]?.[seasonIdx] ?? null;
                    const weekend = card.weekendExtra?.[ri]?.[seasonIdx];
                    return (
                      <DataSheetCell key={`${room.id}-${mi}`}>
                        <PriceChip
                          amount={amount}
                          currency={card.currency}
                          taxConfirmed={card.taxConfirmed}
                          sub={
                            weekend != null && card.hasWeekendExtra
                              ? `+${formatMoney(weekend, card.currency)} Fri–Sat`
                              : undefined
                          }
                        />
                      </DataSheetCell>
                    );
                  })}
                </DataSheetRow>
              ))}
            </DataSheet>
          </Section>

          {card.guests.length > 0 ? (
            <Section title={catLabel(card, "guests", "Extra guest and bed charges")}>
              <DataSheet
                className="rc-sheet rc-sheet--guests"
                style={sheetCols(
                  "minmax(180px, 1.2fr) minmax(120px, 1fr) minmax(100px, 0.9fr) minmax(140px, 1.1fr) minmax(120px, 0.9fr) minmax(80px, 0.6fr)",
                )}
                aria-label={catLabel(card, "guests", "Extra guest and bed charges")}
              >
                <DataSheetHeader>
                  <DataSheetCell>Room</DataSheetCell>
                  <DataSheetCell>Guest</DataSheetCell>
                  <DataSheetCell>Age</DataSheetCell>
                  <DataSheetCell>Bed</DataSheetCell>
                  <DataSheetCell>Charge</DataSheetCell>
                  <DataSheetCell>Max</DataSheetCell>
                </DataSheetHeader>
                {card.guests.slice(0, 12).map((g, i) => {
                  const room = card.rooms.find((r) => r.id === g[0]);
                  return (
                    <DataSheetRow key={i}>
                      <DataSheetCell>
                        <LeadCell title={room?.name ?? g[0]} />
                      </DataSheetCell>
                      <DataSheetCell>
                        <span className="rc-sheet__text">{g[1]}</span>
                      </DataSheetCell>
                      <DataSheetCell>
                        <span className="rc-sheet__text">{g[2]}</span>
                      </DataSheetCell>
                      <DataSheetCell>
                        <span className="rc-sheet__text">{BED_LABEL[g[3]] ?? g[3]}</span>
                      </DataSheetCell>
                      <DataSheetCell>
                        <PriceChip
                          amount={g[5]}
                          currency={card.currency}
                          taxConfirmed={card.taxConfirmed}
                        />
                      </DataSheetCell>
                      <DataSheetCell>
                        <span className="pt-mono rc-sheet__max">{g[6]}</span>
                      </DataSheetCell>
                    </DataSheetRow>
                  );
                })}
              </DataSheet>
            </Section>
          ) : null}

          <Section title={catLabel(card, "special", "Supplements")}>
            <DataSheet
              className="rc-sheet rc-sheet--supplements"
              style={sheetCols(
                "minmax(200px, 1.5fr) minmax(160px, 1.2fr) minmax(120px, 0.9fr) minmax(120px, 0.9fr)",
              )}
              aria-label={catLabel(card, "special", "Supplements")}
            >
              <DataSheetHeader>
                <DataSheetCell>Supplement</DataSheetCell>
                <DataSheetCell>Applies</DataSheetCell>
                <DataSheetCell>Basis</DataSheetCell>
                <DataSheetCell>Amount</DataSheetCell>
              </DataSheetHeader>
              {card.supplements.length === 0 ? (
                <DataSheetRow>
                  <DataSheetCell>
                    <span className="rc-sheet__empty">No supplements on this card.</span>
                  </DataSheetCell>
                  <DataSheetCell />
                  <DataSheetCell />
                  <DataSheetCell />
                </DataSheetRow>
              ) : (
                card.supplements.map((s) => (
                  <DataSheetRow key={s.name}>
                    <DataSheetCell>
                      <div className="rc-sheet__lead">
                        <div className="rc-sheet__lead-title">{s.name}</div>
                        <div className="rc-sheet__lead-meta">{s.unit}</div>
                      </div>
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="rc-sheet__text">{s.applies}</span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <StatusChip tone={toneToStatus(s.tone)}>{s.basis}</StatusChip>
                    </DataSheetCell>
                    <DataSheetCell>
                      <PriceChip
                        amount={s.amount}
                        currency={card.currency}
                        taxConfirmed={card.taxConfirmed}
                      />
                    </DataSheetCell>
                  </DataSheetRow>
                ))
              )}
            </DataSheet>
          </Section>

          <Section title={catLabel(card, "activities", "Activities")}>
            <DataSheet
              className="rc-sheet rc-sheet--activities"
              style={sheetCols(
                "minmax(220px, 1.6fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(120px, 0.9fr)",
              )}
              aria-label={catLabel(card, "activities", "Activities")}
            >
              <DataSheetHeader>
                <DataSheetCell>Activity</DataSheetCell>
                <DataSheetCell>Group</DataSheetCell>
                <DataSheetCell>Basis</DataSheetCell>
                <DataSheetCell>Amount</DataSheetCell>
              </DataSheetHeader>
              {card.activities.length === 0 ? (
                <DataSheetRow>
                  <DataSheetCell>
                    <span className="rc-sheet__empty">No activities on this card.</span>
                  </DataSheetCell>
                  <DataSheetCell />
                  <DataSheetCell />
                  <DataSheetCell />
                </DataSheetRow>
              ) : (
                card.activities.map((a) => (
                  <DataSheetRow key={a.name}>
                    <DataSheetCell>
                      <div className="rc-sheet__lead">
                        <div className="rc-sheet__lead-title">{a.name}</div>
                        <div className="rc-sheet__lead-meta">{a.note}</div>
                      </div>
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="rc-sheet__text">{a.group}</span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="rc-sheet__text">{a.basis}</span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <PriceChip
                        amount={a.amount}
                        currency={card.currency}
                        taxConfirmed={card.taxConfirmed}
                      />
                    </DataSheetCell>
                  </DataSheetRow>
                ))
              )}
            </DataSheet>
          </Section>

          <Section title={catLabel(card, "services", "Services")}>
            <DataSheet
              className="rc-sheet rc-sheet--services"
              style={sheetCols(
                "minmax(220px, 1.6fr) minmax(140px, 1fr) minmax(120px, 1fr) minmax(120px, 0.9fr)",
              )}
              aria-label={catLabel(card, "services", "Services")}
            >
              <DataSheetHeader>
                <DataSheetCell>Service</DataSheetCell>
                <DataSheetCell>Applies</DataSheetCell>
                <DataSheetCell>Basis</DataSheetCell>
                <DataSheetCell>Amount</DataSheetCell>
              </DataSheetHeader>
              {card.services.length === 0 ? (
                <DataSheetRow>
                  <DataSheetCell>
                    <span className="rc-sheet__empty">No services on this card.</span>
                  </DataSheetCell>
                  <DataSheetCell />
                  <DataSheetCell />
                  <DataSheetCell />
                </DataSheetRow>
              ) : (
                card.services.map((s) => (
                  <DataSheetRow key={s.name}>
                    <DataSheetCell>
                      <div className="rc-sheet__lead">
                        <div className="rc-sheet__lead-title">{s.name}</div>
                        <div className="rc-sheet__lead-meta">{s.note}</div>
                      </div>
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="rc-sheet__text">{s.applies}</span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="rc-sheet__text">{s.basis}</span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <PriceChip
                        amount={s.amount}
                        currency={card.currency}
                        taxConfirmed={card.taxConfirmed}
                        sub={s.amount === 0 ? "Complimentary" : undefined}
                      />
                    </DataSheetCell>
                  </DataSheetRow>
                ))
              )}
            </DataSheet>
          </Section>
        </div>
      ) : null}

      {page === "test" ? (
        <div className="rc-test">
          <div className="rc-test__layout">
            <section className="rc-test__block" aria-labelledby="rc-test-inputs-title">
              <div className="rc-test__block-head">
                <div>
                  <p className="rc-test__eyebrow">Rate card · {card.ref}</p>
                  <h2 id="rc-test-inputs-title" className="rc-test__title">
                    Stay inputs
                  </h2>
                  <p className="rc-test__sub">
                    Runs against this card’s seasons, occupancy, and supplements.
                  </p>
                </div>
              </div>
              <div className="rc-test__block-body">
                <div className="rc-test__fields">
                  <div className="rc-test__field">
                    <label className="rc-test__label" htmlFor="rc-checkin">
                      Check-in
                    </label>
                    <select
                      id="rc-checkin"
                      className="rc-test__control"
                      value={quote.checkIn}
                      onChange={(e) => setQuote((q) => ({ ...q, checkIn: Number(e.target.value) }))}
                    >
                      {TEST_DATES.map(([label], i) => (
                        <option key={label} value={i}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rc-test__field">
                    <label className="rc-test__label" htmlFor="rc-nights">
                      Nights
                    </label>
                    <input
                      id="rc-nights"
                      className="rc-test__control"
                      type="number"
                      min={1}
                      max={10}
                      value={quote.nights}
                      onChange={(e) =>
                        setQuote((q) => ({ ...q, nights: Number(e.target.value) || 1 }))
                      }
                    />
                  </div>
                  <div className="rc-test__field">
                    <label className="rc-test__label" htmlFor="rc-room">
                      Room / product
                    </label>
                    <select
                      id="rc-room"
                      className="rc-test__control"
                      value={quote.roomIndex}
                      onChange={(e) =>
                        setQuote((q) => ({ ...q, roomIndex: Number(e.target.value) }))
                      }
                    >
                      {card.rooms.map((r, i) => (
                        <option key={r.id} value={i}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rc-test__field">
                    <label className="rc-test__label" htmlFor="rc-meal">
                      {card.mealLabel}
                    </label>
                    <select
                      id="rc-meal"
                      className="rc-test__control"
                      value={quote.mealIndex}
                      onChange={(e) =>
                        setQuote((q) => ({ ...q, mealIndex: Number(e.target.value) }))
                      }
                    >
                      {card.meals.map((m, i) => (
                        <option key={m.code} value={i}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rc-test__field">
                    <label className="rc-test__label" htmlFor="rc-adults">
                      Adults
                    </label>
                    <input
                      id="rc-adults"
                      className="rc-test__control"
                      type="number"
                      min={1}
                      value={quote.adults}
                      onChange={(e) =>
                        setQuote((q) => ({ ...q, adults: Number(e.target.value) || 1 }))
                      }
                    />
                  </div>
                  <div className="rc-test__field">
                    <label className="rc-test__label" htmlFor="rc-rooms">
                      Rooms
                    </label>
                    <input
                      id="rc-rooms"
                      className="rc-test__control"
                      type="number"
                      min={1}
                      value={quote.rooms}
                      onChange={(e) =>
                        setQuote((q) => ({ ...q, rooms: Number(e.target.value) || 1 }))
                      }
                    />
                  </div>
                </div>
                <p className="rc-test__note">
                  Quote updates live. Unpriced nights and blackouts block the stay — rates never
                  roll forward from another season.
                </p>
              </div>
            </section>

            <section className="rc-test__block rc-test__block--quote" aria-labelledby="rc-test-quote-title">
              <div className="rc-test__block-head">
                <div>
                  <p className="rc-test__eyebrow">Live quote</p>
                  <h2 id="rc-test-quote-title" className="rc-test__title">
                    Quote
                  </h2>
                  <p className="rc-test__sub">{quoteResult.nightsLabel}</p>
                </div>
                <div className="rc-test__total" aria-live="polite">
                  <span className="rc-test__total-label">{quoteResult.totalLabel}</span>
                  <span className="rc-test__total-value">
                    {quoteResult.total == null
                      ? "—"
                      : formatMoney(quoteResult.total, card.currency)}
                  </span>
                  <span className="rc-test__total-note">{quoteResult.totalNote}</span>
                </div>
              </div>

              <div className="rc-test__block-body">
                {quoteResult.blocker ? (
                  <div className="rc-test__blocker" role="alert">
                    <StatusChip tone="blocked">Blocked</StatusChip>
                    <span>{quoteResult.blocker}</span>
                  </div>
                ) : null}

                <div className="rc-test__lines" aria-label="Quote buildup">
                  {quoteResult.lines.map((line, i) => (
                    <div
                      key={i}
                      className={`rc-test__line${line.emphasis ? " rc-test__line--emphasis" : ""}`}
                    >
                      <div className="rc-test__line-copy">
                        <div className="rc-test__line-label">{line.label}</div>
                        {line.note ? <div className="rc-test__line-note">{line.note}</div> : null}
                      </div>
                      <div className="rc-test__line-amount pt-mono">
                        {line.amount == null ? "—" : formatMoney(line.amount, card.currency)}
                      </div>
                    </div>
                  ))}
                </div>

                {quoteResult.trace.length > 0 ? (
                  <div className="rc-test__trace">
                    <h3 className="rc-test__trace-title">Engine trace</h3>
                    <ol className="rc-test__trace-list">
                      {quoteResult.trace.map((t, i) => (
                        <li key={i} className="rc-test__trace-item">
                          <span className="rc-test__trace-n" aria-hidden="true">
                            {i + 1}
                          </span>
                          <div>
                            <div className="rc-test__trace-step">{t.step}</div>
                            <div className="rc-test__trace-detail">{t.detail}</div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {page === "policies" ? <PoliciesPanel policies={card.policies} /> : null}

      {page === "activity" ? (
        <ActivityPanel
          rows={activityFromEvents(card.activity)}
          searchPlaceholder="Search rate card activity"
        />
      ) : null}

      {notesOpen ? (
        <aside className="rc-notes" aria-label="Rate card notes">
          <div className="rc-notes__head">
            <div>
              <h2 className="rc-card__title">Rate card notes</h2>
              <p className="rc-card__sub">{card.notes.length} notes</p>
            </div>
            <IconButton label="Close notes" onClick={() => setNotesOpen(false)}>
              <IconClose />
            </IconButton>
          </div>
          <div className="rc-notes__list">
            {card.notes.length === 0 ? (
              <p className="rc-matrix__meta">No notes yet.</p>
            ) : (
              card.notes.map((n, i) => (
                <article key={i} className="rc-note">
                  <p className="rc-note__body">{n.body}</p>
                  <p className="rc-note__meta">
                    {n.author} · {n.when}
                  </p>
                </article>
              ))
            )}
          </div>
          <div style={{ padding: "14px 18px", borderTop: "1px solid var(--line)" }}>
            <Button variant="primary" size="sm">
              <IconPlus />
              Write note
            </Button>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

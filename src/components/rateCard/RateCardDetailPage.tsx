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
import { runQuote, DEFAULT_QUOTE, type QuoteInput } from "../../rateCard/engine";
import {
  TEST_DATES,
  type CardTone,
  type DetailPageTab,
  type RateCardDetail,
  type Season,
} from "../../rateCard/types";
import {
  IconBed,
  IconBookmark,
  IconCalendar,
  IconCamera,
  IconCard,
  IconChevronDown,
  IconClose,
  IconHotel,
  IconNotes,
  IconPencil,
  IconPin,
  IconPlus,
  IconUser,
} from "../../icons";
import { RecordHeader } from "../RecordHeader";
import { StatusChipWithDot } from "../StatusChipWithDot";
import { ActivityPanel } from "../ActivityPanel";
import { activityFromEvents } from "../activityFromEvents";
import { PoliciesPanel } from "./PoliciesPanel";
import { SeasonEditorModal, type SeasonDraft } from "./SeasonEditorModal";
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
  editing,
  onChange,
}: {
  amount: number | null;
  currency: string;
  taxConfirmed: boolean;
  sub?: string;
  editing?: boolean;
  onChange?: (next: number | null) => void;
}) {
  const tone = priceTone(amount, taxConfirmed);
  if (editing && onChange) {
    return (
      <label className={`rc-price rc-price--edit rc-price--${tone === "ok" ? "ok" : tone}`}>
        <input
          className="rc-price__input"
          type="text"
          inputMode="numeric"
          placeholder="Missing"
          aria-label="Rate amount"
          value={amount == null ? "" : String(amount)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, "");
            onChange(raw === "" ? null : Number(raw));
          }}
        />
        {sub ? <span className="rc-price__sub">{sub}</span> : null}
      </label>
    );
  }
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

function CellIcon({
  icon,
  children,
  className = "",
}: {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`rc-sheet__icon-cell${className ? ` ${className}` : ""}`}>
      <span className="rc-sheet__icon-cell-glyph" aria-hidden="true">
        {icon}
      </span>
      <span className="rc-sheet__icon-cell-text">{children}</span>
    </span>
  );
}

export function RateCardDetailPage({
  cardId,
  seedCard,
  startEditing = false,
  onBack,
  onOpenNotes,
  onDraftChange,
}: {
  cardId: string;
  /** Prefers this over the seed catalog — used for newly created drafts. */
  seedCard?: RateCardDetail;
  startEditing?: boolean;
  onBack: () => void;
  /** Opens the global sidebar notes panel for this rate card. */
  onOpenNotes?: () => void;
  /** Called whenever local draft changes (keeps App draft in sync). */
  onDraftChange?: (card: RateCardDetail) => void;
}) {
  const catalog = getDetailCard(cardId);
  const seed = seedCard ?? catalog;
  const [draft, setDraft] = useState<RateCardDetail | null>(() =>
    startEditing && seed ? structuredClone(seed) : null,
  );
  const card = draft?.id === (seed?.id ?? cardId) ? draft : seed ?? draft;
  const [page, setPage] = useState<DetailPageTab>("ratecard");
  const [seasonIdx, setSeasonIdx] = useState(0);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [editing, setEditing] = useState(startEditing);
  const [markupEditing, setMarkupEditing] = useState(false);
  const [markupDraft, setMarkupDraft] = useState("15");
  const [seasonModal, setSeasonModal] = useState<SeasonDraft | null>(null);
  const seasonRef = useRef<HTMLDivElement>(null);
  const markupInputRef = useRef<HTMLInputElement>(null);

  const [quote, setQuote] = useState<QuoteInput>({ ...DEFAULT_QUOTE });

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (seasonRef.current && !seasonRef.current.contains(e.target as Node)) setSeasonOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!editing && markupEditing) setMarkupEditing(false);
  }, [editing, markupEditing]);

  useEffect(() => {
    if (markupEditing) markupInputRef.current?.focus();
  }, [markupEditing]);

  const commitDraft = (next: RateCardDetail) => {
    setDraft(next);
    onDraftChange?.(next);
  };

  const updateCard = (fn: (c: RateCardDetail) => RateCardDetail) => {
    const base = draft?.id === (seed?.id ?? cardId) && draft ? draft : seed;
    if (!base) return;
    commitDraft(fn(structuredClone(base)));
  };

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

  const season = card.seasons[Math.min(seasonIdx, Math.max(0, card.seasons.length - 1))];
  const quoteResult = runQuote(card, quote);

  const beginMarkupEdit = () => {
    if (!editing) return;
    setMarkupDraft(String(card.markupPercent));
    setMarkupEditing(true);
  };

  const cancelMarkupEdit = () => {
    setMarkupEditing(false);
    setMarkupDraft(String(card.markupPercent));
  };

  const saveMarkup = () => {
    const next = Number(markupDraft);
    if (Number.isNaN(next)) {
      cancelMarkupEdit();
      return;
    }
    const clamped = Math.min(100, Math.max(0, Math.round(next * 10) / 10));
    updateCard((base) => ({ ...base, markupPercent: clamped }));
    setMarkupDraft(String(clamped));
    setMarkupEditing(false);
  };

  const renameCard = (name: string) => {
    updateCard((base) => ({ ...base, name }));
  };

  const setPrice = (roomIdx: number, mealIdx: number, value: number | null) => {
    updateCard((base) => {
      const prices = structuredClone(base.prices);
      while (prices.length <= roomIdx) {
        prices.push(base.meals.map(() => base.seasons.map(() => null as number | null)));
      }
      while (prices[roomIdx].length <= mealIdx) {
        prices[roomIdx].push(base.seasons.map(() => null as number | null));
      }
      while (prices[roomIdx][mealIdx].length <= seasonIdx) {
        prices[roomIdx][mealIdx].push(null);
      }
      prices[roomIdx][mealIdx][seasonIdx] = value;
      return { ...base, prices };
    });
  };

  const openEditSeason = () => {
    if (!editing || !season) return;
    setSeasonModal({
      mode: "edit",
      index: seasonIdx,
      name: season.name,
      priority: season.priority === "Overrides base" ? "Override" : "Base",
      ranges: [{ start: "", end: "" }],
    });
  };

  const openAddSeason = () => {
    if (!editing) return;
    setSeasonModal({
      mode: "add",
      name: "",
      priority: "Base",
      ranges: [{ start: "", end: "" }],
    });
  };

  const saveSeason = (nextSeason: Season, mode: "add" | "edit", index?: number) => {
    updateCard((base) => {
      if (mode === "edit" && index != null) {
        const seasons = base.seasons.map((s, i) => (i === index ? nextSeason : s));
        return { ...base, seasons };
      }
      const seasons = [...base.seasons, nextSeason];
      const prices = base.prices.map((room) => room.map((meal) => [...meal, null]));
      const weekendExtra = base.weekendExtra?.map((room) => [...room, null]);
      return { ...base, seasons, prices, weekendExtra };
    });
    if (mode === "add") setSeasonIdx(card.seasons.length);
    setSeasonModal(null);
  };

  const addRoom = () => {
    if (!editing) return;
    updateCard((base) => {
      const n = base.rooms.length + 1;
      const id = `room-${Date.now().toString(36)}`;
      const rooms = [
        ...base.rooms,
        {
          id,
          name: `Room ${n}`,
          note: "Add detail",
          baseOccupancy: 2,
          maxOccupancy: 3,
          maxBeds: 1,
        },
      ];
      const prices = [
        ...base.prices,
        base.meals.map(() => base.seasons.map(() => null as number | null)),
      ];
      const weekendExtra = base.weekendExtra
        ? [...base.weekendExtra, base.seasons.map(() => null as number | null)]
        : base.weekendExtra;
      return { ...base, rooms, prices, weekendExtra };
    });
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
            <span>{card.vendor}</span>
            <span className="record-header__sep" aria-hidden="true">
              ·
            </span>
            <span>{card.currency}</span>
          </>
        }
        aside={
          <div className="rc-record-acts">
            <IconButton
              label="Rate card notes"
              onClick={() => onOpenNotes?.()}
            >
              <IconNotes />
            </IconButton>
            {editing ? (
              <Button variant="primary" size="sm" onClick={() => setEditing(false)}>
                Done
              </Button>
            ) : (
              <IconButton label="Edit rate card" onClick={() => setEditing(true)}>
                <IconPencil />
              </IconButton>
            )}
          </div>
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
                  <IconCalendar size={13} />
                  {season
                    ? `${season.name} · ${season.dates} · ${season.priority}`
                    : "No seasons yet"}
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
              <Button
                variant="brand"
                size="sm"
                disabled={!editing}
                onClick={openEditSeason}
              >
                Edit current season
              </Button>
              <Button variant="primary" size="sm" disabled={!editing} onClick={openAddSeason}>
                <IconPlus />
                Add season
              </Button>
            </div>
          </div>

          <section className="rc-markup" aria-labelledby="rc-markup-title">
            <h2 id="rc-markup-title" className="rc-markup__title">
              Markup
            </h2>
            <div className="rc-markup__aside">
              {markupEditing ? (
                <>
                  <div className="rc-markup__field">
                    <label className="rc-markup__label" htmlFor="rc-markup-pct">
                      Markup
                    </label>
                    <div className="rc-markup__control">
                      <input
                        ref={markupInputRef}
                        id="rc-markup-pct"
                        className="rc-markup__input"
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        inputMode="decimal"
                        value={markupDraft}
                        onChange={(e) => setMarkupDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveMarkup();
                          }
                          if (e.key === "Escape") {
                            e.preventDefault();
                            cancelMarkupEdit();
                          }
                        }}
                      />
                      <span className="rc-markup__suffix" aria-hidden="true">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="rc-markup__actions">
                    <Button variant="brand" size="sm" onClick={cancelMarkupEdit}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={saveMarkup}>
                      Save
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="rc-markup__value" aria-live="polite">
                    <span className="rc-markup__value-num pt-mono">{card.markupPercent}</span>
                    <span className="rc-markup__value-unit">%</span>
                  </div>
                  <Button
                    variant="brand"
                    size="sm"
                    disabled={!editing}
                    onClick={beginMarkupEdit}
                  >
                    <IconPencil />
                    Edit
                  </Button>
                </>
              )}
            </div>
          </section>

          <Section
            title={catLabel(card, "accommodation", "Stay / product pricing")}
            action={
              editing ? (
                <Button variant="brand" size="sm" onClick={addRoom}>
                  <IconPlus />
                  Add room
                </Button>
              ) : undefined
            }
          >
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
                    <LeadCell
                      align="start"
                      icon={<IconBed size={15} />}
                      title={room.name}
                      subtitle={`${room.note} · incl. ${room.baseOccupancy} / max ${room.maxOccupancy}`}
                    />
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
                          editing={editing}
                          onChange={(next) => setPrice(ri, mi, next)}
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
                        <LeadCell icon={<IconHotel size={15} />} title={room?.name ?? g[0]} />
                      </DataSheetCell>
                      <DataSheetCell>
                        <CellIcon icon={<IconUser size={13} />}>{g[1]}</CellIcon>
                      </DataSheetCell>
                      <DataSheetCell>
                        <CellIcon icon={<IconCalendar size={13} />}>{g[2]}</CellIcon>
                      </DataSheetCell>
                      <DataSheetCell>
                        <CellIcon icon={<IconBed size={13} />}>
                          {BED_LABEL[g[3]] ?? g[3]}
                        </CellIcon>
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
                      <LeadCell
                        align="start"
                        icon={<IconCard size={15} />}
                        title={s.name}
                        subtitle={s.unit}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <CellIcon icon={<IconCalendar size={13} />}>{s.applies}</CellIcon>
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
                      <LeadCell
                        align="start"
                        icon={<IconCamera size={15} />}
                        title={a.name}
                        subtitle={a.note}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <CellIcon icon={<IconPin size={13} />}>{a.group}</CellIcon>
                    </DataSheetCell>
                    <DataSheetCell>
                      <CellIcon icon={<IconBookmark size={12} />}>{a.basis}</CellIcon>
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
                      <LeadCell
                        align="start"
                        icon={<IconPin size={15} />}
                        title={s.name}
                        subtitle={s.note}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <CellIcon icon={<IconCalendar size={13} />}>{s.applies}</CellIcon>
                    </DataSheetCell>
                    <DataSheetCell>
                      <CellIcon icon={<IconBookmark size={12} />}>{s.basis}</CellIcon>
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
                    Quote recalculates from this card’s seasons, weekend extras, occupancy, and guest bands.
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
                      max={14}
                      value={quote.nights}
                      onChange={(e) =>
                        setQuote((q) => ({ ...q, nights: Number(e.target.value) || 1 }))
                      }
                    />
                  </div>
                  <div className="rc-test__field">
                    <label className="rc-test__label" htmlFor="rc-room">
                      Room type
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
                          {m.code} — {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="rc-test__travellers">
                  <div className="rc-test__travellers-head">
                    <span className="rc-test__travellers-label">Travellers</span>
                    <span className="rc-test__pax">{quoteResult.paxSummary}</span>
                  </div>

                  <div className="rc-test__fields rc-test__fields--2">
                    <div className="rc-test__field">
                      <label className="rc-test__label" htmlFor="rc-adults">
                        Adults
                      </label>
                      <select
                        id="rc-adults"
                        className="rc-test__control"
                        value={quote.adults}
                        onChange={(e) =>
                          setQuote((q) => ({ ...q, adults: Number(e.target.value) || 1 }))
                        }
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="rc-test__field">
                      <label className="rc-test__label" htmlFor="rc-rooms">
                        Rooms
                      </label>
                      <select
                        id="rc-rooms"
                        className="rc-test__control"
                        value={quote.rooms}
                        onChange={(e) =>
                          setQuote((q) => ({ ...q, rooms: Number(e.target.value) || 1 }))
                        }
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="rc-test__children">
                    {quote.children.map((ch, i) => (
                      <div key={i} className="rc-test__child-row">
                        <span className="rc-test__child-label">Child {i + 1}</span>
                        <select
                          className="rc-test__control rc-test__control--sm"
                          aria-label={`Child ${i + 1} age`}
                          value={ch.age}
                          onChange={(e) => {
                            const age = Number(e.target.value);
                            setQuote((q) => ({
                              ...q,
                              children: q.children.map((c, j) => (j === i ? { ...c, age } : c)),
                            }));
                          }}
                        >
                          {Array.from({ length: 17 }, (_, a) => (
                            <option key={a} value={a}>
                              {a} yrs
                            </option>
                          ))}
                        </select>
                        <select
                          className="rc-test__control rc-test__control--sm"
                          aria-label={`Child ${i + 1} extra bed`}
                          value={ch.bed}
                          onChange={(e) => {
                            const bed = e.target.value as "yes" | "no";
                            setQuote((q) => ({
                              ...q,
                              children: q.children.map((c, j) => (j === i ? { ...c, bed } : c)),
                            }));
                          }}
                        >
                          <option value="no">No extra bed</option>
                          <option value="yes">With extra bed</option>
                        </select>
                        <button
                          type="button"
                          className="rc-test__child-remove"
                          aria-label={`Remove child ${i + 1}`}
                          onClick={() =>
                            setQuote((q) => ({
                              ...q,
                              children: q.children.filter((_, j) => j !== i),
                            }))
                          }
                        >
                          <IconClose size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="rc-test__add-child"
                      onClick={() =>
                        setQuote((q) => ({
                          ...q,
                          children: [...q.children, { age: 8, bed: "no" }],
                        }))
                      }
                    >
                      <IconPlus />
                      Add child
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="rc-test__reset"
                  onClick={() => setQuote({ ...DEFAULT_QUOTE })}
                >
                  Reset to defaults
                </button>

                <p className="rc-test__note">
                  Nights are consecutive from check-in. Weekend flat extras apply on Sat/Sun. Child
                  charges use age and bed bands from Extra guest charges — they never stack with an
                  extra-adult charge on the same guest.
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

                <div className="rc-test__nights" aria-label="Night-by-night resolution">
                  <div className="rc-test__nights-head">
                    <span>Night</span>
                    <span>Price set</span>
                    <span>Rule</span>
                    <span>Room</span>
                    <span>Guests</span>
                  </div>
                  {quoteResult.nights.map((n) => (
                    <div key={n.date} className="rc-test__nights-row">
                      <span className="rc-test__nights-date">{n.date}</span>
                      <span className="rc-test__nights-season">
                        <StatusChipWithDot
                          tone={
                            n.ruleTone === "danger"
                              ? "blocked"
                              : n.season.toLowerCase().includes("peak")
                                ? "progress"
                                : "done"
                          }
                        >
                          {n.season}
                        </StatusChipWithDot>
                      </span>
                      <span>
                        <StatusChip
                          tone={
                            n.ruleTone === "danger"
                              ? "blocked"
                              : n.ruleTone === "weekend"
                                ? "open"
                                : n.ruleTone === "warn"
                                  ? "progress"
                                  : "open"
                          }
                        >
                          {n.rule}
                        </StatusChip>
                      </span>
                      <span className="pt-mono">
                        {n.roomAmount == null ? "—" : formatMoney(n.roomAmount, card.currency)}
                      </span>
                      <span className="pt-mono">
                        {n.guestAmount === 0 ? "—" : formatMoney(n.guestAmount, card.currency)}
                      </span>
                    </div>
                  ))}
                </div>

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
                        {line.label === "Tax" && line.amount === 0
                          ? "—"
                          : line.amount == null
                            ? "—"
                            : formatMoney(line.amount, card.currency)}
                      </div>
                    </div>
                  ))}
                </div>
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

      <SeasonEditorModal
        open={Boolean(seasonModal)}
        draft={seasonModal}
        onChange={setSeasonModal}
        onClose={() => setSeasonModal(null)}
        onSave={saveSeason}
      />
    </div>
  );
}

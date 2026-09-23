import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  LeadCell,
  Pagination,
  SearchField,
  StackCell,
  StackLine,
  type CheckboxState,
} from "@paryatech/design-system";
import { DashboardDataSheetFill } from "./DashboardDataSheet";
import {
  IconBookings,
  IconBriefcase,
  IconCalendar,
  IconCard,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconFile,
  IconFinance,
  IconImport,
  IconMail,
  IconModule,
  IconPackages,
  IconTasks,
  IconVendors,
} from "../icons";
import "./ActivityPanel.css";

export type ActivityRow = {
  id: string;
  date: string;
  time: string;
  member: string;
  role: string;
  initials: string;
  avatarTone: "pink" | "default" | "warn" | "channel";
  event: string;
  module: string;
};

function ActivityModuleIcon({ module, size = 15 }: { module: string; size?: number }) {
  const key = module.trim().toLowerCase();

  if (key.includes("communication")) return <IconMail size={size} />;
  if (key.includes("service")) return <IconBriefcase size={size} />;
  if (key.includes("vendor")) return <IconVendors size={size} />;
  if (key.includes("booking")) return <IconBookings size={size} />;
  if (key.includes("finance")) return <IconFinance size={size} />;
  if (key.includes("doc") || key.includes("source")) return <IconFile size={size} />;
  if (key.includes("package")) return <IconPackages size={size} />;
  if (key.includes("task")) return <IconTasks size={size} />;
  if (key.includes("rate") || key === "card") return <IconCard size={size} />;
  if (key.includes("rule") || key.includes("season")) return <IconCalendar size={size} />;

  return <IconModule size={size} />;
}

export function ActivityPanel({
  rows,
  searchPlaceholder = "Search event, member or module",
  ariaLabel = "Activity",
}: {
  rows: ActivityRow[];
  searchPlaceholder?: string;
  ariaLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [module, setModule] = useState<string>("All modules");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) setFilterOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [filterOpen]);

  const modules = useMemo(() => {
    const set = new Set(rows.map((r) => r.module));
    return ["All modules", ...[...set].sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (module !== "All modules" && r.module !== module) return false;
      if (!q) return true;
      return (
        r.event.toLowerCase().includes(q) ||
        r.member.toLowerCase().includes(q) ||
        r.module.toLowerCase().includes(q)
      );
    });
  }, [rows, query, module]);

  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === filtered.length && filtered.length > 0
        ? "on"
        : "indeterminate";

  return (
    <div className="act dashboard-table-panel">
      <div className="act-toolbar">
        <SearchField
          fullWidth
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
            setSelected([]);
          }}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
        <div className={`act-filter${filterOpen ? " is-open" : ""}`} ref={filterRef}>
          <button
            type="button"
            className="act-filter__trigger"
            aria-label={`Filter by module: ${module}`}
            aria-haspopup="menu"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((open) => !open)}
          >
            <ActivityModuleIcon module={module} />
            <span>{module}</span>
            <IconChevronDown size={14} />
          </button>
          {filterOpen ? (
            <div className="act-filter__menu" role="menu" aria-label="Filter activity by module">
              {modules.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="menuitemradio"
                  aria-checked={module === item}
                  className={module === item ? "is-selected" : undefined}
                  onClick={() => {
                    setModule(item);
                    setPage(1);
                    setSelected([]);
                    setFilterOpen(false);
                  }}
                >
                  <span className="act-filter__option-label">
                    <ActivityModuleIcon module={item} />
                    <span>{item}</span>
                  </span>
                  {module === item ? <IconCheck size={14} /> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="act-sheet-wrap dashboard-table-end">
        <DataSheet className="act-sheet" aria-label={ariaLabel}>
          <DataSheetHeader>
            <DataSheetCell check>
              <Checkbox
                state={headerState}
                label="Select all activity"
                onCheckedChange={(state) => {
                  if (state === "on") setSelected(filtered.map((r) => r.id));
                  else setSelected([]);
                }}
              />
            </DataSheetCell>
            <DataSheetCell>When</DataSheetCell>
            <DataSheetCell>Member</DataSheetCell>
            <DataSheetCell>Event</DataSheetCell>
            <DataSheetCell>Module</DataSheetCell>
          </DataSheetHeader>

          {filtered.length === 0 ? (
            <DataSheetRow>
              <DataSheetCell className="act-empty-cell">No activity matches this search.</DataSheetCell>
            </DataSheetRow>
          ) : (
            filtered.map((r) => (
              <DataSheetRow key={r.id}>
                <DataSheetCell check>
                  <Checkbox
                    state={selected.includes(r.id) ? "on" : "off"}
                    label={`Select ${r.event}`}
                    onCheckedChange={(state) => {
                      setSelected((cur) =>
                        state === "on" ? [...cur, r.id] : cur.filter((id) => id !== r.id),
                      );
                    }}
                  />
                </DataSheetCell>
                <DataSheetCell>
                  <StackCell>
                    <StackLine mono icon={<IconCalendar size={13} />}>
                      {r.date}
                    </StackLine>
                    <StackLine muted mono icon={<IconClock />}>
                      {r.time}
                    </StackLine>
                  </StackCell>
                </DataSheetCell>
                <DataSheetCell>
                  <div className="act-member">
                    <Avatar tone={r.avatarTone === "pink" ? "pink" : "default"} size={28}>
                      {r.initials}
                    </Avatar>
                    <div className="act-member__text">
                      <div className="act-member__name">{r.member}</div>
                      <div className="act-member__role">{r.role}</div>
                    </div>
                  </div>
                </DataSheetCell>
                <DataSheetCell>
                  <span className="act-event" title={r.event}>
                    {r.event}
                  </span>
                </DataSheetCell>
                <DataSheetCell>
                  <LeadCell
                    align="start"
                    icon={<ActivityModuleIcon module={r.module} />}
                    title={<span className="act-module-label">{r.module}</span>}
                  />
                </DataSheetCell>
              </DataSheetRow>
            ))
          )}
          <DashboardDataSheetFill columns={5} />
        </DataSheet>

        {selected.length > 0 ? (
          <div className="act-bulk">
            <span>
              {selected.length} event{selected.length === 1 ? "" : "s"} selected
            </span>
            <div className="act-bulk__acts">
              <Button variant="brand" size="sm">
                <IconImport />
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                Clear
              </Button>
            </div>
          </div>
        ) : null}

        <Pagination
          rangeLabel={`Showing 1–${filtered.length} of ${filtered.length}`}
          page={page}
          pageCount={1}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

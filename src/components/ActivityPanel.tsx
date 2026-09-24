import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
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
  context?: string;
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
  searchPlaceholder = "Search activity",
  ariaLabel = "Activity",
}: {
  rows: ActivityRow[];
  searchPlaceholder?: string;
  ariaLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (!q) return true;
      return (
        r.event.toLowerCase().includes(q) ||
        r.member.toLowerCase().includes(q) ||
        r.module.toLowerCase().includes(q) ||
        r.context?.toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

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
            <DataSheetCell>Date</DataSheetCell>
            <DataSheetCell>Event</DataSheetCell>
            <DataSheetCell>Member</DataSheetCell>
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
                  <div className="act-event">
                    <span className="act-event__title" title={r.event}>
                      {r.event}
                    </span>
                    <span className="act-event__context">
                      <ActivityModuleIcon module={r.module} size={13} />
                      {r.context ?? r.module}
                    </span>
                  </div>
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
              </DataSheetRow>
            ))
          )}
          <DashboardDataSheetFill columns={4} />
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

import { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  EmptyState,
  IconButton,
  LeadCell,
  Pagination,
  SearchField,
  TabBar,
  Tooltip,
  type CheckboxState,
  type TabItem,
} from "@paryatech/design-system";
import {
  RATE_CARDS,
  STATUS_LABEL,
  STATUS_TONE,
} from "../data/rateCards";
import { getVendor, vendorIdea, type Vendor } from "../data/vendors";
import { can, type OrgRole } from "../permissions";
import { IconCalendar, IconFilter, IconImport, IconPin, IconPlus, IconRefresh } from "../icons";
import { CommunicationPanel } from "./CommunicationPanel";
import { RateCardCoverageCell, RateCardValidityCell } from "./rateCardCells";
import { PackagesPanel } from "./PackagesPanel";
import { ServicesPanel } from "./ServicesPanel";
import { StatusChipWithDot } from "./StatusChipWithDot";
import { TasksPanel } from "./TasksPanel";
import { VendorFinancePanel } from "./VendorFinancePanel";
import { VendorFormModal } from "./VendorFormModal";
import { VendorOverview } from "./VendorOverview";
import { VendorProfileHeader } from "./VendorProfileHeader";
import "./VendorRateCardsPage.css";

const TABS: TabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Services", count: 3 },
  { id: "rate-cards", label: "Rate cards", count: 1 },
  { id: "packages", label: "Packages", count: 2 },
  { id: "finance", label: "Finance & docs", count: 2 },
  { id: "tasks", label: "Tasks", count: 5 },
  { id: "comms", label: "Communications", count: 2 },
];

export function VendorRateCardsPage({
  vendorId,
  vendors,
  orgRole,
  flash,
  onClearFlash,
  onOpenCard,
  onNewCard,
  onVendorsChange,
  onOpenVendor,
}: {
  vendorId: string;
  vendors: Vendor[];
  orgRole: OrgRole;
  flash?: string | null;
  onClearFlash?: () => void;
  onOpenCard: (id: string) => void;
  onNewCard?: () => void;
  onVendorsChange: (next: Vendor[]) => void;
  onOpenVendor: (id: string) => void;
}) {
  const vendor = getVendor(vendorId, vendors) ?? getVendor("exhosp", vendors)!;
  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const canEdit = can(orgRole, "vendor.edit");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return RATE_CARDS;
    return RATE_CARDS.filter(
      (card) =>
        card.title.toLowerCase().includes(q) ||
        card.property.toLowerCase().includes(q) ||
        card.category.toLowerCase().includes(q),
    );
  }, [query]);

  const headerState: CheckboxState =
    selected.length === 0 ? "off" : selected.length === filtered.length && filtered.length > 0 ? "on" : "indeterminate";

  const toggleAll = (state: CheckboxState) => {
    if (state === "on") setSelected(filtered.map((card) => card.id));
    else setSelected([]);
  };

  const toggleRow = (id: string, state: CheckboxState) => {
    setSelected((current) => {
      if (state === "on") return current.includes(id) ? current : [...current, id];
      return current.filter((item) => item !== id);
    });
  };

  return (
    <div className="vendor-page">
      <VendorProfileHeader
        code={vendor.code}
        location={vendor.location}
        name={vendor.name}
        idea={vendorIdea(vendor)}
        status={vendor.status}
        ownerName={vendor.owner}
        ownerRole="Owner · Vendor desk"
        ownerInitials={vendor.ownerInitials}
        canEdit={canEdit}
        onEdit={() => setEditOpen(true)}
      />

      <div className="vendor-page__tabs">
        <TabBar items={TABS} value={tab} onValueChange={setTab} aria-label="Vendor sections" />
      </div>

      {tab === "overview" ? (
        <VendorOverview
          vendor={vendor}
          flash={flash}
          canEdit={canEdit}
          onJumpTab={(next) => {
            onClearFlash?.();
            setTab(next);
          }}
          onEditProfile={() => setEditOpen(true)}
        />
      ) : tab === "services" ? (
        <ServicesPanel />
      ) : tab === "packages" ? (
        <PackagesPanel />
      ) : tab === "finance" ? (
        <VendorFinancePanel />
      ) : tab === "tasks" ? (
        <TasksPanel />
      ) : tab === "comms" ? (
        <CommunicationPanel linkLabel="linked to this vendor" />
      ) : tab !== "rate-cards" ? (
        <EmptyState
          title="Nothing in this section yet"
          description="This trial recreates Overview, Services, Packages, Finance & docs, Tasks, and Rate cards."
        />
      ) : (
        <>
          <div className="vendor-page__toolbar">
            <SearchField
              fullWidth
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
                setSelected([]);
              }}
              placeholder="Search card name or property"
              aria-label="Search card name or property"
            />
            <div className="vendor-page__tools">
              <Tooltip tip="Filter">
                <IconButton label="Filter">
                  <IconFilter />
                </IconButton>
              </Tooltip>
              <Tooltip tip="Stay dates">
                <IconButton label="Stay dates">
                  <IconCalendar />
                </IconButton>
              </Tooltip>
              <Tooltip tip="Refresh">
                <IconButton label="Refresh">
                  <IconRefresh size={16} />
                </IconButton>
              </Tooltip>
            </div>
            <div className="vendor-page__actions">
              <Button variant="brand" size="sm">
                <IconImport />
                Import tariff
              </Button>
              <Button variant="primary" size="sm" onClick={onNewCard}>
                <IconPlus />
                New rate card
              </Button>
            </div>
          </div>

          <div className="vendor-page__sheet">
            {filtered.length === 0 ? (
              <EmptyState
                title="No rate cards match this search"
                description="Try another card name or property."
              />
            ) : (
              <>
              <DataSheet className="rate-card-sheet" aria-label="Rate cards">
                <DataSheetHeader>
                  <DataSheetCell check>
                    <Checkbox state={headerState} onCheckedChange={toggleAll} label="Select all rate cards" />
                  </DataSheetCell>
                  <DataSheetCell>Rate card</DataSheetCell>
                  <DataSheetCell>Property</DataSheetCell>
                  <DataSheetCell>Stay validity</DataSheetCell>
                  <DataSheetCell>Status</DataSheetCell>
                  <DataSheetCell>Coverage</DataSheetCell>
                  <DataSheetCell>Action</DataSheetCell>
                </DataSheetHeader>
                {filtered.map((card) => (
                  <DataSheetRow key={card.id}>
                    <DataSheetCell check>
                      <Checkbox
                        state={selected.includes(card.id) ? "on" : "off"}
                        onCheckedChange={(state) => toggleRow(card.id, state)}
                        label={`Select ${card.title}`}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <LeadCell
                        icon={<IconPin />}
                        title={card.title}
                        subtitle={card.ref}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="rate-card-sheet__property">{card.property}</span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <RateCardValidityCell range={card.validity} note={card.validityNote} />
                    </DataSheetCell>
                    <DataSheetCell>
                      <StatusChipWithDot tone={STATUS_TONE[card.status]}>
                        {STATUS_LABEL[card.status]}
                      </StatusChipWithDot>
                    </DataSheetCell>
                    <DataSheetCell>
                      <RateCardCoverageCell
                        count={card.coverageCount}
                        unit={card.coverageUnit}
                        detail={card.coverageDetail}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      {card.action === "continue" ? (
                        <Button variant="primary" size="sm" onClick={() => onOpenCard(card.id)}>
                          Continue
                        </Button>
                      ) : (
                        <Button variant="brand" size="sm" onClick={() => onOpenCard(card.id)}>
                          Open
                        </Button>
                      )}
                    </DataSheetCell>
                  </DataSheetRow>
                ))}
              </DataSheet>
                <Pagination
                  rangeLabel={`Showing 1–${filtered.length} of ${filtered.length} rate cards`}
                  page={page}
                  pageCount={1}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </>
      )}

      <VendorFormModal
        mode="edit"
        open={editOpen}
        vendor={vendor}
        vendors={vendors}
        orgRole={orgRole}
        onClose={() => setEditOpen(false)}
        onCreated={() => undefined}
        onUpdated={(updated) => {
          onVendorsChange(vendors.map((v) => (v.id === updated.id ? updated : v)));
          setEditOpen(false);
        }}
        onViewExisting={(id) => {
          setEditOpen(false);
          onOpenVendor(id);
        }}
      />
    </div>
  );
}

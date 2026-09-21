import { useEffect, useMemo, useState } from "react";
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
import { vendorActivityForVendor } from "../data/vendorOverview";
import { can, type OrgRole } from "../permissions";
import { IconCalendar, IconFilter, IconImport, IconPin, IconPlus, IconRefresh } from "../icons";
import { CommunicationPanel } from "./CommunicationPanel";
import { EditVendorLauncherModal, type VendorEditDestination } from "./EditVendorLauncher";
import { RateCardCoverageCell, RateCardValidityCell } from "./rateCardCells";
import { PackagesPanel } from "./PackagesPanel";
import { ServicesPanel } from "./ServicesPanel";
import { StatusChipWithDot } from "./StatusChipWithDot";
import { TasksPanel } from "./TasksPanel";
import { VendorBookingsPanel } from "./VendorBookingsPanel";
import { VendorActivityPanel } from "./VendorActivityPanel";
import { VendorDocsPanel } from "./VendorDocsPanel";
import { VendorFinancePanel } from "./VendorFinancePanel";
import { VendorFormModal } from "./VendorFormModal";
import { VendorOverview } from "./VendorOverview";
import { VendorProfileHeader } from "./VendorProfileHeader";
import { SheetLeadButton } from "./SheetLeadButton";
import { servicesForVendor } from "../data/services";
import "./VendorRateCardsPage.css";

const BASE_TABS: TabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Services" },
  { id: "rate-cards", label: "Rate cards", count: 1 },
  { id: "packages", label: "Packages", count: 2 },
  { id: "bookings", label: "Bookings", count: 12 },
  { id: "finance", label: "Finance", count: 2 },
  { id: "docs", label: "Docs", count: 2 },
  { id: "tasks", label: "Tasks", count: 5 },
  { id: "comms", label: "Communications", count: 2 },
  { id: "activity", label: "Activity" },
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
  openServiceId = null,
  onOpenServiceIdChange,
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
  openServiceId?: string | null;
  onOpenServiceIdChange?: (id: string | null) => void;
}) {
  const vendor = getVendor(vendorId, vendors) ?? getVendor("exhosp", vendors)!;
  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [editLauncherOpen, setEditLauncherOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [documentRequestDraft, setDocumentRequestDraft] = useState<{
    id: number;
    body: string;
  } | null>(null);
  const canEdit = can(orgRole, "vendor.edit");

  const vendorServices = servicesForVendor(vendor.id);
  const serviceCount = vendorServices.length;
  const activeService = openServiceId
    ? vendorServices.find((service) => service.id === openServiceId)
    : undefined;
  const activityCount = vendorActivityForVendor(vendor).length;
  const tabs: TabItem[] = useMemo(
    () =>
      BASE_TABS.map((t) => {
        if (t.id === "services") return { ...t, count: serviceCount || undefined };
        if (t.id === "activity") return { ...t, count: activityCount || undefined };
        return t;
      }),
    [activityCount, serviceCount],
  );

  const setVendorTab = (next: string) => {
    if (next !== "services") onOpenServiceIdChange?.(null);
    if (next !== "comms") setDocumentRequestDraft(null);
    setTab(next);
  };

  const onEditDestination = (id: VendorEditDestination) => {
    setEditLauncherOpen(false);
    if (id === "profile") {
      // Profile edits live on Overview — name, categories (title idea), location, contact.
      onOpenServiceIdChange?.(null);
      setTab("overview");
      setEditProfileOpen(true);
      return;
    }
    setVendorTab(id);
  };

  useEffect(() => {
    if (openServiceId) setTab("services");
  }, [openServiceId]);

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

  const openDocumentRequest = (
    documentName?: string,
    action?: "request-renewal" | "chase",
  ) => {
    const body = documentName
      ? action === "request-renewal"
        ? `Hi, could you please share a renewed copy of ${documentName} for ${vendor.name}? Thank you!`
        : `Hi, following up on ${documentName} for ${vendor.name}. Could you please send the completed document? Thank you!`
      : `Hi, could you please share the pending compliance documents for ${vendor.name} at your earliest convenience? Thank you!`;
    setDocumentRequestDraft({ id: Date.now(), body });
    setVendorTab("comms");
  };

  return (
    <div className="vendor-page">
      {activeService ? null : (
        <>
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
            onEdit={() => setEditLauncherOpen(true)}
          />

          <div className="vendor-page__tabs">
            <TabBar items={tabs} value={tab} onValueChange={setVendorTab} aria-label="Vendor sections" />
          </div>
        </>
      )}

      {tab === "overview" ? (
        <VendorOverview
          vendor={vendor}
          flash={flash}
          canEdit={canEdit}
          onJumpTab={(next) => {
            onClearFlash?.();
            setVendorTab(next);
          }}
          onEditProfile={() => setEditLauncherOpen(true)}
        />
      ) : tab === "activity" ? (
        <VendorActivityPanel vendor={vendor} />
      ) : tab === "services" ? (
        <ServicesPanel
          vendorId={vendor.id}
          vendorName={vendor.name}
          canEdit={canEdit}
          openServiceId={openServiceId}
          onOpenServiceIdChange={(id) => {
            onOpenServiceIdChange?.(id);
            if (id) setTab("services");
          }}
          onOpenRateCard={onOpenCard}
        />
      ) : tab === "packages" ? (
        <PackagesPanel />
      ) : tab === "bookings" ? (
        <VendorBookingsPanel />
      ) : tab === "finance" ? (
        <VendorFinancePanel />
      ) : tab === "docs" ? (
        <VendorDocsPanel onRequestDocuments={openDocumentRequest} />
      ) : tab === "tasks" ? (
        <TasksPanel />
      ) : tab === "comms" ? (
        <CommunicationPanel
          linkLabel="linked to this vendor"
          requestDraft={documentRequestDraft}
        />
      ) : tab !== "rate-cards" ? (
        <EmptyState
          title="Nothing in this section yet"
          description="This trial recreates Overview, Services, Packages, Bookings, Finance, Docs, Tasks, Communications, and Activity."
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
                      <SheetLeadButton
                        label={`Open ${card.title}`}
                        onClick={() => onOpenCard(card.id)}
                      >
                        <LeadCell
                          icon={<IconPin />}
                          title={card.title}
                          subtitle={card.ref}
                        />
                      </SheetLeadButton>
                    </DataSheetCell>
                    <DataSheetCell>
                      <div className="rate-card-sheet__property">
                        <img
                          className="rate-card-sheet__property-thumb"
                          src={card.propertyImageUrl}
                          alt={card.propertyImageAlt}
                          width={36}
                          height={36}
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="rate-card-sheet__property-name">{card.property}</span>
                      </div>
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

      <EditVendorLauncherModal
        open={editLauncherOpen}
        vendorName={vendor.name}
        onClose={() => setEditLauncherOpen(false)}
        onSelect={onEditDestination}
      />

      <VendorFormModal
        mode="edit"
        open={editProfileOpen}
        vendor={vendor}
        vendors={vendors}
        orgRole={orgRole}
        onClose={() => setEditProfileOpen(false)}
        onCreated={() => undefined}
        onUpdated={(updated) => {
          onVendorsChange(vendors.map((v) => (v.id === updated.id ? updated : v)));
          setEditProfileOpen(false);
          setTab("overview");
        }}
        onViewExisting={(id) => {
          setEditProfileOpen(false);
          onOpenVendor(id);
        }}
      />
    </div>
  );
}

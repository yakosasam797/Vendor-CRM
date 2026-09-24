import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  EmptyState,
  FilterSelect,
  IconButton,
  LeadCell,
  Pagination,
  SearchField,
  StackCell,
  StackLine,
  TabBar,
  Tooltip,
  type CheckboxState,
  type TabItem,
} from "@paryatech/design-system";
import {
  RATE_CARDS,
  STATUS_LABEL,
  STATUS_TONE,
  type RateCardStatus,
} from "../data/rateCards";
import { getVendor, type Vendor } from "../data/vendors";
import { VENDOR_BOOKINGS, vendorActivityForVendor } from "../data/vendorOverview";
import { COMPLIANCE_DOCS, PAYABLES } from "../data/vendorFinance";
import { VENDOR_CONVERSATIONS } from "../data/communications";
import { VENDOR_PACKAGES } from "../data/packages";
import { can, type OrgRole } from "../permissions";
import type { PageNavigationChange } from "../pageNavigation";
import { IconCheck, IconFilter, IconPin, IconPlus } from "../icons";
import { AnchoredImport } from "./AnchoredImport";
import { CommunicationPanel } from "./CommunicationPanel";
import { RateCardCoverageCell, RateCardValidityCell } from "./rateCardCells";
import { PackagesPanel } from "./PackagesPanel";
import { ServicesPanel } from "./ServicesPanel";
import { StatusChipWithDot } from "./StatusChipWithDot";
import { TasksPanel, type TaskLinkGroup } from "./TasksPanel";
import { VendorBookingsPanel } from "./VendorBookingsPanel";
import { VendorActivityPanel } from "./VendorActivityPanel";
import { VendorDocsPanel } from "./VendorDocsPanel";
import { VendorFinancePanel } from "./VendorFinancePanel";
import { VendorFormModal } from "./VendorFormModal";
import { VendorOverview } from "./VendorOverview";
import { VendorProfileHeader } from "./VendorProfileHeader";
import { DashboardDataSheetFill } from "./DashboardDataSheet";
import { SERVICE_TYPE_FILTERS, servicesForVendor } from "../data/services";
import { AddServicesModal, type DraftLinkedService } from "./AddServicesModal";
import { ServiceTypeIcon, ServiceTypeLabel, type ServiceTypeName } from "./ServiceTypeLabel";
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

const TASK_PACKAGE_IDS_BY_VENDOR: Record<string, string[]> = {
  trailmakers: ["pkg-1", "pkg-2"],
  exhosp: ["pkg-3", "pkg-7"],
  wanderlust: ["pkg-5", "pkg-8"],
  coastal: ["pkg-4", "pkg-6"],
};

function taskPackagesForVendor(vendorId: string) {
  const packageIds = TASK_PACKAGE_IDS_BY_VENDOR[vendorId] ?? [];
  return VENDOR_PACKAGES.filter((item) => packageIds.includes(item.id));
}

type RateCardStatusFilter = "all" | RateCardStatus;

const RATE_CARD_FILTER_OPTIONS: Array<{
  value: RateCardStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All rate cards" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "expired", label: "Expired" },
];

const DRAFT_TAB_COPY: Record<string, { title: string; description: string; action?: string }> = {
  services: {
    title: "No services yet",
    description: "Add the first service to start building this vendor record.",
    action: "Add services",
  },
  "rate-cards": {
    title: "No rate cards yet",
    description: "Rate cards can be added after the vendor's first service is available.",
    action: "Add rate card",
  },
  packages: {
    title: "No packages yet",
    description: "Packages created with this vendor will appear here.",
    action: "Build package",
  },
  bookings: {
    title: "No bookings yet",
    description: "Bookings linked to this vendor will appear here.",
    action: "Add booking",
  },
  finance: {
    title: "No finance details yet",
    description: "Add bank details and finance terms for staff reference.",
    action: "Add bank details",
  },
  docs: {
    title: "No documents yet",
    description: "Upload the first compliance or vendor document.",
    action: "Upload document",
  },
  tasks: {
    title: "No tasks yet",
    description: "Create a task when this draft needs follow-up.",
    action: "Add task",
  },
  comms: {
    title: "No communications yet",
    description: "Messages linked to this vendor will appear here.",
    action: "Start communication",
  },
  activity: {
    title: "No activity yet",
    description: "Changes to this draft will appear here.",
  },
};

function DraftVendorTab({
  tab,
  canEdit,
  onAction,
  onNewCard,
}: {
  tab: string;
  canEdit: boolean;
  onAction?: () => void;
  onNewCard?: () => void;
}) {
  const copy = DRAFT_TAB_COPY[tab] ?? {
    title: "Nothing here yet",
    description: "Add details when this vendor is ready.",
  };

  return (
    <div className="vendor-draft-tab">
      <EmptyState
        title={copy.title}
        description={copy.description}
        action={
          copy.action && canEdit ? (
            <Button
              variant="primary"
              size="sm"
              onClick={tab === "rate-cards" ? onNewCard : onAction}
            >
              <IconPlus />
              {copy.action}
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}

function serviceTypeForTable(type: ServiceTypeName): ServiceTypeName {
  if (type === "Activities") return "Activity";
  if (type === "DMC") return "DMC/Ground handling";
  return type;
}

function DraftServicesPanel({
  services,
  canEdit,
  onAdd,
}: {
  services: DraftLinkedService[];
  canEdit: boolean;
  onAdd: () => void;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((service) => {
      const serviceType = serviceTypeForTable(service.type);
      if (typeFilter !== "all" && serviceType !== typeFilter) return false;
      if (!q) return true;
      return `${service.name} ${serviceType} ${service.location} ${service.sourceDetail}`
        .toLowerCase()
        .includes(q);
    });
  }, [query, services, typeFilter]);

  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === filtered.length && filtered.length > 0
        ? "on"
        : "indeterminate";

  const toggleAll = (state: CheckboxState) => {
    setSelected(state === "on" ? filtered.map((service) => service.id) : []);
  };

  const toggleRow = (id: string, state: CheckboxState) => {
    setSelected((current) =>
      state === "on"
        ? current.includes(id) ? current : [...current, id]
        : current.filter((item) => item !== id),
    );
  };

  const emptyTitle = services.length === 0 ? "No services added yet" : "No services match this search";
  const emptyDescription = services.length === 0
    ? "Use Add service to link the first service to this vendor."
    : "Try another service name or clear the type filter.";

  return (
    <div className="draft-services-panel dashboard-table-panel">
      <div className="vendor-page__toolbar services-panel__toolbar">
        <SearchField
          fullWidth
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
            setSelected([]);
          }}
          placeholder="Search service name"
          aria-label="Search service name"
        />
        <div className="vendor-page__tools">
          <FilterSelect
            tip="Filter by service type"
            label="Type"
            options={SERVICE_TYPE_FILTERS}
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              setPage(1);
              setSelected([]);
            }}
          />
        </div>
        {canEdit ? (
          <div className="vendor-page__actions">
            <AnchoredImport buttonLabel="Import services" />
            <Button variant="primary" size="sm" onClick={onAdd}>
              <IconPlus />
              Add service
            </Button>
          </div>
        ) : null}
      </div>

      <div className="vendor-page__sheet dashboard-table-end">
        <DataSheet className="services-sheet draft-services-sheet" aria-label="Draft vendor services">
          <DataSheetHeader>
            <DataSheetCell check>
              <Checkbox state={headerState} onCheckedChange={toggleAll} label="Select all services" />
            </DataSheetCell>
            <DataSheetCell>Service</DataSheetCell>
            <DataSheetCell>Service type</DataSheetCell>
            <DataSheetCell>Important details</DataSheetCell>
            <DataSheetCell>Media</DataSheetCell>
            <DataSheetCell>Current pricing</DataSheetCell>
            <DataSheetCell>Status</DataSheetCell>
          </DataSheetHeader>
          {filtered.map((service) => {
            const serviceType = serviceTypeForTable(service.type);
            return (
              <DataSheetRow key={service.id}>
                <DataSheetCell check>
                  <Checkbox
                    state={selected.includes(service.id) ? "on" : "off"}
                    onCheckedChange={(state) => toggleRow(service.id, state)}
                    label={`Select ${service.name}`}
                  />
                </DataSheetCell>
                <DataSheetCell>
                  <LeadCell
                    align="start"
                    icon={
                      <span className="draft-services-sheet__thumb" aria-hidden="true">
                        <ServiceTypeIcon type={serviceType} size={15} />
                      </span>
                    }
                    title={service.name}
                    subtitle={service.location}
                  />
                </DataSheetCell>
                <DataSheetCell><ServiceTypeLabel type={serviceType} /></DataSheetCell>
                <DataSheetCell><span className="services-sheet__details">{service.sourceDetail}</span></DataSheetCell>
                <DataSheetCell><span className="svc-media-cell__count">0 images</span></DataSheetCell>
                <DataSheetCell>
                  <StackCell>
                    <StackLine>Not priced</StackLine>
                    <StackLine muted><span className="services-sheet__rate-count pt-mono">0</span> Rate cards</StackLine>
                  </StackCell>
                </DataSheetCell>
                <DataSheetCell><StatusChipWithDot tone="progress">Draft</StatusChipWithDot></DataSheetCell>
              </DataSheetRow>
            );
          })}
          {filtered.length === 0 ? (
            <DataSheetRow className="services-sheet__empty-row">
              <DataSheetCell className="services-sheet__empty-cell">
                <div>
                  <strong>{emptyTitle}</strong>
                  <span>{emptyDescription}</span>
                </div>
              </DataSheetCell>
            </DataSheetRow>
          ) : null}
          <DashboardDataSheetFill columns={7} />
        </DataSheet>
        <Pagination
          rangeLabel={filtered.length ? `Showing 1–${filtered.length} of ${filtered.length} services` : "Showing 0 of 0 services"}
          page={page}
          pageCount={1}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

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
  onNavigationContextChange,
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
  onNavigationContextChange?: PageNavigationChange;
}) {
  const vendor = getVendor(vendorId, vendors) ?? getVendor("exhosp", vendors)!;
  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [rateCardStatusFilter, setRateCardStatusFilter] =
    useState<RateCardStatusFilter>("all");
  const [rateCardFilterOpen, setRateCardFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addServicesOpen, setAddServicesOpen] = useState(false);
  const [packageDetailOpen, setPackageDetailOpen] = useState(false);
  const [draftServicesByVendor, setDraftServicesByVendor] = useState<Record<string, DraftLinkedService[]>>({});
  const [documentRequestDraft, setDocumentRequestDraft] = useState<{
    id: number;
    body: string;
  } | null>(null);
  const [openTaskCount, setOpenTaskCount] = useState(5);
  const rateCardFilterRef = useRef<HTMLDivElement>(null);
  const canEdit = can(orgRole, "vendor.edit");
  const canAddTask = can(orgRole, "vendor.task.add");
  const isDraft = vendor.status === "Draft";
  const draftLinkedServices = draftServicesByVendor[vendor.id] ?? [];

  const vendorServices = servicesForVendor(vendor.id);
  const serviceCount = vendorServices.length;
  const taskLinkGroups: TaskLinkGroup[] = [
      {
        id: "overview",
        label: "Overview",
        recordLabel: "Vendor record",
        options: [{ id: vendor.id, label: vendor.name, meta: vendor.code }],
      },
      {
        id: "services",
        label: "Services",
        recordLabel: "Service",
        options: servicesForVendor(vendor.id).map((service) => ({
          id: service.id,
          label: service.name,
          meta: `${service.type} · ${service.location}`,
        })),
      },
      {
        id: "rate-cards",
        label: "Rate cards",
        recordLabel: "Rate card",
        options: RATE_CARDS.map((card) => ({ id: card.id, label: card.title, meta: card.ref })),
      },
      {
        id: "packages",
        label: "Packages",
        recordLabel: "Package",
        options: taskPackagesForVendor(vendor.id).map((item) => ({ id: item.id, label: item.name, meta: item.detail })),
      },
      {
        id: "bookings",
        label: "Bookings",
        recordLabel: "Booking",
        options: VENDOR_BOOKINGS.map((booking) => ({ id: booking.id, label: booking.title, meta: booking.ref })),
      },
      {
        id: "finance",
        label: "Finance",
        recordLabel: "Invoice",
        options: PAYABLES.map((payable) => ({ id: payable.id, label: payable.invoice, meta: payable.booking })),
      },
      {
        id: "docs",
        label: "Documents",
        recordLabel: "Document",
        options: COMPLIANCE_DOCS.map((document) => ({ id: document.id, label: document.name, meta: document.reference })),
      },
      {
        id: "comms",
        label: "Communications",
        recordLabel: "Conversation",
        options: VENDOR_CONVERSATIONS.map((conversation) => ({
          id: conversation.id,
          label: conversation.name,
          meta: conversation.role,
        })),
      },
  ].filter((group) => group.options.length > 0);
  const activeService = openServiceId
    ? vendorServices.find((service) => service.id === openServiceId)
    : undefined;
  const activityCount = vendorActivityForVendor(vendor).length;
  const tabs: TabItem[] = useMemo(
    () =>
      BASE_TABS.map((t) => {
        if (isDraft) {
          if (t.id === "services" && draftLinkedServices.length > 0) {
            return { ...t, count: draftLinkedServices.length };
          }
          return { ...t, count: undefined };
        }
        if (t.id === "services") return { ...t, count: serviceCount || undefined };
        if (t.id === "activity") return { ...t, count: activityCount || undefined };
        if (t.id === "tasks") return { ...t, count: openTaskCount || undefined };
        return t;
      }),
    [activityCount, draftLinkedServices.length, isDraft, openTaskCount, serviceCount],
  );

  const setVendorTab = (next: string) => {
    if (next !== "services") onOpenServiceIdChange?.(null);
    if (next !== "packages") setPackageDetailOpen(false);
    if (next !== "comms") setDocumentRequestDraft(null);
    if (next !== "rate-cards") setRateCardFilterOpen(false);
    setTab(next);
  };

  useEffect(() => {
    if (openServiceId) setTab("services");
  }, [openServiceId]);

  useEffect(() => {
    if (!rateCardFilterOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rateCardFilterRef.current?.contains(event.target as Node)) {
        setRateCardFilterOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRateCardFilterOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [rateCardFilterOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RATE_CARDS.filter((card) => {
      if (rateCardStatusFilter !== "all" && card.status !== rateCardStatusFilter) {
        return false;
      }
      return (
        !q ||
        card.title.toLowerCase().includes(q) ||
        card.property.toLowerCase().includes(q) ||
        card.category.toLowerCase().includes(q)
      );
    });
  }, [query, rateCardStatusFilter]);

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
      {activeService || packageDetailOpen ? null : (
        <>
          <VendorProfileHeader
            code={vendor.code}
            location={vendor.location}
            name={vendor.name}
            status={vendor.status}
            canEdit={canEdit}
            onEdit={() => setEditProfileOpen(true)}
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
          onEditProfile={() => setEditProfileOpen(true)}
        />
      ) : isDraft && tab === "services" ? (
        <DraftServicesPanel
          services={draftLinkedServices}
          canEdit={canEdit}
          onAdd={() => setAddServicesOpen(true)}
        />
      ) : isDraft ? (
        <DraftVendorTab
          tab={tab}
          canEdit={canEdit}
          onAction={tab === "services" ? () => setAddServicesOpen(true) : undefined}
          onNewCard={onNewCard}
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
          onNavigationContextChange={onNavigationContextChange}
          onOpenRateCard={onOpenCard}
          onOpenVendor={onOpenVendor}
        />
      ) : tab === "packages" ? (
        <PackagesPanel
          vendorId={vendor.id}
          canEdit={canEdit}
          onDetailOpenChange={setPackageDetailOpen}
          onNavigationContextChange={onNavigationContextChange}
          onOpenService={(serviceId, serviceVendorId) => {
            setTab("services");
            if (serviceVendorId && serviceVendorId !== vendor.id) onOpenVendor(serviceVendorId);
            onOpenServiceIdChange?.(serviceId ?? null);
          }}
        />
      ) : tab === "bookings" ? (
        <VendorBookingsPanel />
      ) : tab === "finance" ? (
        <VendorFinancePanel vendorName={vendor.name} canEdit={canEdit} />
      ) : tab === "docs" ? (
        <VendorDocsPanel canEdit={canEdit} onRequestDocuments={openDocumentRequest} />
      ) : tab === "tasks" ? (
        <TasksPanel
          canAddTask={canAddTask}
          vendorName={vendor.name}
          linkGroups={taskLinkGroups}
          onOpenTaskCountChange={setOpenTaskCount}
        />
      ) : tab === "comms" ? (
        <CommunicationPanel
          contactName={vendor.name}
          contactEmail={vendor.reservationsEmail || vendor.email}
          initials={vendor.initials}
          contacts={vendor.contacts}
          canCompose={canEdit}
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
              <div className="rate-card-filter" ref={rateCardFilterRef}>
                <Tooltip tip="Filter by status">
                  <IconButton
                    className={rateCardStatusFilter === "all" ? undefined : "is-active"}
                    label={`Filter rate cards${
                      rateCardStatusFilter === "all"
                        ? ""
                        : `: ${STATUS_LABEL[rateCardStatusFilter]}`
                    }`}
                    aria-expanded={rateCardFilterOpen}
                    aria-haspopup="menu"
                    onClick={() => setRateCardFilterOpen((open) => !open)}
                  >
                    <IconFilter />
                  </IconButton>
                </Tooltip>
                {rateCardFilterOpen ? (
                  <div
                    className="rate-card-filter__menu"
                    role="menu"
                    aria-label="Filter rate cards by status"
                  >
                    {RATE_CARD_FILTER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={rateCardStatusFilter === option.value}
                        onClick={() => {
                          setRateCardStatusFilter(option.value);
                          setSelected([]);
                          setPage(1);
                          setRateCardFilterOpen(false);
                        }}
                      >
                        <span>{option.label}</span>
                        {rateCardStatusFilter === option.value ? <IconCheck /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="vendor-page__actions">
              <AnchoredImport buttonLabel="Import tariff" />
              <Button variant="primary" size="sm" onClick={onNewCard}>
                <IconPlus />
                New rate card
              </Button>
            </div>
          </div>

          {rateCardStatusFilter !== "all" ? (
            <div className="rate-card-filter__summary" role="status">
              Showing {STATUS_LABEL[rateCardStatusFilter].toLowerCase()} rate cards
              <button
                type="button"
                onClick={() => {
                  setRateCardStatusFilter("all");
                  setSelected([]);
                  setPage(1);
                }}
              >
                Clear filter
              </button>
            </div>
          ) : null}

          <div className="vendor-page__sheet dashboard-table-end">
            {filtered.length === 0 ? (
              <EmptyState
                title="No rate cards match this view"
                description="Try another card name, property, or status filter."
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
                </DataSheetHeader>
                {filtered.map((card) => (
                  <DataSheetRow
                    key={card.id}
                    className="data-row--interactive"
                    role="link"
                    tabIndex={0}
                    aria-label={`Open ${card.title}`}
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("button, a, input, select, textarea")) return;
                      onOpenCard(card.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpenCard(card.id);
                      }
                    }}
                  >
                    <DataSheetCell check>
                      <Checkbox
                        state={selected.includes(card.id) ? "on" : "off"}
                        onCheckedChange={(state) => toggleRow(card.id, state)}
                        label={`Select ${card.title}`}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <LeadCell icon={<IconPin />} title={card.title} subtitle={card.ref} />
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
                  </DataSheetRow>
                ))}
                <DashboardDataSheetFill columns={6} />
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
        onNavigateTab={(next) => setVendorTab(next)}
      />

      {addServicesOpen ? (
        <AddServicesModal
          open
          vendorName={vendor.name}
          onClose={() => setAddServicesOpen(false)}
          onAdd={(services) => {
            setDraftServicesByVendor((current) => {
              const byId = new Map((current[vendor.id] ?? []).map((service) => [service.id, service]));
              services.forEach((service) => byId.set(service.id, service));
              return { ...current, [vendor.id]: [...byId.values()] };
            });
            setTab("services");
          }}
        />
      ) : null}
    </div>
  );
}

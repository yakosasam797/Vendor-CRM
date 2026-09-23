import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  EmptyState,
  IconButton,
  ListBulkBar,
  Pagination,
  SearchField,
  TabBar,
  type CheckboxState,
  type StatusTone,
  type TabItem,
} from "@paryatech/design-system";
import { getVendorService } from "../data/services";
import {
  DIRECTORY_CATEGORIES,
  DIRECTORY_SERVICES,
  SUPPLIER_TYPES,
  VENDOR_SERVICE_CONNECTIONS,
  serviceByDirectoryId,
  type DirectoryCategory,
  type DirectoryService,
  type SupplierType,
  type VendorServiceConnection,
} from "../data/vendorDirectory";
import { visibleVendorsForRole, type Vendor } from "../data/vendors";
import { can, type OrgRole } from "../permissions";
import type { PageNavigationChange } from "../pageNavigation";
import {
  IconBuilding,
  IconCard,
  IconCheck,
  IconFilter,
  IconImage,
  IconImport,
  IconMore,
  IconPencil,
  IconPin,
  IconPlus,
  IconWarn,
} from "../icons";
import { StatusChipWithDot } from "./StatusChipWithDot";
import { VendorFormModal } from "./VendorFormModal";
import { AnchoredImport } from "./AnchoredImport";
import { SummaryStrip, type SummaryField } from "./SummaryStrip";
import { ServiceTestRate } from "./ServiceTestRate";
import { ServiceTypeLabel, ServiceTypeList } from "./ServiceTypeLabel";
import "./VendorsListPage.css";

type Perspective = "vendors" | "services";

type VendorDirectoryRow = {
  vendor: Vendor;
  connections: VendorServiceConnection[];
  matchedThrough?: string;
};

type ServiceDirectoryRow = {
  service: DirectoryService;
  connections: VendorServiceConnection[];
  providedBy?: string;
};

function connectionTone(status: VendorServiceConnection["status"]): StatusTone {
  if (status === "Active") return "done";
  if (status === "Expiring soon") return "progress";
  return "open";
}

function vendorStatusTone(status: Vendor["status"]): StatusTone {
  if (status === "Active") return "done";
  if (status === "Draft" || status === "Setup incomplete") return "progress";
  if (status === "Archived") return "blocked";
  return "open";
}

const DEFAULT_VENDOR_IMAGE = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=160&h=160&q=80";

function DirectoryEntity({ vendor, imageUrl, imageAlt, title, subtitle, match, onClick }: {
  vendor?: Vendor;
  imageUrl?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  match?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="directory-entity" onClick={onClick} aria-label={`Open ${title}`}>
      {vendor || imageUrl ? (
        <span className="vendors-sheet__image">
          <img
            src={imageUrl ?? vendor?.imageUrl ?? DEFAULT_VENDOR_IMAGE}
            alt={imageAlt ?? (vendor ? `${vendor.name} image` : `${title} image`)}
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
          />
        </span>
      ) : null}
        <span className="directory-entity__copy">
          <span className="directory-entity__title-row">
            <span className="directory-link directory-link--strong">{title}</span>
          </span>
        {subtitle && !match ? <span className="directory-entity__sub">{subtitle}</span> : null}
        {match ? <span className="directory-entity__match">{match}</span> : null}
      </span>
    </button>
  );
}

function ServiceDirectoryDetail({
  service,
  vendors,
  canEdit,
  onOpenVendor,
  onOpenRateCard,
}: {
  service: DirectoryService;
  vendors: Vendor[];
  canEdit: boolean;
  onOpenVendor: (id: string) => void;
  onOpenRateCard: (vendorId: string, rateCardId: string) => void;
}) {
  const [tab, setTab] = useState("overview");
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const vendorIds = useMemo(() => new Set(vendors.map((vendor) => vendor.id)), [vendors]);
  const connections = useMemo(
    () => VENDOR_SERVICE_CONNECTIONS.filter((connection) => connection.serviceId === service.id && vendorIds.has(connection.vendorId)),
    [service.id, vendorIds],
  );
  const serviceProfile = getVendorService(service.serviceId);
  const connectedVendorIds = connections.map((connection) => connection.vendorId);
  const linkedRateCardCount = new Set(connections.map((connection) => connection.rateCardId)).size;
  const activeConnectionCount = connections.filter((connection) => connection.status === "Active").length;
  const attentionConnectionCount = connections.length - activeConnectionCount;
  const mediaItems = serviceProfile?.media ?? [];
  const primaryMediaCount = mediaItems.filter((item) => item.usedInBanner).length;
  const serviceSummary: SummaryField[] = [
    {
      id: "location",
      label: "Base location",
      value: service.location,
      note: service.category,
      icon: <IconPin size={15} />,
    },
    {
      id: "vendors",
      label: "Vendor coverage",
      value: connections.length,
      note: `${activeConnectionCount} active vendor${activeConnectionCount === 1 ? "" : "s"}`,
      icon: <IconBuilding size={15} />,
    },
    {
      id: "rate-cards",
      label: "Rate cards",
      value: linkedRateCardCount,
      note: "Linked pricing records",
      icon: <IconCard size={15} />,
    },
    {
      id: "media",
      label: "Media",
      value: mediaItems.length,
      note: `${primaryMediaCount} primary banner${primaryMediaCount === 1 ? "" : "s"}`,
      icon: <IconImage size={15} />,
    },
  ];
  const vendorSummary: SummaryField[] = [
    {
      id: "connected",
      label: "Connected vendors",
      value: connections.length,
      note: "Supplier relationships",
      icon: <IconBuilding size={15} />,
    },
    {
      id: "active",
      label: "Active supply",
      value: activeConnectionCount,
      note: "Ready for costing",
      icon: <IconCheck size={15} />,
      tone: "ok",
    },
    {
      id: "attention",
      label: "Needs attention",
      value: attentionConnectionCount,
      note: attentionConnectionCount === 1 ? "1 relationship" : `${attentionConnectionCount} relationships`,
      icon: <IconWarn size={15} />,
      tone: attentionConnectionCount > 0 ? "warn" : "ok",
    },
    {
      id: "pricing",
      label: "Rate cards",
      value: linkedRateCardCount,
      note: "Current pricing sources",
      icon: <IconCard size={15} />,
    },
  ];
  const vendorHeaderState: CheckboxState = selectedVendorIds.length === 0
    ? "off"
    : selectedVendorIds.length === connectedVendorIds.length
      ? "on"
      : "indeterminate";
  const tabs: TabItem[] = [
    { id: "overview", label: "Overview" },
    { id: "vendors", label: "Vendors", count: connections.length },
    { id: "test-rate", label: "Test rate" },
  ];

  return (
    <div className="service-directory-detail">
      <header className="service-directory-detail__record">
        <div className="service-directory-detail__identity">
          {serviceProfile?.imageUrl ? <img className="service-directory-detail__image" src={serviceProfile.imageUrl} alt={`${service.name} primary view`} /> : null}
          <div className="service-directory-detail__identity-copy">
            <div className="service-directory-detail__title-row">
              <h1>{service.name}</h1>
              <StatusChipWithDot tone={service.status === "Active" ? "done" : "progress"}>{service.status}</StatusChipWithDot>
            </div>
            <p>
              <IconPin size={14} />{service.location}
              <span aria-hidden="true">·</span>
              <span className="pt-mono">{service.serviceId.toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              {service.category}
            </p>
          </div>
        </div>
        <div className="service-directory-detail__aside">
          {canEdit ? <Button variant="primary" size="sm"><IconPencil />Edit service</Button> : null}
        </div>
      </header>

      <div className="service-directory-detail__tabs">
        <TabBar items={tabs} value={tab} onValueChange={setTab} aria-label="Service sections" />
      </div>

      {tab === "overview" ? (
        <div className="service-overview">
          <div className="service-overview__summary">
            <SummaryStrip title="Service overview" columns={4} fields={serviceSummary} />
          </div>

          <div className="service-detail-panels">
            <div className="service-detail-panels__layout">
              <section className="service-detail-panel" aria-labelledby="service-profile-title">
                <div className="service-detail-panel__head">
                  <h2 id="service-profile-title">Profile</h2>
                  {canEdit ? <Button variant="brand" size="sm"><IconPencil />Edit details</Button> : null}
                </div>
                <div className="service-detail-panel__body">
                  <dl className="service-detail-profile">
                    <div className="service-detail-profile__field"><dt>Service title</dt><dd>{service.name}</dd></div>
                    <div className="service-detail-profile__field"><dt>Service ID</dt><dd className="pt-mono">{service.serviceId.toUpperCase()}</dd></div>
                    <div className="service-detail-profile__field"><dt>Status</dt><dd><StatusChipWithDot tone={service.status === "Active" ? "done" : "progress"}>{service.status}</StatusChipWithDot></dd></div>
                    <div className="service-detail-profile__field"><dt>Category</dt><dd>{serviceProfile?.profile.category ?? service.category}</dd></div>
                    <div className="service-detail-profile__field"><dt>Duration</dt><dd>{serviceProfile?.profile.duration ?? "Service based"}</dd></div>
                    <div className="service-detail-profile__field"><dt>Age suitability</dt><dd>{serviceProfile?.profile.ageSuitability ?? "All ages"}</dd></div>
                    <div className="service-detail-profile__field"><dt>Difficulty</dt><dd>{serviceProfile?.profile.difficulty ?? "Not applicable"}</dd></div>
                    <div className="service-detail-profile__field"><dt>Seasonality</dt><dd>{serviceProfile?.profile.seasonality ?? "Available year-round"}</dd></div>
                    <div className="service-detail-profile__field"><dt>Base location</dt><dd>{service.location}</dd></div>
                    <div className="service-detail-profile__field"><dt>Search keywords</dt><dd>{serviceProfile?.profile.searchText ?? `${service.name} ${service.location}`}</dd></div>
                    <div className="service-detail-profile__field service-detail-profile__field--wide"><dt>Description</dt><dd>{serviceProfile?.about ?? `${service.name} is an active ${service.category.toLowerCase()} service in ${service.location}.`}</dd></div>
                    <div className="service-detail-profile__field"><dt>Included</dt><dd>{serviceProfile?.inclusions.join(", ") ?? "As confirmed on the linked rate card"}</dd></div>
                    <div className="service-detail-profile__field"><dt>Excluded</dt><dd>{serviceProfile?.profile.exclusions.join(", ") ?? "Personal expenses"}</dd></div>
                  </dl>
                </div>
              </section>

              <section className="service-detail-panel" aria-labelledby="service-media-title">
                <div className="service-detail-panel__head">
                  <h2 id="service-media-title">Media</h2>
                  <span className="service-detail-panel__count pt-mono">{mediaItems.length} image{mediaItems.length === 1 ? "" : "s"}</span>
                </div>
                <div className="service-detail-panel__body">
                  {mediaItems.length ? (
                    <ul className="service-detail-media">
                      {mediaItems.map((item) => (
                        <li key={item.id} className={item.usedInBanner ? "is-primary" : undefined}>
                          <div className="service-detail-media__image-wrap">
                            <img src={item.imageUrl} alt={item.imageAlt} width={420} height={240} />
                            {item.usedInBanner ? <span>Primary banner</span> : null}
                          </div>
                          <p>{item.title}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="service-detail-media__empty">No media uploaded yet.</p>}
                  {canEdit ? (
                    <div className="service-detail-media__actions">
                      <Button variant="brand" size="sm"><IconPencil />Edit media</Button>
                      <Button variant="primary" size="sm"><IconPlus />Upload media</Button>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : tab === "test-rate" ? (
        <ServiceTestRate
          service={service}
          connections={connections}
          vendors={vendors}
          onOpenRateCard={onOpenRateCard}
        />
      ) : (
        <div className="service-vendors-overview">
          <div className="service-vendors-overview__summary">
            <SummaryStrip title="Vendor coverage" columns={4} fields={vendorSummary} />
          </div>

          <section className="service-suppliers" aria-labelledby="service-suppliers-title">
            <div className="service-section-head">
              <div>
                <h2 id="service-suppliers-title">Linked vendors</h2>
                <p>Supplier relationships and current pricing available for this service.</p>
              </div>
              {connections.length > 0 ? <span className="service-suppliers__count">{activeConnectionCount} active of {connections.length}</span> : null}
            </div>
            {connections.length === 0 ? (
              <EmptyState title="No vendors linked" description="Link a vendor to make this service available for costing." />
            ) : (
              <div className="service-directory-detail__sheet">
                <DataSheet className="service-suppliers-sheet" aria-label={`Vendors providing ${service.name}`}>
            <DataSheetHeader>
              <DataSheetCell check><Checkbox state={vendorHeaderState} onCheckedChange={(state) => setSelectedVendorIds(state === "on" ? connectedVendorIds : [])} label="Select all vendors" /></DataSheetCell>
              <DataSheetCell>Vendor</DataSheetCell>
              <DataSheetCell>Supplier relationship</DataSheetCell>
              <DataSheetCell>Location</DataSheetCell>
              <DataSheetCell>Current rate card</DataSheetCell>
              <DataSheetCell>Status</DataSheetCell>
            </DataSheetHeader>
            {connections.map((connection) => {
              const vendor = vendors.find((item) => item.id === connection.vendorId);
              if (!vendor) return null;
              return (
                <DataSheetRow key={connection.id}>
                  <DataSheetCell check><Checkbox state={selectedVendorIds.includes(vendor.id) ? "on" : "off"} onCheckedChange={(state) => setSelectedVendorIds((current) => state === "on" ? current.includes(vendor.id) ? current : [...current, vendor.id] : current.filter((id) => id !== vendor.id))} label={`Select ${vendor.name}`} /></DataSheetCell>
                  <DataSheetCell><DirectoryEntity vendor={vendor} title={vendor.name} subtitle={vendor.code} onClick={() => onOpenVendor(vendor.id)} /></DataSheetCell>
                  <DataSheetCell><span className="directory-relationship"><strong>{connection.supplierType}</strong><span>{connection.productsCovered}</span></span></DataSheetCell>
                  <DataSheetCell><span className="vendors-sheet__location"><IconPin size={14} />{vendor.location}</span></DataSheetCell>
                  <DataSheetCell><button type="button" className="directory-link" onClick={() => onOpenRateCard(vendor.id, connection.rateCardId)}>{connection.rateCardName}</button></DataSheetCell>
                  <DataSheetCell><StatusChipWithDot tone={connectionTone(connection.status)}>{connection.status}</StatusChipWithDot></DataSheetCell>
                </DataSheetRow>
              );
            })}
                </DataSheet>
                {selectedVendorIds.length > 0 ? <ListBulkBar label={`${selectedVendorIds.length} vendor${selectedVendorIds.length === 1 ? "" : "s"} selected`}><Button variant="brand" size="sm"><IconImport />Export</Button><Button variant="ghost" size="sm" onClick={() => setSelectedVendorIds([])}>Clear</Button></ListBulkBar> : null}
                <Pagination rangeLabel={`Showing 1–${connections.length} of ${connections.length} vendors`} page={1} pageCount={1} onPageChange={() => {}} />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export function VendorsListPage({
  vendors,
  orgRole,
  flash,
  onClearFlash,
  onOpenVendor,
  onAddVendor,
  onOpenRateCard,
  onNavigationContextChange,
  onVendorsChange,
}: {
  vendors: Vendor[];
  orgRole: OrgRole;
  flash?: string | null;
  onClearFlash?: () => void;
  onOpenVendor: (id: string) => void;
  onAddVendor: () => void;
  onOpenRateCard: (vendorId: string, rateCardId: string) => void;
  onNavigationContextChange?: PageNavigationChange;
  onVendorsChange: (next: Vendor[]) => void;
}) {
  const [perspective, setPerspective] = useState<Perspective>("vendors");
  const [openServiceId, setOpenServiceId] = useState<string | null>(null);
  const [categoryFilters, setCategoryFilters] = useState<DirectoryCategory[]>([]);
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [supplierTypes, setSupplierTypes] = useState<SupplierType[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<"edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const canAdd = can(orgRole, "vendor.add");
  const canEdit = can(orgRole, "vendor.edit");
  const scoped = useMemo(() => visibleVendorsForRole(vendors, orgRole), [vendors, orgRole]);
  const scopedIds = useMemo(() => new Set(scoped.map((vendor) => vendor.id)), [scoped]);
  const scopedConnections = useMemo(() => VENDOR_SERVICE_CONNECTIONS.filter((connection) => scopedIds.has(connection.vendorId)), [scopedIds]);
  const activeConnections = useMemo(() => scopedConnections.filter((connection) => supplierTypes.length === 0 || supplierTypes.includes(connection.supplierType)), [scopedConnections, supplierTypes]);
  const visibleServiceIds = useMemo(() => new Set(activeConnections.map((connection) => connection.serviceId)), [activeConnections]);
  const availableServices = useMemo(() => DIRECTORY_SERVICES.filter((service) => visibleServiceIds.has(service.id)), [visibleServiceIds]);
  const activeService = openServiceId ? DIRECTORY_SERVICES.find((service) => service.id === openServiceId) : undefined;
  const closeServiceDetail = useCallback(() => setOpenServiceId(null), []);

  useEffect(() => {
    if (!activeService) {
      onNavigationContextChange?.(null);
      return;
    }
    onNavigationContextChange?.({
      backLabel: "Back to services",
      sectionLabel: "Services",
      title: activeService.name,
      onBack: closeServiceDetail,
    });
    return () => onNavigationContextChange?.(null);
  }, [activeService, closeServiceDetail, onNavigationContextChange]);

  const viewTabs: TabItem[] = useMemo(() => [
    { id: "vendors", label: "Vendors", count: scoped.length },
    { id: "services", label: "Services", count: availableServices.length },
  ], [availableServices.length, scoped.length]);

  const vendorRows = useMemo<VendorDirectoryRow[]>(() => {
    const q = query.trim().toLowerCase();
    const loc = locationQuery.trim().toLowerCase();
    return scoped.flatMap((vendor) => {
      const connections = activeConnections.filter((connection) => connection.vendorId === vendor.id);
      const related = connections.map((connection) => serviceByDirectoryId(connection.serviceId)).filter((service): service is DirectoryService => Boolean(service));
      if (categoryFilters.length > 0 && !related.some((service) => categoryFilters.includes(service.category))) return [];
      if (supplierTypes.length > 0 && connections.length === 0) return [];
      if (loc && !vendor.location.toLowerCase().includes(loc) && !related.some((service) => service.location.toLowerCase().includes(loc))) return [];
      const directMatch = `${vendor.name} ${vendor.code} ${vendor.owner}`.toLowerCase().includes(q);
      const relatedMatch = q ? related.find((service) => `${service.name} ${service.category} ${service.location}`.toLowerCase().includes(q)) : undefined;
      if (q && !directMatch && !relatedMatch) return [];
      return [{ vendor, connections, matchedThrough: !directMatch && relatedMatch ? relatedMatch.name : undefined }];
    });
  }, [activeConnections, categoryFilters, locationQuery, query, scoped, supplierTypes.length]);

  const serviceRows = useMemo<ServiceDirectoryRow[]>(() => {
    const q = query.trim().toLowerCase();
    const loc = locationQuery.trim().toLowerCase();
    return availableServices.flatMap((service) => {
      if (categoryFilters.length > 0 && !categoryFilters.includes(service.category)) return [];
      if (loc && !service.location.toLowerCase().includes(loc)) return [];
      const connections = activeConnections.filter((connection) => connection.serviceId === service.id);
      const relatedVendors = connections.map((connection) => scoped.find((vendor) => vendor.id === connection.vendorId)).filter((vendor): vendor is Vendor => Boolean(vendor));
      const directMatch = `${service.name} ${service.category} ${service.location}`.toLowerCase().includes(q);
      const vendorMatch = q ? relatedVendors.find((vendor) => `${vendor.name} ${vendor.code}`.toLowerCase().includes(q)) : undefined;
      if (q && !directMatch && !vendorMatch) return [];
      return [{ service, connections, providedBy: !directMatch && vendorMatch ? vendorMatch.name : undefined }];
    });
  }, [activeConnections, availableServices, categoryFilters, locationQuery, query, scoped]);

  const rows = perspective === "vendors" ? vendorRows : serviceRows;
  const rowIds = rows.map((row) => perspective === "vendors" ? (row as VendorDirectoryRow).vendor.id : (row as ServiceDirectoryRow).service.id);
  const editVendor = editId ? vendors.find((vendor) => vendor.id === editId) ?? null : null;

  useEffect(() => {
    if (!menuId && !filtersOpen) return;
    const onDocumentPointer = (event: MouseEvent) => {
      const node = event.target as Node;
      if (menuId && !menuRef.current?.contains(node)) setMenuId(null);
      if (filtersOpen && !filterRef.current?.contains(node)) setFiltersOpen(false);
    };
    document.addEventListener("mousedown", onDocumentPointer);
    return () => document.removeEventListener("mousedown", onDocumentPointer);
  }, [filtersOpen, menuId]);

  const headerState: CheckboxState = selected.length === 0 ? "off" : selected.length === rowIds.length && rowIds.length > 0 ? "on" : "indeterminate";
  const resetRows = () => { setSelected([]); setPage(1); };
  const toggleAll = (state: CheckboxState) => setSelected(state === "on" ? rowIds : []);
  const toggleRow = (id: string, state: CheckboxState) => setSelected((current) => state === "on" ? current.includes(id) ? current : [...current, id] : current.filter((item) => item !== id));
  const toggleSupplierType = (type: SupplierType) => { setSupplierTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]); resetRows(); };
  const toggleCategory = (type: DirectoryCategory) => { setCategoryFilters((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]); resetRows(); };
  const setBrowseBy = (id: string) => { setPerspective(id as Perspective); resetRows(); };

  if (activeService) {
    return (
      <ServiceDirectoryDetail
        service={activeService}
        vendors={scoped}
        canEdit={canEdit}
        onOpenVendor={onOpenVendor}
        onOpenRateCard={onOpenRateCard}
      />
    );
  }

  return (
    <div className="vendors-page">
      <header className="vendors-page__head">
        <h1 className="vendors-page__title">
          {perspective === "vendors" ? "Vendors" : "Services"}
        </h1>
        <div className="vendors-page__actions">
          <AnchoredImport buttonLabel="Import" title="Import vendors" />
          {canAdd ? <Button variant="primary" size="sm" onClick={onAddVendor}><IconPlus />Add vendor</Button> : null}
        </div>
      </header>

      {flash ? <div className="vendors-page__flash" role="status"><span>{flash}</span>{onClearFlash ? <button type="button" className="vendors-page__flash-dismiss" onClick={onClearFlash}>Dismiss</button> : null}</div> : null}

      <div className="directory-view-tabs"><TabBar items={viewTabs} value={perspective} onValueChange={setBrowseBy} aria-label="Vendor directory view" /></div>

      <div className="vendors-page__toolbar">
        <SearchField fullWidth className="vendors-page__search" value={query} onChange={(event) => { setQuery(event.target.value); resetRows(); }} placeholder="Search vendors or services" aria-label="Search vendors or services" />
        <label className="vendors-page__location"><span className="visually-hidden">Search by location</span><span className="vendors-page__location-icon" aria-hidden="true"><IconPin size={16} /></span><input type="search" value={locationQuery} onChange={(event) => { setLocationQuery(event.target.value); resetRows(); }} placeholder="Location" aria-label="Search by location" /></label>
        <div className="directory-filters" ref={filterRef}>
          <Button variant="brand" size="sm" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><IconFilter />Filters{supplierTypes.length + categoryFilters.length > 0 ? ` ${supplierTypes.length + categoryFilters.length}` : ""}</Button>
          {filtersOpen ? (
            <div className="directory-filters__menu" role="dialog" aria-label="Directory filters">
              <div className="directory-filters__head"><div><strong>Filters</strong><span>Narrow this directory</span></div>{supplierTypes.length + categoryFilters.length > 0 ? <button type="button" onClick={() => { setSupplierTypes([]); setCategoryFilters([]); resetRows(); }}>Clear all</button> : null}</div>
              <fieldset className="directory-filters__group">
                <legend>Service category</legend>
                {DIRECTORY_CATEGORIES.filter((item): item is DirectoryCategory => item !== "all").map((type) => <label key={type} className="directory-filters__option"><Checkbox state={categoryFilters.includes(type) ? "on" : "off"} onCheckedChange={() => toggleCategory(type)} label={type} /><span>{type}</span></label>)}
              </fieldset>
              <fieldset className="directory-filters__group">
                <legend>Supplier type</legend>
                {SUPPLIER_TYPES.map((type) => <label key={type} className="directory-filters__option"><Checkbox state={supplierTypes.includes(type) ? "on" : "off"} onCheckedChange={() => toggleSupplierType(type)} label={type} /><span>{type}</span></label>)}
              </fieldset>
            </div>
          ) : null}
        </div>
      </div>

      <div className="vendors-page__sheet">
        {rows.length === 0 ? (
          <EmptyState title={`No ${perspective} match these filters`} description={orgRole === "Member" ? "Members only see assigned vendor relationships." : "Try another vendor, service, category, location, or supplier type."} />
        ) : (
          <>
            {perspective === "vendors" ? (
              <DataSheet className="vendors-sheet vendors-sheet--vendors" aria-label="Vendors">
                <DataSheetHeader>
                  <DataSheetCell check><Checkbox state={headerState} onCheckedChange={toggleAll} label="Select all vendors" /></DataSheetCell>
                  <DataSheetCell>Vendor</DataSheetCell><DataSheetCell>Services offered</DataSheetCell><DataSheetCell>Location</DataSheetCell><DataSheetCell>Services</DataSheetCell><DataSheetCell>Status</DataSheetCell><DataSheetCell>Action</DataSheetCell>
                </DataSheetHeader>
                {vendorRows.map((row) => (
                  <DataSheetRow
                    key={row.vendor.id}
                    className="data-row--interactive"
                    role="link"
                    tabIndex={0}
                    aria-label={`Open ${row.vendor.name}`}
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("button, a, input, select, textarea")) return;
                      onOpenVendor(row.vendor.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpenVendor(row.vendor.id);
                      }
                    }}
                  >
                    <DataSheetCell check><Checkbox state={selected.includes(row.vendor.id) ? "on" : "off"} onCheckedChange={(state) => toggleRow(row.vendor.id, state)} label={`Select ${row.vendor.name}`} /></DataSheetCell>
                    <DataSheetCell><DirectoryEntity vendor={row.vendor} title={row.vendor.name} subtitle={row.vendor.code} match={row.matchedThrough ? `Matched through ${row.matchedThrough}` : undefined} onClick={() => onOpenVendor(row.vendor.id)} /></DataSheetCell>
                    <DataSheetCell>
                      <ServiceTypeList
                        compact
                        types={row.connections.map((connection) => serviceByDirectoryId(connection.serviceId)?.category).filter((value): value is DirectoryCategory => Boolean(value))}
                        ariaLabel={`Services offered by ${row.vendor.name}`}
                        className="directory-services-offered"
                      />
                    </DataSheetCell>
                    <DataSheetCell><span className="vendors-sheet__location"><IconPin size={14} />{row.vendor.location}</span></DataSheetCell>
                    <DataSheetCell><span className="directory-count">{new Set(row.connections.map((connection) => connection.serviceId)).size}</span></DataSheetCell>
                    <DataSheetCell><StatusChipWithDot tone={vendorStatusTone(row.vendor.status)}>{row.vendor.status}</StatusChipWithDot></DataSheetCell>
                    <DataSheetCell>{canEdit ? <div className="vendors-sheet__more" ref={menuId === row.vendor.id ? menuRef : undefined}><IconButton label={`More actions for ${row.vendor.name}`} aria-expanded={menuId === row.vendor.id} aria-haspopup="menu" onClick={() => setMenuId((current) => current === row.vendor.id ? null : row.vendor.id)}><IconMore /></IconButton>{menuId === row.vendor.id ? <div className="vendors-sheet__menu" role="menu"><button type="button" role="menuitem" onClick={() => { setEditId(row.vendor.id); setModal("edit"); setMenuId(null); }}>Edit vendor</button></div> : null}</div> : null}</DataSheetCell>
                  </DataSheetRow>
                ))}
              </DataSheet>
            ) : (
              <DataSheet className="vendors-sheet vendors-sheet--services" aria-label="Services">
                <DataSheetHeader>
                  <DataSheetCell check><Checkbox state={headerState} onCheckedChange={toggleAll} label="Select all services" /></DataSheetCell>
                  <DataSheetCell>Service</DataSheetCell><DataSheetCell>Service type</DataSheetCell><DataSheetCell>Location</DataSheetCell><DataSheetCell>Vendors</DataSheetCell><DataSheetCell>Status</DataSheetCell><DataSheetCell>Action</DataSheetCell>
                </DataSheetHeader>
                {serviceRows.map((row) => (
                  <DataSheetRow
                    key={row.service.id}
                    className="data-row--interactive"
                    role="link"
                    tabIndex={0}
                    aria-label={`Open ${row.service.name}`}
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("button, a, input, select, textarea")) return;
                      setOpenServiceId(row.service.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setOpenServiceId(row.service.id);
                      }
                    }}
                  >
                    <DataSheetCell check><Checkbox state={selected.includes(row.service.id) ? "on" : "off"} onCheckedChange={(state) => toggleRow(row.service.id, state)} label={`Select ${row.service.name}`} /></DataSheetCell>
                    <DataSheetCell><DirectoryEntity imageUrl={getVendorService(row.service.serviceId)?.imageUrl} imageAlt={`${row.service.name} primary view`} title={row.service.name} subtitle={row.service.category} match={row.providedBy ? `Provided by ${row.providedBy}` : undefined} onClick={() => setOpenServiceId(row.service.id)} /></DataSheetCell>
                    <DataSheetCell><ServiceTypeLabel type={row.service.category} /></DataSheetCell>
                    <DataSheetCell><span className="vendors-sheet__location"><IconPin size={14} />{row.service.location}</span></DataSheetCell>
                    <DataSheetCell><span className="directory-count">{new Set(row.connections.map((connection) => connection.vendorId)).size}</span></DataSheetCell>
                    <DataSheetCell><StatusChipWithDot tone={row.service.status === "Active" ? "done" : "progress"}>{row.service.status}</StatusChipWithDot></DataSheetCell>
                    <DataSheetCell>
                      <div
                        className="vendors-sheet__more"
                        ref={menuId === row.service.id ? menuRef : undefined}
                      >
                        <IconButton
                          label={`More actions for ${row.service.name}`}
                          aria-expanded={menuId === row.service.id}
                          aria-haspopup="menu"
                          onClick={() => setMenuId((current) => current === row.service.id ? null : row.service.id)}
                        >
                          <IconMore />
                        </IconButton>
                        {menuId === row.service.id ? (
                          <div className="vendors-sheet__menu" role="menu">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setOpenServiceId(row.service.id);
                                setMenuId(null);
                              }}
                            >
                              Open service
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </DataSheetCell>
                  </DataSheetRow>
                ))}
              </DataSheet>
            )}
            {selected.length > 0 ? <ListBulkBar label={`${selected.length} ${perspective === "vendors" ? "vendor" : "service"}${selected.length === 1 ? "" : "s"} selected`}><Button variant="brand" size="sm"><IconImport />Export</Button><Button variant="ghost" size="sm" onClick={() => setSelected([])}>Clear</Button></ListBulkBar> : null}
            <Pagination rangeLabel={`Showing 1–${rows.length} of ${rows.length} ${perspective}`} page={page} pageCount={1} onPageChange={setPage} />
          </>
        )}
      </div>

      <VendorFormModal
        mode="edit"
        open={modal === "edit"}
        vendor={editVendor}
        vendors={vendors}
        orgRole={orgRole}
        onClose={() => { setModal(null); setEditId(null); }}
        onCreated={() => {}}
        onUpdated={(updated) => { onVendorsChange(vendors.map((vendor) => vendor.id === updated.id ? updated : vendor)); setModal(null); setEditId(null); }}
        onViewExisting={onOpenVendor}
      />
    </div>
  );
}

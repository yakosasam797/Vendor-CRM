import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  FilterSelect,
  IconButton,
  LeadCell,
  Pagination,
  SearchField,
  StackCell,
  StackLine,
  StatusChip,
  TabBar,
  type CheckboxState,
  type TabItem,
} from "@paryatech/design-system";
import { DashboardDataSheetFill } from "./DashboardDataSheet";
import {
  SERVICE_STATUS_LABEL,
  SERVICE_STATUS_TONE,
  SERVICE_TYPE_FILTERS,
  servicesForVendor,
  type ServiceMedia,
  type VendorService,
} from "../data/services";
import {
  DIRECTORY_SERVICES,
  VENDOR_SERVICE_CONNECTIONS,
  directoryCategoryForServiceType,
  type DirectoryService,
  type VendorServiceConnection,
} from "../data/vendorDirectory";
import { VENDORS } from "../data/vendors";
import type { PageNavigationChange } from "../pageNavigation";
import {
  IconCard,
  IconCheck,
  IconClose,
  IconImage,
  IconMore,
  IconPencil,
  IconPin,
  IconPlay,
  IconPlus,
  IconTrash,
  IconWarn,
} from "../icons";
import { AnchoredImport } from "./AnchoredImport";
import { CreateVendorServicePage } from "./CreateVendorServicePage";
import { ServiceTestRate } from "./ServiceTestRate";
import { StatusChipWithDot } from "./StatusChipWithDot";
import { ServiceTypeLabel } from "./ServiceTypeLabel";
import "./ServicesPanel.css";

type MediaOpen = {
  service: VendorService;
  anchor: DOMRect;
};

function mediaKind(item: ServiceMedia): "image" | "video" {
  return item.kind === "video" ? "video" : "image";
}

function imageCount(media: ServiceMedia[]) {
  return media.filter((item) => mediaKind(item) === "image").length;
}

function positionPanel(anchor: DOMRect, width: number, height: number) {
  const gap = 10;
  const pad = 12;
  let left = anchor.right + gap;
  if (left + width > window.innerWidth - pad) {
    left = Math.max(pad, anchor.left - width - gap);
  }
  let top = anchor.top;
  if (top + height > window.innerHeight - pad) {
    top = Math.max(pad, window.innerHeight - pad - height);
  }
  const origin = left > anchor.left ? "top left" : "top right";
  return { left, top, origin };
}

function MediaThumb({
  service,
  onOpen,
}: {
  service: VendorService;
  onOpen: (anchor: DOMRect) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const images = imageCount(service.media);
  const primaryImage = service.media.find((item) => mediaKind(item) === "image");
  const additionalImages = Math.max(images - 1, 0);
  const countLabel = `${images} image${images === 1 ? "" : "s"}`;

  return (
    <button
      ref={btnRef}
      type="button"
      className="svc-media-cell"
      aria-label={`Open media for ${service.name}: ${countLabel}`}
      onClick={() => {
        const rect = btnRef.current?.getBoundingClientRect();
        if (rect) onOpen(rect);
      }}
    >
      <span className="svc-media-cell__preview" aria-hidden="true">
        <img
          className="svc-media-cell__image"
          src={primaryImage?.imageUrl ?? service.imageUrl}
          alt=""
          width={36}
          height={36}
          loading="lazy"
          decoding="async"
        />
        {additionalImages > 0 ? (
          <span className="svc-media-cell__count">+{additionalImages}</span>
        ) : null}
      </span>
    </button>
  );
}

function MediaPanel({
  open,
  onClose,
}: {
  open: MediaOpen;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0, origin: "top left" });

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const { offsetWidth: w, offsetHeight: h } = el;
    setPos(positionPanel(open.anchor, w, h));
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="svc-media-overlay" role="presentation" onClick={onClose}>
      <aside
        ref={panelRef}
        className="svc-media-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Media · ${open.service.name}`}
        style={{
          left: pos.left,
          top: pos.top,
          transformOrigin: pos.origin,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="svc-media-panel__head">
          <div className="svc-media-panel__headrow">
            <h2 className="svc-media-panel__title">{open.service.name}</h2>
            <IconButton label="Close media" onClick={onClose}>
              <IconClose />
            </IconButton>
          </div>
        </div>
        <div className="svc-media-panel__body">
          {open.service.media.length === 0 ? (
            <p className="svc-media-panel__empty">No media uploaded yet.</p>
          ) : (
            <ul className="svc-media-grid">
              {open.service.media.map((item) => (
                <li key={item.id}>
                  <MediaCard item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

function MediaCard({ item }: { item: ServiceMedia }) {
  const kind = mediaKind(item);
  return (
    <article className="svc-media-card">
      <div className="svc-media-card__shot-wrap">
        <img
          className="svc-media-card__shot"
          src={item.imageUrl}
          alt={item.imageAlt}
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
        />
        {kind === "video" ? (
          <span className="svc-media-card__play" aria-hidden="true">
            <IconPlay size={14} />
          </span>
        ) : null}
      </div>
      <div className="svc-media-card__meta">
        <div className="svc-media-card__title">{item.title}</div>
        <div className="svc-media-card__chips">
          <StatusChip tone="open">{kind === "video" ? "Video" : "Image"}</StatusChip>
          {item.usedInBanner ? (
            <StatusChip tone="progress">Banner</StatusChip>
          ) : null}
          {item.usedInPackages?.length ? (
            <StatusChip tone="open">
              {item.usedInPackages.length === 1
                ? `Package · ${item.usedInPackages[0]}`
                : `${item.usedInPackages.length} packages`}
            </StatusChip>
          ) : (
            <span className="svc-media-card__idle">Not linked to a package</span>
          )}
        </div>
      </div>
    </article>
  );
}

type ServiceDraft = {
  category: string;
  duration: string;
  ageSuitability: string;
  difficulty: string;
  seasonality: string;
  searchText: string;
  description: string;
  inclusions: string;
  exclusions: string;
};

function draftFromService(service: VendorService): ServiceDraft {
  return {
    ...service.profile,
    description: service.about,
    inclusions: service.inclusions.join("\n"),
    exclusions: service.profile.exclusions.join("\n"),
  };
}

function lines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function ServiceMediaImage({ item }: { item: ServiceMedia }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="svc-gallery__fallback" role="img" aria-label={item.imageAlt}>
        <IconImage size={20} />
        <span>Preview unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={item.imageUrl}
      alt={item.imageAlt}
      width={320}
      height={180}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

type ServiceDetailTab = "overview" | "test-service" | "test-price" | "rate-cards";

function VendorServiceTest({ service, vendorName }: { service: VendorService; vendorName: string }) {
  const checks = [
    {
      label: "Profile",
      description: "Required service details and search information are available.",
      passed: Boolean(service.name && service.location && service.about && service.profile.searchText),
    },
    {
      label: "Media",
      description: "At least one service image is available for proposals and packages.",
      passed: service.media.length > 0,
    },
    {
      label: "Price source",
      description: "A linked rate card is available for price testing.",
      passed: service.rateCards.length > 0,
    },
    {
      label: "Publishing status",
      description: "The service is available for operational use.",
      passed: service.status !== "draft",
    },
  ];
  const passedCount = checks.filter((check) => check.passed).length;
  const ready = passedCount === checks.length;

  return (
    <div className="svc-test-service">
      <section className="svc-test-service__summary" aria-labelledby="svc-test-service-title">
        <div>
          <p className="svc-test-service__eyebrow">Service test</p>
          <h2 id="svc-test-service-title">{ready ? "Ready to use" : "Needs attention"}</h2>
          <p>
            Validate that {service.name} from {vendorName} has everything needed before it is used
            in a booking or package.
          </p>
        </div>
        <StatusChipWithDot tone={ready ? "done" : "progress"}>
          {passedCount} of {checks.length} passed
        </StatusChipWithDot>
      </section>

      <div className="svc-test-service__checks">
        {checks.map((check) => (
          <article className="svc-test-service__check" key={check.label}>
            <span
              className={check.passed ? "svc-test-service__icon is-passed" : "svc-test-service__icon"}
              aria-hidden="true"
            >
              {check.passed ? <IconCheck size={16} /> : <IconWarn size={16} />}
            </span>
            <div>
              <h3>{check.label}</h3>
              <p>{check.description}</p>
            </div>
            <StatusChipWithDot tone={check.passed ? "done" : "progress"}>
              {check.passed ? "Passed" : "Review"}
            </StatusChipWithDot>
          </article>
        ))}
      </div>
    </div>
  );
}

function ServiceDetail({ service, vendorName, canEdit, initialTab = "overview", onOpenRateCard }: {
  service: VendorService;
  vendorName: string;
  canEdit: boolean;
  initialTab?: ServiceDetailTab;
  onOpenRateCard?: (id: string) => void;
}) {
  const [profile, setProfile] = useState<ServiceDraft>(() => draftFromService(service));
  const [draft, setDraft] = useState<ServiceDraft>(() => draftFromService(service));
  const [editing, setEditing] = useState(false);
  const [mediaItems, setMediaItems] = useState<ServiceMedia[]>(service.media);
  const [editingMedia, setEditingMedia] = useState(false);
  const [tab, setTab] = useState<ServiceDetailTab>(initialTab);
  const uploadRef = useRef<HTMLInputElement>(null);

  const detailFields = [
    { key: "category", label: "Category" },
    { key: "duration", label: "Duration" },
    { key: "ageSuitability", label: "Age suitability" },
    { key: "difficulty", label: "Difficulty" },
    { key: "seasonality", label: "Seasonality" },
  ] as const;

  const orderedMedia = [...mediaItems].sort(
    (a, b) => Number(Boolean(b.usedInBanner)) - Number(Boolean(a.usedInBanner)),
  );
  const tabs: TabItem[] = [
    { id: "overview", label: "Overview" },
    { id: "test-service", label: "Test service" },
    { id: "test-price", label: "Test price" },
    { id: "rate-cards", label: "Rate cards", count: service.rateCards.length },
  ];

  const directoryService = useMemo<DirectoryService>(() => {
    const existing = DIRECTORY_SERVICES.find((item) => item.serviceId === service.id);
    if (existing) return existing;
    return {
      id: service.id.replace(/^svc-/, ""),
      serviceId: service.id,
      profileVendorId: service.vendorId,
      name: service.name,
      category: directoryCategoryForServiceType(service.type) ?? "Activities",
      location: service.location,
      status: service.status === "draft" ? "Draft" : "Active",
    };
  }, [service]);

  const testPriceConnections = useMemo<VendorServiceConnection[]>(() => {
    const linked = VENDOR_SERVICE_CONNECTIONS.filter(
      (connection) =>
        connection.vendorId === service.vendorId && connection.serviceId === directoryService.id,
    );
    if (linked.length) return linked;
    return service.rateCards.map((rateCard, index) => ({
      id: `${service.vendorId}-${directoryService.id}-${index + 1}`,
      vendorId: service.vendorId,
      serviceId: directoryService.id,
      supplierType: "Direct supplier",
      productsCovered: service.details,
      rateCardId: rateCard.id,
      rateCardName: rateCard.name,
      validity: service.profile.seasonality,
      status: service.status === "draft" ? "Draft" : "Active",
    }));
  }, [directoryService.id, service]);

  const beginEditing = () => {
    setDraft(profile);
    setEditing(true);
  };

  const uploadMedia = (files: FileList | null) => {
    if (!files?.length) return;
    const selectedFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!selectedFiles.length) return;
    setMediaItems((current) => {
      const needsPrimary = !current.some((item) => item.usedInBanner);
      const additions = selectedFiles.map((file, index) => ({
        id: `upload-${Date.now()}-${index}`,
        title: file.name.replace(/\.[^.]+$/, ""),
        imageUrl: URL.createObjectURL(file),
        imageAlt: file.name.replace(/\.[^.]+$/, ""),
        kind: "image" as const,
        usedInBanner: needsPrimary && index === 0,
      }));
      return [...current, ...additions];
    });
    if (uploadRef.current) uploadRef.current.value = "";
  };

  const setPrimaryMedia = (id: string) => {
    setMediaItems((current) =>
      current.map((item) => ({ ...item, usedInBanner: item.id === id })),
    );
  };

  const removeMedia = (id: string) => {
    setMediaItems((current) => {
      const removed = current.find((item) => item.id === id);
      const remaining = current.filter((item) => item.id !== id);
      if (removed?.imageUrl.startsWith("blob:")) URL.revokeObjectURL(removed.imageUrl);
      if (removed?.usedInBanner && remaining[0]) {
        return remaining.map((item, index) => ({ ...item, usedInBanner: index === 0 }));
      }
      return remaining;
    });
  };

  return (
    <div className="service-directory-detail svc-vendor-detail">
      <header className="service-directory-detail__record">
        <div className="service-directory-detail__identity">
          {service.imageUrl ? (
            <img
              className="service-directory-detail__image"
              src={service.imageUrl}
              alt={service.imageAlt}
              width={72}
              height={72}
            />
          ) : (
            <span className="svc-vendor-detail__image-placeholder" aria-hidden="true">
              <IconImage size={20} />
            </span>
          )}
          <div className="service-directory-detail__identity-copy">
            <div className="service-directory-detail__title-row">
              <h1>{service.name}</h1>
              <StatusChipWithDot tone={SERVICE_STATUS_TONE[service.status]}>
                {SERVICE_STATUS_LABEL[service.status]}
              </StatusChipWithDot>
            </div>
            <p>
              <IconPin size={14} />
              {service.location}
              <span aria-hidden="true">·</span>
              <span className="pt-mono">{service.id.toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              {service.type}
            </p>
          </div>
        </div>
        <div className="service-directory-detail__aside">
          {canEdit ? (
            <Button variant="primary" size="sm" onClick={beginEditing}>
              <IconPencil />
              Edit service
            </Button>
          ) : null}
        </div>
      </header>

      <div className="service-directory-detail__tabs">
        <TabBar
          items={tabs}
          value={tab}
          onValueChange={(value) => setTab(value as ServiceDetailTab)}
          aria-label="Service sections"
        />
      </div>

      {tab === "overview" ? (
        <div className="service-overview svc-vendor-overview">
          <div className="service-detail-panels">
            <div className="service-detail-panels__layout">
              <section className="service-detail-panel" aria-labelledby="svc-profile-title">
                <div className="service-detail-panel__head">
                  <h2 id="svc-profile-title">Profile</h2>
                  {editing ? (
                    <div className="svc-section-head__actions">
                      <Button variant="brand" size="sm" onClick={() => { setDraft(profile); setEditing(false); }}>
                        Cancel
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => { setProfile(draft); setEditing(false); }}>
                        <IconCheck />
                        Save details
                      </Button>
                    </div>
                  ) : canEdit ? (
                    <Button variant="brand" size="sm" onClick={beginEditing}>
                      <IconPencil />
                      Edit details
                    </Button>
                  ) : null}
                </div>
                <div className="service-detail-panel__body">
                  <dl className="service-detail-profile">
                    <div className="service-detail-profile__field">
                      <dt>Service title</dt>
                      <dd>{service.name}</dd>
                    </div>
                    <div className="service-detail-profile__field">
                      <dt>Service ID</dt>
                      <dd className="pt-mono">{service.id.toUpperCase()}</dd>
                    </div>
                    <div className="service-detail-profile__field">
                      <dt>Status</dt>
                      <dd><StatusChipWithDot tone={SERVICE_STATUS_TONE[service.status]}>{SERVICE_STATUS_LABEL[service.status]}</StatusChipWithDot></dd>
                    </div>
                    <div className="service-detail-profile__field">
                      <dt>Category</dt>
                      <dd>{editing ? <input aria-label="Category" className="svc-profile__input" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /> : profile.category}</dd>
                    </div>
                    {detailFields.slice(1).map((field) => (
                      <div className="service-detail-profile__field" key={field.key}>
                        <dt>{field.label}</dt>
                        <dd>{editing ? <input aria-label={field.label} className="svc-profile__input" value={draft[field.key]} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} /> : profile[field.key]}</dd>
                      </div>
                    ))}
                    <div className="service-detail-profile__field">
                      <dt>Base location</dt>
                      <dd>{service.location}</dd>
                    </div>
                    <div className="service-detail-profile__field">
                      <dt>Search keywords</dt>
                      <dd>{editing ? <input aria-label="Search keywords" className="svc-profile__input" value={draft.searchText} onChange={(event) => setDraft({ ...draft, searchText: event.target.value })} /> : profile.searchText}</dd>
                    </div>
                    <div className="service-detail-profile__field service-detail-profile__field--wide">
                      <dt>Description</dt>
                      <dd>{editing ? <textarea aria-label="Description" className="svc-profile__input svc-profile__input--area" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /> : profile.description}</dd>
                    </div>
                    <div className="service-detail-profile__field">
                      <dt>Included</dt>
                      <dd>{editing ? <textarea aria-label="Included items" className="svc-profile__input svc-profile__input--area" value={draft.inclusions} onChange={(event) => setDraft({ ...draft, inclusions: event.target.value })} /> : lines(profile.inclusions).join(", ")}</dd>
                    </div>
                    <div className="service-detail-profile__field">
                      <dt>Excluded</dt>
                      <dd>{editing ? <textarea aria-label="Excluded items" className="svc-profile__input svc-profile__input--area" value={draft.exclusions} onChange={(event) => setDraft({ ...draft, exclusions: event.target.value })} /> : lines(profile.exclusions).join(", ")}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className="service-detail-panel" aria-labelledby="svc-media-title">
                <div className="service-detail-panel__head">
                  <h2 id="svc-media-title">Media</h2>
                  <span className="service-detail-panel__count pt-mono">
                    {mediaItems.length} image{mediaItems.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="service-detail-panel__body">
                  {orderedMedia.length === 0 ? (
                    <button type="button" className="svc-library__empty svc-vendor-media__empty" onClick={() => uploadRef.current?.click()} disabled={!canEdit}>
                      <IconImage size={22} />
                      <strong>No media uploaded</strong>
                      <span>Upload the first image to use it as the primary banner.</span>
                    </button>
                  ) : (
                    <ul className="service-detail-media">
                      {orderedMedia.map((item) => (
                        <li key={item.id} className={item.usedInBanner ? "is-primary" : undefined}>
                          <div className="service-detail-media__image-wrap">
                            <ServiceMediaImage item={item} />
                            {item.usedInBanner ? <span>Primary banner</span> : null}
                          </div>
                          <div className="svc-vendor-media__meta">
                            {editingMedia ? (
                              <input
                                className="svc-gallery__title-input"
                                value={item.title}
                                aria-label={`Media title for ${item.title}`}
                                onChange={(event) => setMediaItems((current) => current.map((media) => media.id === item.id ? { ...media, title: event.target.value } : media))}
                              />
                            ) : <p>{item.title}</p>}
                            {editingMedia ? (
                              <div className="svc-gallery__actions">
                                {!item.usedInBanner ? <button type="button" onClick={() => setPrimaryMedia(item.id)}>Set as primary</button> : null}
                                <IconButton label={`Remove ${item.title}`} onClick={() => removeMedia(item.id)}><IconTrash /></IconButton>
                              </div>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {canEdit ? (
                    <div className="service-detail-media__actions">
                      <Button variant="brand" size="sm" onClick={() => setEditingMedia((value) => !value)}>
                        <IconPencil />
                        {editingMedia ? "Done editing" : "Edit media"}
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => uploadRef.current?.click()}>
                        <IconPlus />
                        Upload media
                      </Button>
                      <input ref={uploadRef} className="svc-library__file" type="file" accept="image/*" multiple onChange={(event) => uploadMedia(event.target.files)} />
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : tab === "test-service" ? (
        <VendorServiceTest service={service} vendorName={vendorName} />
      ) : tab === "test-price" ? (
        <ServiceTestRate
          service={directoryService}
          connections={testPriceConnections}
          vendors={VENDORS}
          onOpenRateCard={(_vendorId, rateCardId) => onOpenRateCard?.(rateCardId)}
        />
      ) : (
        <div className="svc-vendor-rates">
          <section className="svc-linked-rates" aria-labelledby="svc-rates-title">
            <div className="svc-section-head">
              <div>
                <h2 id="svc-rates-title" className="svc-section-head__title">Linked rate cards</h2>
                <p className="svc-section-head__sub">Pricing records from {vendorName} that cover this service.</p>
              </div>
            </div>
            <div className="svc-rate-cards">
              {service.rateCards.length === 0 ? <p className="svc-detail__empty">No rate card linked yet.</p> : service.rateCards.map((rateCard) => (
                <button key={rateCard.id} type="button" className="svc-rate-card" onClick={() => onOpenRateCard?.(rateCard.id)}>
                  <span className="svc-rate-card__icon" aria-hidden="true"><IconCard size={16} /></span>
                  <span className="svc-rate-card__name">{rateCard.name}</span>
                  <span className="svc-rate-card__go">Open rate card</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export function ServicesPanel({
  vendorId = "exhosp",
  vendorName = "Example Hospitality",
  canEdit = false,
  openServiceId = null,
  onOpenServiceIdChange,
  onOpenRateCard,
  onNavigationContextChange,
}: {
  vendorId?: string;
  vendorName?: string;
  canEdit?: boolean;
  openServiceId?: string | null;
  onOpenServiceIdChange?: (id: string | null) => void;
  onOpenRateCard?: (id: string) => void;
  onNavigationContextChange?: PageNavigationChange;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [mediaOpen, setMediaOpen] = useState<MediaOpen | null>(null);
  const [serviceMenu, setServiceMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [openServiceTab, setOpenServiceTab] = useState<ServiceDetailTab>("overview");
  const [creatingService, setCreatingService] = useState(false);
  const [createdServices, setCreatedServices] = useState<VendorService[]>([]);

  const vendorServices = useMemo(
    () => [...servicesForVendor(vendorId), ...createdServices.filter((service) => service.vendorId === vendorId)],
    [createdServices, vendorId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendorServices.filter((svc) => {
      if (typeFilter !== "all" && svc.type !== typeFilter) return false;
      if (!q) return true;
      return (
        svc.name.toLowerCase().includes(q) ||
        svc.type.toLowerCase().includes(q) ||
        svc.details.toLowerCase().includes(q) ||
        svc.pricingLabel.toLowerCase().includes(q)
      );
    });
  }, [vendorServices, query, typeFilter]);

  const openService = openServiceId
    ? vendorServices.find((s) => s.id === openServiceId) ?? null
    : null;

  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === filtered.length && filtered.length > 0
        ? "on"
        : "indeterminate";

  const toggleAll = (state: CheckboxState) => {
    if (state === "on") setSelected(filtered.map((svc) => svc.id));
    else setSelected([]);
  };

  const toggleRow = (id: string, state: CheckboxState) => {
    setSelected((current) => {
      if (state === "on") return current.includes(id) ? current : [...current, id];
      return current.filter((item) => item !== id);
    });
  };

  const openServiceAt = (id: string, tab: ServiceDetailTab = "overview") => {
    setOpenServiceTab(tab);
    setServiceMenu(null);
    onOpenServiceIdChange?.(id);
  };

  if (creatingService) {
    return (
      <CreateVendorServicePage
        vendorId={vendorId}
        vendorName={vendorName}
        initialType={vendorServices[0]?.type ?? "Accommodation"}
        onCancel={() => setCreatingService(false)}
        onNavigationContextChange={onNavigationContextChange}
        onCreate={(service) => {
          setCreatedServices((current) => [...current, service]);
          setCreatingService(false);
          setOpenServiceTab("overview");
          onOpenServiceIdChange?.(service.id);
        }}
      />
    );
  }

  if (openService) {
    return (
      <ServiceDetail
        key={openService.id}
        service={openService}
        vendorName={vendorName}
        canEdit={canEdit}
        initialTab={openServiceTab}
        onOpenRateCard={onOpenRateCard}
      />
    );
  }

  return (
    <>
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
        <div className="vendor-page__actions">
          <AnchoredImport buttonLabel="Import services" />
          <Button variant="primary" size="sm" onClick={() => setCreatingService(true)}>
            <IconPlus />
            Add service
          </Button>
        </div>
      </div>

      <div className="vendor-page__sheet dashboard-table-end">
        <>
            <DataSheet className="services-sheet" aria-label="Services">
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
                <DataSheetCell className="services-sheet__action">Action</DataSheetCell>
              </DataSheetHeader>
              {filtered.map((svc) => (
                <DataSheetRow
                  key={svc.id}
                  className="data-row--interactive"
                  role="link"
                  tabIndex={0}
                  aria-label={`Open ${svc.name}`}
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest("button, a, input, select, textarea")) return;
                    openServiceAt(svc.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openServiceAt(svc.id);
                    }
                  }}
                >
                  <DataSheetCell check>
                    <Checkbox
                      state={selected.includes(svc.id) ? "on" : "off"}
                      onCheckedChange={(state) => toggleRow(svc.id, state)}
                      label={`Select ${svc.name}`}
                    />
                  </DataSheetCell>
                  <DataSheetCell>
                    <LeadCell
                      align="start"
                      icon={
                        svc.imageUrl ? (
                          <img
                            className="services-sheet__thumb"
                            src={svc.imageUrl}
                            alt={svc.imageAlt}
                            width={36}
                            height={36}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span className="services-sheet__thumb services-sheet__thumb--empty" aria-hidden="true">
                            <IconImage size={15} />
                          </span>
                        )
                      }
                      title={svc.name}
                      subtitle={svc.location}
                    />
                  </DataSheetCell>
                  <DataSheetCell>
                    <ServiceTypeLabel type={svc.type} />
                  </DataSheetCell>
                  <DataSheetCell>
                    <span className="services-sheet__details">{svc.details}</span>
                  </DataSheetCell>
                  <DataSheetCell>
                    <MediaThumb
                      service={svc}
                      onOpen={(anchor) => setMediaOpen({ service: svc, anchor })}
                    />
                  </DataSheetCell>
                  <DataSheetCell>
                    <StackCell>
                      <StackLine>{svc.pricingLabel}</StackLine>
                      <StackLine muted>
                        <span className="services-sheet__rate-count pt-mono">{svc.rateCardCount}</span>{" "}
                        Rate card{svc.rateCardCount === 1 ? "" : "s"}
                      </StackLine>
                    </StackCell>
                  </DataSheetCell>
                  <DataSheetCell>
                    <StatusChipWithDot tone={SERVICE_STATUS_TONE[svc.status]}>
                      {SERVICE_STATUS_LABEL[svc.status]}
                    </StatusChipWithDot>
                  </DataSheetCell>
                  <DataSheetCell className="services-sheet__action">
                    <div className="services-sheet__act">
                      <IconButton
                        label={`More actions for ${svc.name}`}
                        aria-haspopup="menu"
                        aria-expanded={serviceMenu?.id === svc.id}
                        onClick={(event) => {
                          const rect = event.currentTarget.getBoundingClientRect();
                          setServiceMenu((current) => current?.id === svc.id ? null : {
                            id: svc.id,
                            top: rect.bottom + 4,
                            left: Math.max(12, Math.min(window.innerWidth - 184, rect.right - 172)),
                          });
                        }}
                      >
                        <IconMore />
                      </IconButton>
                    </div>
                  </DataSheetCell>
                </DataSheetRow>
              ))}
              {filtered.length === 0 ? (
                <DataSheetRow className="services-sheet__empty-row">
                  <DataSheetCell className="services-sheet__empty-cell">
                    <div>
                      <strong>{vendorServices.length === 0 ? "No services added yet" : "No services match this search"}</strong>
                      <span>
                        {vendorServices.length === 0
                          ? "Use Add service to link the first service to this vendor."
                          : "Try another service name or clear the type filter."}
                      </span>
                    </div>
                  </DataSheetCell>
                </DataSheetRow>
              ) : null}
              <DashboardDataSheetFill columns={8} />
            </DataSheet>
            <Pagination
              rangeLabel={filtered.length ? `Showing 1–${filtered.length} of ${filtered.length} services` : "Showing 0 of 0 services"}
              page={page}
              pageCount={1}
              onPageChange={setPage}
            />
        </>
      </div>

      {serviceMenu ? createPortal(
        <div className="services-sheet__menu-overlay" role="presentation" onClick={() => setServiceMenu(null)}>
          <div
            className="services-sheet__menu"
            role="menu"
            aria-label={`Actions for ${vendorServices.find((service) => service.id === serviceMenu.id)?.name ?? "service"}`}
            style={{ top: serviceMenu.top, left: serviceMenu.left }}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" role="menuitem" onClick={() => openServiceAt(serviceMenu.id, "test-service")}>Test service</button>
            <button type="button" role="menuitem" onClick={() => openServiceAt(serviceMenu.id, "test-price")}>Test price</button>
            <button type="button" role="menuitem" onClick={() => openServiceAt(serviceMenu.id, "rate-cards")}>Open rate cards</button>
          </div>
        </div>,
        document.body,
      ) : null}

      {mediaOpen ? <MediaPanel open={mediaOpen} onClose={() => setMediaOpen(null)} /> : null}
    </>
  );
}

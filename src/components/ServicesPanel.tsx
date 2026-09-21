import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  StatusChip,
  type CheckboxState,
} from "@paryatech/design-system";
import {
  SERVICE_STATUS_LABEL,
  SERVICE_STATUS_TONE,
  SERVICE_TYPE_FILTERS,
  servicesForVendor,
  type ServiceMedia,
  type ServiceType,
  type VendorService,
} from "../data/services";
import {
  IconBed,
  IconCar,
  IconCard,
  IconCheck,
  IconClose,
  IconCompass,
  IconHotel,
  IconIdCard,
  IconImage,
  IconImport,
  IconEye,
  IconPencil,
  IconPin,
  IconPlane,
  IconPlay,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "../icons";
import { RecordHeader } from "./RecordHeader";
import { StatusChipWithDot } from "./StatusChipWithDot";
import { SheetLeadButton } from "./SheetLeadButton";
import "./ServicesPanel.css";

type MediaOpen = {
  service: VendorService;
  anchor: DOMRect;
};

function mediaKind(item: ServiceMedia): "image" | "video" {
  return item.kind === "video" ? "video" : "image";
}

function mediaCounts(media: ServiceMedia[]) {
  let images = 0;
  let videos = 0;
  for (const item of media) {
    if (mediaKind(item) === "video") videos += 1;
    else images += 1;
  }
  return { images, videos };
}

function typeIcon(type: ServiceType): ReactNode {
  switch (type) {
    case "Accommodation":
      return <IconHotel size={15} />;
    case "Activity":
      return <IconCompass size={15} />;
    case "Transport":
      return <IconCar size={15} />;
    case "Visa":
      return <IconIdCard size={15} />;
    case "Flights":
      return <IconPlane size={15} />;
    case "DMC/Ground handling":
      return <IconPin size={15} />;
    default:
      return <IconBed size={15} />;
  }
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
  const preview =
    service.media.find((m) => m.usedInBanner) ?? service.media[0];
  const { images, videos } = mediaCounts(service.media);
  const total = images + videos;
  const labelParts = [
    images > 0 ? `${images} image${images === 1 ? "" : "s"}` : null,
    videos > 0 ? `${videos} video${videos === 1 ? "" : "s"}` : null,
  ].filter(Boolean);
  const countLabel =
    total > 0 ? labelParts.join(" · ") : "No media";

  return (
    <button
      ref={btnRef}
      type="button"
      className="svc-media-cell"
      aria-label={
        total > 0
          ? `Open media for ${service.name}: ${countLabel}`
          : `Open media for ${service.name}`
      }
      onClick={() => {
        const rect = btnRef.current?.getBoundingClientRect();
        if (rect) onOpen(rect);
      }}
    >
      <span className="svc-media-cell__thumb" aria-hidden="true">
        {preview ? (
          <img
            className="svc-media-cell__img"
            src={preview.imageUrl}
            alt=""
            width={36}
            height={36}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="svc-media-cell__empty">—</span>
        )}
      </span>
      <span className="svc-media-cell__copy">
        <span className="svc-media-cell__count">{countLabel}</span>
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
          <p className="svc-media-panel__eyebrow">
            Services · {open.service.type}
          </p>
          <div className="svc-media-panel__headrow">
            <h2 className="svc-media-panel__title">{open.service.name}</h2>
            <IconButton label="Close media" onClick={onClose}>
              <IconClose />
            </IconButton>
          </div>
          <p className="svc-media-panel__sub">
            Images and videos for this service. Banner marks the asset used on packages.
          </p>
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

function ServiceDetail({ service, vendorName, canEdit, onOpenRateCard }: {
  service: VendorService;
  vendorName: string;
  canEdit: boolean;
  onOpenRateCard?: (id: string) => void;
}) {
  const [profile, setProfile] = useState<ServiceDraft>(() => draftFromService(service));
  const [draft, setDraft] = useState<ServiceDraft>(() => draftFromService(service));
  const [editing, setEditing] = useState(false);
  const [mediaItems, setMediaItems] = useState<ServiceMedia[]>(service.media);
  const [editingMedia, setEditingMedia] = useState(false);
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
    <div className="svc-detail">
      <RecordHeader
        title={service.name}
        tags={
          <StatusChipWithDot tone={SERVICE_STATUS_TONE[service.status]}>
            {SERVICE_STATUS_LABEL[service.status]}
          </StatusChipWithDot>
        }
        date={<span className="record-header__date"><IconPin size={13} />{service.location}</span>}
        recordId={service.id.toUpperCase()}
        idTip="Service ID"
        metaExtra={
          <span className="svc-detail__header-meta">
            <span>{service.type}</span>
            <span>Vendor <strong>{vendorName}</strong></span>
          </span>
        }
        aside={canEdit ? (
          <Button variant="primary" size="sm" onClick={beginEditing}>
            <IconPencil />
            Edit service
          </Button>
        ) : undefined}
      />

      <section className="svc-profile" aria-labelledby="svc-profile-title">
        <div className="svc-section-head">
          <div>
            <h2 id="svc-profile-title" className="svc-section-head__title">Service profile</h2>
            <p className="svc-section-head__sub">
              The information used when selecting, pricing, and presenting this service.
            </p>
          </div>
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

        <dl className="svc-profile__summary">
          <div><dt>Service type</dt><dd>{service.type}</dd></div>
          <div><dt>Status</dt><dd>{SERVICE_STATUS_LABEL[service.status]}</dd></div>
          <div>
            <dt>Search keywords</dt>
            <dd>{editing ? (
              <input aria-label="Search keywords" className="svc-profile__input" value={draft.searchText} onChange={(event) => setDraft({ ...draft, searchText: event.target.value })} />
            ) : profile.searchText}</dd>
          </div>
        </dl>

        <dl className="svc-profile__fields">
          <div><dt>Title</dt><dd>{service.name}</dd></div>
          {detailFields.map((field) => (
            <div key={field.key}>
              <dt>{field.label}</dt>
              <dd>{editing ? (
                <input aria-label={field.label} className="svc-profile__input" value={draft[field.key]} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} />
              ) : profile[field.key]}</dd>
            </div>
          ))}
          <div>
            <dt>Description</dt>
            <dd>{editing ? (
              <textarea aria-label="Description" className="svc-profile__input svc-profile__input--area" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            ) : profile.description}</dd>
          </div>
          <div>
            <dt>Included</dt>
            <dd>{editing ? (
              <textarea aria-label="Included items" className="svc-profile__input svc-profile__input--area" value={draft.inclusions} onChange={(event) => setDraft({ ...draft, inclusions: event.target.value })} />
            ) : <span className="svc-profile__inline-list">{lines(profile.inclusions).join(", ")}</span>}</dd>
          </div>
          <div>
            <dt>Excluded</dt>
            <dd>{editing ? (
              <textarea aria-label="Excluded items" className="svc-profile__input svc-profile__input--area" value={draft.exclusions} onChange={(event) => setDraft({ ...draft, exclusions: event.target.value })} />
            ) : <span className="svc-profile__inline-list">{lines(profile.exclusions).join(", ")}</span>}</dd>
          </div>
        </dl>
      </section>

      <section className="svc-library" aria-labelledby="svc-media-title">
        <div className="svc-section-head">
          <div>
            <h2 id="svc-media-title" className="svc-section-head__title">Media</h2>
            <p className="svc-section-head__sub">
              {mediaItems.length} image{mediaItems.length === 1 ? "" : "s"}. The primary image is used as the service banner.
            </p>
          </div>
          {canEdit ? (
            <div className="svc-section-head__actions">
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

        {orderedMedia.length === 0 ? (
          <button type="button" className="svc-library__empty" onClick={() => uploadRef.current?.click()} disabled={!canEdit}>
            <IconImage size={22} />
            <strong>No media uploaded</strong>
            <span>Upload the first image to use it as the primary banner.</span>
          </button>
        ) : (
          <ul className="svc-gallery">
            {orderedMedia.map((item) => (
              <li key={item.id} className={`svc-gallery__item${item.usedInBanner ? " svc-gallery__item--primary" : ""}`}>
                <div className="svc-gallery__image-wrap">
                  <ServiceMediaImage item={item} />
                  {item.usedInBanner ? <span className="svc-gallery__primary">Primary banner</span> : null}
                </div>
                <div className="svc-gallery__meta">
                  {editingMedia ? (
                    <input
                      className="svc-gallery__title-input"
                      value={item.title}
                      aria-label={`Media title for ${item.title}`}
                      onChange={(event) => setMediaItems((current) => current.map((media) => media.id === item.id ? { ...media, title: event.target.value } : media))}
                    />
                  ) : <span className="svc-gallery__title">{item.title}</span>}
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
      </section>

      <section className="svc-linked-rates" aria-labelledby="svc-rates-title">
        <div className="svc-section-head">
          <div>
            <h2 id="svc-rates-title" className="svc-section-head__title">Linked rate cards</h2>
            <p className="svc-section-head__sub">Pricing records that cover this service. Open a card to continue in Rate cards.</p>
          </div>
        </div>
        <div className="svc-rate-cards">
          {service.rateCards.length === 0 ? <p className="svc-detail__empty">No rate card linked yet.</p> : service.rateCards.map((rc) => (
            <button key={rc.id} type="button" className="svc-rate-card" onClick={() => onOpenRateCard?.(rc.id)}>
              <span className="svc-rate-card__icon" aria-hidden="true"><IconCard size={16} /></span>
              <span className="svc-rate-card__name">{rc.name}</span>
              <span className="svc-rate-card__go">Open rate card</span>
            </button>
          ))}
        </div>
      </section>
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
}: {
  vendorId?: string;
  vendorName?: string;
  canEdit?: boolean;
  openServiceId?: string | null;
  onOpenServiceIdChange?: (id: string | null) => void;
  onOpenRateCard?: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [mediaOpen, setMediaOpen] = useState<MediaOpen | null>(null);

  const vendorServices = useMemo(() => servicesForVendor(vendorId), [vendorId]);

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

  if (openService) {
    return (
      <ServiceDetail
        key={openService.id}
        service={openService}
        vendorName={vendorName}
        canEdit={canEdit}
        onOpenRateCard={onOpenRateCard}
      />
    );
  }

  return (
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
          <IconButton label="Refresh">
            <IconRefresh size={16} />
          </IconButton>
        </div>
        <div className="vendor-page__actions">
          <Button variant="brand" size="sm">
            <IconImport />
            Import services
          </Button>
          <Button variant="primary" size="sm">
            <IconPlus />
            Add service
          </Button>
        </div>
      </div>

      <div className="vendor-page__sheet">
        {filtered.length === 0 ? (
          <EmptyState
            title="No services match this filter"
            description="Try another name, or clear the type filter to see all services for this vendor."
          />
        ) : (
          <>
            <DataSheet className="services-sheet" aria-label="Services">
              <DataSheetHeader>
                <DataSheetCell check>
                  <Checkbox state={headerState} onCheckedChange={toggleAll} label="Select all services" />
                </DataSheetCell>
                <DataSheetCell>Service</DataSheetCell>
                <DataSheetCell>Type</DataSheetCell>
                <DataSheetCell>Important details</DataSheetCell>
                <DataSheetCell>Media</DataSheetCell>
                <DataSheetCell>Current pricing</DataSheetCell>
                <DataSheetCell>Status</DataSheetCell>
                <DataSheetCell className="services-sheet__action">Action</DataSheetCell>
              </DataSheetHeader>
              {filtered.map((svc) => (
                <DataSheetRow key={svc.id}>
                  <DataSheetCell check>
                    <Checkbox
                      state={selected.includes(svc.id) ? "on" : "off"}
                      onCheckedChange={(state) => toggleRow(svc.id, state)}
                      label={`Select ${svc.name}`}
                    />
                  </DataSheetCell>
                  <DataSheetCell>
                    <SheetLeadButton
                      label={`Open ${svc.name}`}
                      onClick={() => onOpenServiceIdChange?.(svc.id)}
                    >
                      <LeadCell
                        align="start"
                        icon={
                          <img
                            className="services-sheet__thumb"
                            src={svc.imageUrl}
                            alt={svc.imageAlt}
                            width={36}
                            height={36}
                            loading="lazy"
                            decoding="async"
                          />
                        }
                        title={svc.name}
                        subtitle={svc.location}
                      />
                    </SheetLeadButton>
                  </DataSheetCell>
                  <DataSheetCell>
                    <span className="services-sheet__type">
                      <span className="services-sheet__type-icon" aria-hidden="true">
                        {typeIcon(svc.type)}
                      </span>
                      {svc.type}
                    </span>
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
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={() => onOpenServiceIdChange?.(svc.id)}
                      >
                        <IconEye />
                        View
                      </Button>
                    </div>
                  </DataSheetCell>
                </DataSheetRow>
              ))}
            </DataSheet>
            <Pagination
              rangeLabel={`Showing 1–${filtered.length} of ${filtered.length} services`}
              page={page}
              pageCount={1}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {mediaOpen ? <MediaPanel open={mediaOpen} onClose={() => setMediaOpen(null)} /> : null}
    </>
  );
}

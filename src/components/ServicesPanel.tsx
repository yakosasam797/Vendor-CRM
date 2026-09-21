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
  IconClose,
  IconCompass,
  IconHotel,
  IconIdCard,
  IconImport,
  IconEye,
  IconPin,
  IconPlane,
  IconPlay,
  IconPlus,
  IconRefresh,
} from "../icons";
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

function ServiceDetail({
  service,
  onOpenRateCard,
}: {
  service: VendorService;
  onOpenRateCard?: (id: string) => void;
}) {
  const hero =
    service.media.find((m) => m.usedInBanner) ?? service.media[0] ?? null;
  const gallery = service.media.filter((m) => m.id !== hero?.id);

  return (
    <div className="svc-detail">
      <div className="svc-detail__hero">
        {hero ? (
          <img
            className="svc-detail__hero-img"
            src={hero.imageUrl}
            alt={hero.imageAlt}
            width={1200}
            height={520}
            decoding="async"
          />
        ) : (
          <div className="svc-detail__hero-empty">No primary image</div>
        )}
        <div className="svc-detail__hero-copy">
          <p className="svc-detail__eyebrow">
            {service.type} · {service.location}
          </p>
          <h2 className="svc-detail__title">{service.name}</h2>
          <p className="svc-detail__lede">{service.details}</p>
          <StatusChipWithDot tone={SERVICE_STATUS_TONE[service.status]}>
            {SERVICE_STATUS_LABEL[service.status]}
          </StatusChipWithDot>
        </div>
      </div>

      <div className="svc-detail__grid">
        <section className="svc-detail__section" aria-labelledby="svc-about">
          <h3 id="svc-about" className="svc-detail__section-title">
            About
          </h3>
          <p className="svc-detail__about">{service.about}</p>
        </section>

        <section className="svc-detail__section" aria-labelledby="svc-include">
          <h3 id="svc-include" className="svc-detail__section-title">
            Included
          </h3>
          <ul className="svc-detail__list">
            {service.inclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="svc-detail__section svc-detail__section--cards" aria-labelledby="svc-rc">
          <h3 id="svc-rc" className="svc-detail__section-title">
            Rate cards
          </h3>
          <p className="svc-detail__hint">
            Linked tariffs for this service — open a card to work rates.
          </p>
          <div className="svc-rate-cards">
            {service.rateCards.length === 0 ? (
              <p className="svc-detail__empty">No rate card linked yet.</p>
            ) : (
              service.rateCards.map((rc) => (
                <button
                  key={rc.id}
                  type="button"
                  className="svc-rate-card"
                  onClick={() => onOpenRateCard?.(rc.id)}
                >
                  <span className="svc-rate-card__icon" aria-hidden="true">
                    <IconCard size={16} />
                  </span>
                  <span className="svc-rate-card__name">{rc.name}</span>
                  <span className="svc-rate-card__go">Open</span>
                </button>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="svc-detail__gallery" aria-labelledby="svc-gallery">
        <h3 id="svc-gallery" className="svc-detail__section-title">
          Gallery
        </h3>
        {service.media.length === 0 ? (
          <p className="svc-detail__empty">No gallery images yet.</p>
        ) : (
          <ul className="svc-gallery">
            {(hero ? [hero, ...gallery] : gallery).map((item) => (
              <li key={item.id} className="svc-gallery__item">
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  width={320}
                  height={220}
                  loading="lazy"
                  decoding="async"
                />
                <div className="svc-gallery__meta">
                  <span className="svc-gallery__title">{item.title}</span>
                  {item.usedInBanner ? (
                    <StatusChip tone="progress">Primary</StatusChip>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function ServicesPanel({
  vendorId = "exhosp",
  openServiceId = null,
  onOpenServiceIdChange,
  onOpenRateCard,
}: {
  vendorId?: string;
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
        service={openService}
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

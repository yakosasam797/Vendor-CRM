import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  StackCell,
  StackLine,
  StatusChip,
  Tooltip,
  type CheckboxState,
} from "@paryatech/design-system";
import {
  SERVICE_STATUS_LABEL,
  SERVICE_STATUS_TONE,
  VENDOR_SERVICES,
  type ServiceMedia,
  type VendorService,
} from "../data/services";
import { IconClose, IconFilter, IconImage, IconImport, IconMore, IconPin, IconPlus, IconRefresh } from "../icons";
import { StatusChipWithDot } from "./StatusChipWithDot";
import "./ServicesPanel.css";

type MediaOpen = {
  service: VendorService;
  anchor: DOMRect;
};

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
  const hasBanner = service.media.some((m) => m.usedInBanner);

  return (
    <div className="svc-media-cell">
      <button
        ref={btnRef}
        type="button"
        className="svc-media-thumb"
        aria-label={`Open media for ${service.name}`}
        onClick={() => {
          const rect = btnRef.current?.getBoundingClientRect();
          if (rect) onOpen(rect);
        }}
      >
        <IconImage size={15} />
        {service.media.length > 0 ? (
          <span className="svc-media-thumb__count" aria-hidden="true">
            {service.media.length}
          </span>
        ) : null}
      </button>
      {hasBanner ? (
        <StatusChip tone="open" className="svc-media-banner-chip">
          Banner
        </StatusChip>
      ) : null}
    </div>
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
            Package imagery — banner assets feed package cards.
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
  return (
    <article className="svc-media-card">
      <div className={`svc-media-card__shot svc-media-card__shot--${item.tone}`} aria-hidden="true">
        <IconImage size={22} />
      </div>
      <div className="svc-media-card__meta">
        <div className="svc-media-card__title">{item.title}</div>
        <div className="svc-media-card__chips">
          {item.usedInBanner ? (
            <StatusChip tone="progress">Used in banner</StatusChip>
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

export function ServicesPanel() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [mediaOpen, setMediaOpen] = useState<MediaOpen | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VENDOR_SERVICES;
    return VENDOR_SERVICES.filter(
      (svc) =>
        svc.name.toLowerCase().includes(q) ||
        svc.type.toLowerCase().includes(q) ||
        svc.details.toLowerCase().includes(q) ||
        svc.pricingLabel.toLowerCase().includes(q),
    );
  }, [query]);

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
          <Tooltip tip="Filter">
            <IconButton label="Filter">
              <IconFilter />
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
            title="No services match this search"
            description="Try another service name, type, or detail."
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
                <DataSheetCell aria-hidden="true" />
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
                    <LeadCell icon={<IconPin />} title={svc.name} />
                  </DataSheetCell>
                  <DataSheetCell>
                    <span className="services-sheet__type">{svc.type}</span>
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
                  <DataSheetCell>
                    <IconButton label={`More actions for ${svc.name}`}>
                      <IconMore />
                    </IconButton>
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

import { useState } from "react";
import {
  Avatar,
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  EmptyState,
  LeadCell,
  Pagination,
  StackCell,
  StackLine,
  type CheckboxState,
} from "@paryatech/design-system";
import {
  ATTENTION_ITEMS,
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_TONE,
  COMMERCIAL_FACTS,
  KEY_CONTACTS,
  OPERATING_FACTS,
  SERVICE_COVERAGE,
  SNAPSHOT_METRICS,
  overviewBookingsPreview,
  type VendorBooking,
} from "../data/vendorOverview";
import {
  IconCalendar,
  IconMail,
  IconPhone,
  IconPin,
  IconWarn,
} from "../icons";
import { BookingViewModal } from "./BookingViewModal";
import { SheetLeadButton } from "./SheetLeadButton";
import { StatusChipWithDot } from "./StatusChipWithDot";
import { SummaryStrip } from "./SummaryStrip";
import { VendorSetupChecklist } from "./VendorSetupChecklist";
import "./VendorOverview.css";

/**
 * Vendor Overview — polished like Test rate: full-bleed parallel panels,
 * title-only section heads, open sheets (no nested cards).
 */
export function VendorOverview({
  vendor,
  flash,
  canEdit = false,
  onJumpTab,
  onEditProfile,
}: {
  vendor?: import("../data/vendors").Vendor;
  flash?: string | null;
  canEdit?: boolean;
  onJumpTab: (tab: string) => void;
  onEditProfile?: () => void;
}) {
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [bookingSelected, setBookingSelected] = useState<string[]>([]);
  const [bookingPage, setBookingPage] = useState(1);
  const [viewBooking, setViewBooking] = useState<VendorBooking | null>(null);
  const preview = overviewBookingsPreview(5);
  const contacts = showAllContacts ? KEY_CONTACTS : KEY_CONTACTS.slice(0, 4);

  const bookingHeaderState: CheckboxState =
    bookingSelected.length === 0
      ? "off"
      : bookingSelected.length === preview.length && preview.length > 0
        ? "on"
        : "indeterminate";

  return (
    <div className="vendor-overview">
      {vendor ? (
        <VendorSetupChecklist
          vendor={vendor}
          flash={flash}
          canEdit={canEdit}
          onJumpTab={onJumpTab}
          onEditProfile={() => onEditProfile?.()}
        />
      ) : flash ? (
        <div className="vendor-setup__flash" role="status" style={{ marginTop: 20 }}>
          {flash}
        </div>
      ) : null}

      {ATTENTION_ITEMS.length > 0 ? (
        <section className="vo-attention" aria-label="Attention required">
          <div className="vo-attention__icon" aria-hidden="true">
            <IconWarn size={16} />
          </div>
          <div className="vo-attention__body">
            <p className="vo-attention__lead">
              <strong>{ATTENTION_ITEMS.length} items need attention</strong>
            </p>
            <ul className="vo-attention__list">
              {ATTENTION_ITEMS.map((item, i) => (
                <li key={item.id}>
                  {i > 0 ? <span className="vo-attention__sep" aria-hidden="true"> · </span> : null}
                  <button
                    type="button"
                    className="vo-attention__link"
                    onClick={() => onJumpTab(item.tab)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <div className="vo-snapshot">
        <SummaryStrip
          title="Snapshot"
          columns={4}
          fields={SNAPSHOT_METRICS.map((m) => ({
            id: m.id,
            label: m.label,
            value: m.value,
            note: m.note,
            tone: m.tone,
            onClick: m.tab ? () => onJumpTab(m.tab!) : undefined,
          }))}
        />
      </div>

      {/* Pair 1 — services | contacts (Test rate layout language) */}
      <div className="vo-panels">
        <div className="vo-panels__layout">
          <section className="vo-panel" aria-labelledby="vo-coverage-title">
            <div className="vo-panel__head">
              <h2 id="vo-coverage-title" className="vo-panel__title">
                Services
              </h2>
              <Button variant="brand" size="sm" onClick={() => onJumpTab("services")}>
                View services
              </Button>
            </div>
            <div className="vo-panel__body">
              <DataSheet className="vo-coverage-sheet" aria-label="Services and coverage">
                <DataSheetHeader>
                  <DataSheetCell>Service</DataSheetCell>
                  <DataSheetCell>Coverage</DataSheetCell>
                  <DataSheetCell>Hubs</DataSheetCell>
                  <DataSheetCell>Season</DataSheetCell>
                </DataSheetHeader>
                {SERVICE_COVERAGE.map((row) => (
                  <DataSheetRow key={row.id}>
                  <DataSheetCell>
                    <SheetLeadButton
                      label={`Open ${row.service}`}
                      onClick={() => onJumpTab("services")}
                    >
                      <LeadCell
                        align="start"
                        icon={<IconPin size={15} />}
                        title={row.service}
                        subtitle={row.kind}
                      />
                    </SheetLeadButton>
                  </DataSheetCell>
                    <DataSheetCell>
                      <span className="vo-cell">{row.coverage}</span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="vo-cell">{row.hubs}</span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="vo-cell vo-cell--muted">{row.season}</span>
                    </DataSheetCell>
                  </DataSheetRow>
                ))}
              </DataSheet>
            </div>
          </section>

          <section className="vo-panel" aria-labelledby="vo-contacts-title">
            <div className="vo-panel__head">
              <h2 id="vo-contacts-title" className="vo-panel__title">
                Contacts
              </h2>
              <Button
                variant="brand"
                size="sm"
                onClick={() => setShowAllContacts((v) => !v)}
              >
                {showAllContacts ? "Show less" : "View all"}
              </Button>
            </div>
            <div className="vo-panel__body">
              <ul className="vo-contacts">
                {contacts.map((c) => (
                  <li key={c.id} className="vo-contact">
                    <div className="vo-contact__who">
                      <Avatar tone="pink" size={32}>
                        {c.initials}
                      </Avatar>
                      <div className="vo-contact__copy">
                        <div className="vo-contact__name">{c.name}</div>
                        <div className="vo-contact__role">{c.role}</div>
                      </div>
                    </div>
                    <div className="vo-contact__acts">
                      <a
                        className="vo-contact__act"
                        href={`tel:${c.phone.replace(/\s/g, "")}`}
                        aria-label={`Call ${c.name}`}
                      >
                        <IconPhone size={14} />
                        Call
                      </a>
                      <a
                        className="vo-contact__act"
                        href={`mailto:${c.email}`}
                        aria-label={`Email ${c.name}`}
                      >
                        <IconMail size={14} />
                        Email
                      </a>
                      {c.whatsapp ? (
                        <a
                          className="vo-contact__act"
                          href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`WhatsApp ${c.name}`}
                        >
                          WhatsApp
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>

      {/* Pair 2 — commercial | operating */}
      <div className="vo-panels">
        <div className="vo-panels__layout">
          <section className="vo-panel" aria-labelledby="vo-commercial-title">
            <div className="vo-panel__head">
              <h2 id="vo-commercial-title" className="vo-panel__title">
                Commercial
              </h2>
              <Button variant="brand" size="sm" onClick={() => onJumpTab("rate-cards")}>
                Open rate cards
              </Button>
            </div>
            <div className="vo-panel__body">
              <dl className="vo-facts vo-facts--grid">
                {COMMERCIAL_FACTS.map((f) => (
                  <div key={f.id} className="vo-facts__row">
                    <dt>{f.label}</dt>
                    <dd>
                      {f.tab ? (
                        <button
                          type="button"
                          className="vo-facts__link"
                          onClick={() => onJumpTab(f.tab!)}
                        >
                          {f.value}
                        </button>
                      ) : (
                        f.value
                      )}
                      {f.note ? <span className="vo-facts__note">{f.note}</span> : null}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="vo-panel" aria-labelledby="vo-ops-title">
            <div className="vo-panel__head">
              <h2 id="vo-ops-title" className="vo-panel__title">
                Operating
              </h2>
            </div>
            <div className="vo-panel__body">
              <dl className="vo-facts">
                {OPERATING_FACTS.map((f) => (
                  <div key={f.id} className="vo-facts__row">
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </div>
      </div>

      <section className="vendor-overview__section" aria-labelledby="vo-upcoming-title">
        <div className="vendor-overview__section-head">
          <h2 id="vo-upcoming-title" className="vendor-overview__title">
            Bookings
          </h2>
          <Button variant="brand" size="sm" onClick={() => onJumpTab("bookings")}>
            View all bookings
          </Button>
        </div>
        {preview.length === 0 ? (
          <EmptyState
            title="No upcoming bookings"
            description="When this vendor is on a trip, at-risk and upcoming stays show here."
          />
        ) : (
          <>
            <DataSheet className="vo-upcoming-sheet" aria-label="Upcoming and at-risk bookings">
              <DataSheetHeader>
                <DataSheetCell check>
                  <Checkbox
                    state={bookingHeaderState}
                    onCheckedChange={(state) =>
                      setBookingSelected(state === "on" ? preview.map((r) => r.id) : [])
                    }
                    label="Select all bookings"
                  />
                </DataSheetCell>
                <DataSheetCell>Booking</DataSheetCell>
                <DataSheetCell>Travel</DataSheetCell>
                <DataSheetCell>Service</DataSheetCell>
                <DataSheetCell>Amount</DataSheetCell>
                <DataSheetCell>Status</DataSheetCell>
                <DataSheetCell>Owner</DataSheetCell>
                <DataSheetCell className="vo-upcoming-sheet__action">Action</DataSheetCell>
              </DataSheetHeader>
              {preview.map((row) => (
                <DataSheetRow key={row.id}>
                  <DataSheetCell check>
                    <Checkbox
                      state={bookingSelected.includes(row.id) ? "on" : "off"}
                      onCheckedChange={(state) =>
                        setBookingSelected((cur) =>
                          state === "on"
                            ? cur.includes(row.id)
                              ? cur
                              : [...cur, row.id]
                            : cur.filter((id) => id !== row.id),
                        )
                      }
                      label={`Select ${row.title}`}
                    />
                  </DataSheetCell>
                  <DataSheetCell>
                    <SheetLeadButton
                      label={`Open ${row.title}`}
                      onClick={() => setViewBooking(row)}
                    >
                      <LeadCell
                        align="start"
                        icon={<IconPin size={15} />}
                        title={row.title}
                        subtitle={row.ref}
                      />
                    </SheetLeadButton>
                  </DataSheetCell>
                  <DataSheetCell>
                    <StackCell>
                      <StackLine mono>
                        <span className="vendor-bookings-sheet__travel">
                          <IconCalendar size={13} />
                          {row.travel}
                        </span>
                      </StackLine>
                      <StackLine muted>{row.party}</StackLine>
                    </StackCell>
                  </DataSheetCell>
                  <DataSheetCell>
                    <span className="vo-cell">{row.service}</span>
                  </DataSheetCell>
                  <DataSheetCell>
                    <span className="vo-cell pt-mono">{row.amount}</span>
                  </DataSheetCell>
                  <DataSheetCell>
                    <StatusChipWithDot tone={BOOKING_STATUS_TONE[row.status]}>
                      {BOOKING_STATUS_LABEL[row.status]}
                    </StatusChipWithDot>
                  </DataSheetCell>
                  <DataSheetCell>
                    <span className="vendor-bookings-sheet__owner">
                      <Avatar tone="pink" size={26}>
                        {row.ownerInitials}
                      </Avatar>
                      <span className="vendor-bookings-sheet__owner-name">{row.ownerName}</span>
                    </span>
                  </DataSheetCell>
                  <DataSheetCell className="vo-upcoming-sheet__action">
                    <Button variant="brand" size="sm" onClick={() => setViewBooking(row)}>
                      View
                    </Button>
                  </DataSheetCell>
                </DataSheetRow>
              ))}
            </DataSheet>
            <Pagination
              rangeLabel={`Showing 1–${preview.length} of ${preview.length} bookings`}
              page={bookingPage}
              pageCount={1}
              onPageChange={setBookingPage}
            />
          </>
        )}
      </section>

      <BookingViewModal
        open={viewBooking !== null}
        booking={viewBooking}
        onClose={() => setViewBooking(null)}
      />
    </div>
  );
}

import { useMemo, useState } from "react";
import {
  Avatar,
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
  Tooltip,
  type CheckboxState,
} from "@paryatech/design-system";
import {
  BOOKING_FINANCE_LABEL,
  BOOKING_FINANCE_TONE,
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_TONE,
  VENDOR_BOOKINGS,
  VENDOR_CONTACTS,
} from "../data/vendorOverview";
import {
  IconCalendar,
  IconFilter,
  IconPin,
  IconPlus,
} from "../icons";
import { StatusChipWithDot } from "./StatusChipWithDot";
import { VendorSetupChecklist } from "./VendorSetupChecklist";
import "./VendorOverview.css";

const PAGE_SIZE = 5;

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
  const [bookingQuery, setBookingQuery] = useState("");
  const [bookingSelected, setBookingSelected] = useState<string[]>([]);
  const [contactSelected, setContactSelected] = useState<string[]>([]);

  const bookings = useMemo(() => {
    const q = bookingQuery.trim().toLowerCase();
    if (!q) return VENDOR_BOOKINGS;
    return VENDOR_BOOKINGS.filter(
      (row) =>
        row.title.toLowerCase().includes(q) ||
        row.ref.toLowerCase().includes(q) ||
        row.service.toLowerCase().includes(q) ||
        row.ownerName.toLowerCase().includes(q),
    );
  }, [bookingQuery]);

  /* ND03 sheet footers: show a page slice, range “1–n of total”, pager chrome is only “1”. */
  const pagedBookings = bookings.slice(0, PAGE_SIZE);
  const bookingEnd = pagedBookings.length;
  const pagedContacts = VENDOR_CONTACTS.slice(0, PAGE_SIZE);
  const contactEnd = pagedContacts.length;

  const bookingHeader: CheckboxState =
    bookingSelected.length === 0
      ? "off"
      : bookingSelected.length === bookings.length && bookings.length > 0
        ? "on"
        : "indeterminate";

  const contactHeader: CheckboxState =
    contactSelected.length === 0
      ? "off"
      : contactSelected.length === VENDOR_CONTACTS.length
        ? "on"
        : "indeterminate";

  const toggleBookingAll = (state: CheckboxState) => {
    setBookingSelected(state === "on" ? bookings.map((r) => r.id) : []);
  };

  const toggleContactAll = (state: CheckboxState) => {
    setContactSelected(state === "on" ? VENDOR_CONTACTS.map((c) => c.id) : []);
  };

  const toggleBooking = (id: string, state: CheckboxState) => {
    setBookingSelected((current) =>
      state === "on"
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((item) => item !== id),
    );
  };

  const toggleContact = (id: string, state: CheckboxState) => {
    setContactSelected((current) =>
      state === "on"
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((item) => item !== id),
    );
  };

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

      <section className="vendor-overview__section" aria-labelledby="vendor-bookings-title">
        <div className="vendor-overview__section-head">
          <h2 id="vendor-bookings-title" className="vendor-overview__title">
            Bookings
          </h2>
        </div>

        <div className="vendor-overview__toolbar">
          <SearchField
            fullWidth
            value={bookingQuery}
            onChange={(event) => {
              setBookingQuery(event.target.value);
              setBookingSelected([]);
            }}
            placeholder="Search booking, service, or owner"
            aria-label="Search bookings from this vendor"
          />
          <div className="vendor-overview__tools">
            <Tooltip tip="Filter">
              <IconButton label="Filter bookings">
                <IconFilter />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="vendor-overview__sheet">
          {bookings.length === 0 ? (
            <EmptyState
              title="No bookings match this search"
              description="Try another booking name, reference, or service."
            />
          ) : (
            <>
              <DataSheet className="vendor-bookings-sheet" aria-label="Bookings from this vendor">
                <DataSheetHeader>
                  <DataSheetCell check>
                    <Checkbox
                      state={bookingHeader}
                      onCheckedChange={toggleBookingAll}
                      label="Select all bookings"
                    />
                  </DataSheetCell>
                  <DataSheetCell>Booking</DataSheetCell>
                  <DataSheetCell>Travel</DataSheetCell>
                  <DataSheetCell>Service</DataSheetCell>
                  <DataSheetCell>Status</DataSheetCell>
                  <DataSheetCell>Finance</DataSheetCell>
                  <DataSheetCell>Owner</DataSheetCell>
                  <DataSheetCell>Action</DataSheetCell>
                </DataSheetHeader>
                {pagedBookings.map((row) => (
                  <DataSheetRow key={row.id}>
                    <DataSheetCell check>
                      <Checkbox
                        state={bookingSelected.includes(row.id) ? "on" : "off"}
                        onCheckedChange={(state) => toggleBooking(row.id, state)}
                        label={`Select ${row.title}`}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <LeadCell
                        icon={<IconPin />}
                        title={row.title}
                        subtitle={row.ref}
                      />
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
                      <StackCell>
                        <StackLine>{row.service}</StackLine>
                        <StackLine muted>{row.serviceDetail}</StackLine>
                      </StackCell>
                    </DataSheetCell>
                    <DataSheetCell>
                      <StatusChipWithDot tone={BOOKING_STATUS_TONE[row.status]}>
                        {BOOKING_STATUS_LABEL[row.status]}
                      </StatusChipWithDot>
                    </DataSheetCell>
                    <DataSheetCell>
                      <StackCell>
                        <StackLine mono>{row.amount}</StackLine>
                        <StatusChipWithDot tone={BOOKING_FINANCE_TONE[row.finance]}>
                          {BOOKING_FINANCE_LABEL[row.finance]}
                        </StatusChipWithDot>
                      </StackCell>
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="vendor-bookings-sheet__owner">
                        <Avatar tone="pink" size={26}>
                          {row.ownerInitials}
                        </Avatar>
                        <span className="vendor-bookings-sheet__owner-name">{row.ownerName}</span>
                      </span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <Button variant="brand" size="sm">
                        Open
                      </Button>
                    </DataSheetCell>
                  </DataSheetRow>
                ))}
              </DataSheet>
              <Pagination
                rangeLabel={
                  bookingEnd === 0
                    ? "Showing 0 of 0"
                    : `Showing 1–${bookingEnd} of ${bookings.length}`
                }
                page={1}
                pageCount={1}
                onPageChange={() => undefined}
              />
            </>
          )}
        </div>
      </section>

      <section className="vendor-overview__section" aria-labelledby="vendor-contacts-title">
        <div className="vendor-overview__section-head">
          <h2 id="vendor-contacts-title" className="vendor-overview__title">
            Contacts
          </h2>
          <Button variant="brand" size="sm">
            <IconPlus />
            Add contact
          </Button>
        </div>

        <div className="vendor-overview__sheet">
          <DataSheet className="vendor-contacts-sheet" aria-label="Vendor contacts">
            <DataSheetHeader>
              <DataSheetCell check>
                <Checkbox
                  state={contactHeader}
                  onCheckedChange={toggleContactAll}
                  label="Select all contacts"
                />
              </DataSheetCell>
              <DataSheetCell>Contact</DataSheetCell>
              <DataSheetCell>Role</DataSheetCell>
              <DataSheetCell>Property</DataSheetCell>
              <DataSheetCell>Phone</DataSheetCell>
              <DataSheetCell>Email</DataSheetCell>
              <DataSheetCell>Action</DataSheetCell>
            </DataSheetHeader>
            {pagedContacts.map((contact) => (
              <DataSheetRow key={contact.id}>
                <DataSheetCell check>
                  <Checkbox
                    state={contactSelected.includes(contact.id) ? "on" : "off"}
                    onCheckedChange={(state) => toggleContact(contact.id, state)}
                    label={`Select ${contact.name}`}
                  />
                </DataSheetCell>
                <DataSheetCell>
                  <LeadCell
                    icon={
                      <Avatar tone="pink" size={32}>
                        {contact.initials}
                      </Avatar>
                    }
                    title={contact.name}
                    subtitle={contact.primary ? "Primary" : undefined}
                  />
                </DataSheetCell>
                <DataSheetCell>
                  <span className="vendor-contacts-sheet__text">{contact.role}</span>
                </DataSheetCell>
                <DataSheetCell>
                  <span className="vendor-contacts-sheet__text">{contact.property}</span>
                </DataSheetCell>
                <DataSheetCell>
                  <a
                    className="vendor-contacts-sheet__link"
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    title={contact.phone}
                  >
                    {contact.phone}
                  </a>
                </DataSheetCell>
                <DataSheetCell>
                  <a
                    className="vendor-contacts-sheet__link"
                    href={`mailto:${contact.email}`}
                    title={contact.email}
                  >
                    {contact.email}
                  </a>
                </DataSheetCell>
                <DataSheetCell>
                  <Button variant="brand" size="sm">
                    Message
                  </Button>
                </DataSheetCell>
              </DataSheetRow>
            ))}
          </DataSheet>
          <Pagination
            rangeLabel={
              contactEnd === 0
                ? "Showing 0 of 0"
                : `Showing 1–${contactEnd} of ${VENDOR_CONTACTS.length}`
            }
            page={1}
            pageCount={1}
            onPageChange={() => undefined}
          />
        </div>
      </section>
    </div>
  );
}

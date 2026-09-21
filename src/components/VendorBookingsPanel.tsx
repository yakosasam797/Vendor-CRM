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
  ListBulkBar,
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
} from "../data/vendorOverview";
import { IconCalendar, IconFilter, IconImport, IconPin } from "../icons";
import { BookingViewModal } from "./BookingViewModal";
import { SheetLeadButton } from "./SheetLeadButton";
import { StatusChipWithDot } from "./StatusChipWithDot";
import "./VendorOverview.css";

/**
 * Full searchable bookings table for this vendor — lives on the Bookings tab.
 */
export function VendorBookingsPanel() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [viewBooking, setViewBooking] = useState<(typeof VENDOR_BOOKINGS)[number] | null>(null);

  const bookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VENDOR_BOOKINGS;
    return VENDOR_BOOKINGS.filter(
      (row) =>
        row.title.toLowerCase().includes(q) ||
        row.ref.toLowerCase().includes(q) ||
        row.service.toLowerCase().includes(q) ||
        row.ownerName.toLowerCase().includes(q),
    );
  }, [query]);

  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === bookings.length && bookings.length > 0
        ? "on"
        : "indeterminate";

  return (
    <div className="vendor-bookings-panel">
      <div className="vendor-overview__toolbar">
        <SearchField
          fullWidth
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected([]);
            setPage(1);
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
                    state={headerState}
                    onCheckedChange={(state) =>
                      setSelected(state === "on" ? bookings.map((r) => r.id) : [])
                    }
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
              {bookings.map((row) => (
                <DataSheetRow key={row.id}>
                  <DataSheetCell check>
                    <Checkbox
                      state={selected.includes(row.id) ? "on" : "off"}
                      onCheckedChange={(state) =>
                        setSelected((cur) =>
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
                      <LeadCell icon={<IconPin />} title={row.title} subtitle={row.ref} />
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
                    <Button variant="brand" size="sm" onClick={() => setViewBooking(row)}>
                      View
                    </Button>
                  </DataSheetCell>
                </DataSheetRow>
              ))}
            </DataSheet>
            {selected.length > 0 ? (
              <ListBulkBar
                label={`${selected.length} booking${selected.length === 1 ? "" : "s"} selected`}
              >
                <Button variant="brand" size="sm">
                  <IconImport />
                  Export
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                  Clear
                </Button>
              </ListBulkBar>
            ) : null}
            <Pagination
              rangeLabel={`Showing 1–${bookings.length} of ${bookings.length}`}
              page={page}
              pageCount={1}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <BookingViewModal
        open={viewBooking !== null}
        booking={viewBooking}
        onClose={() => setViewBooking(null)}
      />
    </div>
  );
}

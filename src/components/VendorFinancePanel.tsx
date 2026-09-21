import { useMemo, useState } from "react";
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
  Tooltip,
  type CheckboxState,
} from "@paryatech/design-system";
import {
  FINANCE_METRICS,
  PAYABLE_ACTION_LABEL,
  PAYABLE_STATUS_LABEL,
  PAYABLE_STATUS_TONE,
  PAYABLES,
} from "../data/vendorFinance";
import {
  IconCalendar,
  IconCard,
  IconDownload,
  IconFilter,
  IconPin,
  IconPlus,
  IconWarn,
} from "../icons";
import { StatusChipWithDot } from "./StatusChipWithDot";
import { SummaryStrip } from "./SummaryStrip";
import "./VendorFinancePanel.css";

const METRIC_ICONS = {
  billed: <IconCard size={15} />,
  settled: <IconCard size={15} />,
  outstanding: <IconCard size={15} />,
  overdue: <IconWarn size={15} />,
  "credit-limit": <IconCard size={15} />,
  headroom: <IconCard size={15} />,
  advance: <IconCard size={15} />,
  margin: <IconCard size={15} />,
} as const;

export function VendorFinancePanel() {
  const [payQuery, setPayQuery] = useState("");
  const [paySelected, setPaySelected] = useState<string[]>([]);
  const [payPage, setPayPage] = useState(1);

  const payables = useMemo(() => {
    const q = payQuery.trim().toLowerCase();
    if (!q) return PAYABLES;
    return PAYABLES.filter(
      (row) =>
        row.invoice.toLowerCase().includes(q) ||
        row.booking.toLowerCase().includes(q) ||
        row.bookingDetail.toLowerCase().includes(q),
    );
  }, [payQuery]);

  const payHeader: CheckboxState =
    paySelected.length === 0
      ? "off"
      : paySelected.length === payables.length && payables.length > 0
        ? "on"
        : "indeterminate";

  const togglePayAll = (state: CheckboxState) => {
    setPaySelected(state === "on" ? payables.map((r) => r.id) : []);
  };

  const togglePay = (id: string, state: CheckboxState) => {
    setPaySelected((current) =>
      state === "on"
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((item) => item !== id),
    );
  };

  return (
    <div className="vendor-finance">
      <SummaryStrip
        title="Finance summary"
        columns={4}
        actions={
          <Button variant="brand" size="sm">
            Statement of account
          </Button>
        }
        fields={FINANCE_METRICS.map((metric) => ({
          id: metric.id,
          label: metric.label,
          value: metric.value,
          note: metric.note,
          tone: metric.tone,
          icon: METRIC_ICONS[metric.id as keyof typeof METRIC_ICONS],
        }))}
      />

      <section className="vendor-finance__section" aria-labelledby="payables-title">
        <div className="vendor-finance__section-head">
          <h2 id="payables-title" className="vendor-finance__title">
            Payables
          </h2>
        </div>

        <div className="vendor-finance__toolbar">
          <SearchField
            fullWidth
            value={payQuery}
            onChange={(event) => {
              setPayQuery(event.target.value);
              setPayPage(1);
              setPaySelected([]);
            }}
            placeholder="Search invoice or booking"
            aria-label="Search invoice or booking"
          />
          <div className="vendor-finance__tools">
            <Tooltip tip="Filter">
              <IconButton label="Filter payables">
                <IconFilter />
              </IconButton>
            </Tooltip>
            <Button variant="brand" size="sm">
              <IconDownload />
              Export
            </Button>
            <Button variant="primary" size="sm">
              <IconPlus />
              Record payment
            </Button>
          </div>
        </div>

        <div className="vendor-finance__sheet">
          {payables.length === 0 ? (
            <EmptyState
              title="No invoices match this search"
              description="Try another invoice number or booking name."
            />
          ) : (
            <>
              <DataSheet className="payables-sheet" aria-label="Payables">
                <DataSheetHeader>
                  <DataSheetCell check>
                    <Checkbox
                      state={payHeader}
                      onCheckedChange={togglePayAll}
                      label="Select all invoices"
                    />
                  </DataSheetCell>
                  <DataSheetCell>Invoice</DataSheetCell>
                  <DataSheetCell>Against booking</DataSheetCell>
                  <DataSheetCell>Invoiced</DataSheetCell>
                  <DataSheetCell>Due</DataSheetCell>
                  <DataSheetCell>Amount</DataSheetCell>
                  <DataSheetCell>Status</DataSheetCell>
                  <DataSheetCell>Action</DataSheetCell>
                </DataSheetHeader>
                {payables.map((row) => (
                  <DataSheetRow key={row.id}>
                    <DataSheetCell check>
                      <Checkbox
                        state={paySelected.includes(row.id) ? "on" : "off"}
                        onCheckedChange={(state) => togglePay(row.id, state)}
                        label={`Select ${row.invoice}`}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <LeadCell
                        icon={<IconCard size={15} />}
                        title={row.invoice}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <LeadCell
                        align="start"
                        icon={<IconPin size={15} />}
                        title={row.booking}
                        subtitle={row.bookingDetail}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="payables-sheet__date">
                        <IconCalendar size={13} />
                        {row.invoiced}
                      </span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <span
                        className={
                          row.dueTone === "bad"
                            ? "payables-sheet__date payables-sheet__date--bad"
                            : row.dueTone === "warn"
                              ? "payables-sheet__date payables-sheet__date--warn"
                              : "payables-sheet__date"
                        }
                      >
                        <IconCalendar size={13} />
                        {row.due}
                      </span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <StackCell>
                        <StackLine mono>{row.amount}</StackLine>
                        <StackLine muted>
                          <span
                            className={
                              row.balanceTone === "bad"
                                ? "payables-sheet__bal--bad"
                                : row.balanceTone === "warn"
                                  ? "payables-sheet__bal--warn"
                                  : undefined
                            }
                          >
                            {row.balance}
                          </span>
                        </StackLine>
                      </StackCell>
                    </DataSheetCell>
                    <DataSheetCell>
                      <StatusChipWithDot tone={PAYABLE_STATUS_TONE[row.status]}>
                        {PAYABLE_STATUS_LABEL[row.status]}
                      </StatusChipWithDot>
                    </DataSheetCell>
                    <DataSheetCell>
                      <Button
                        variant={row.action === "pay-now" ? "primary" : "brand"}
                        size="sm"
                      >
                        {PAYABLE_ACTION_LABEL[row.action]}
                      </Button>
                    </DataSheetCell>
                  </DataSheetRow>
                ))}
              </DataSheet>
              <Pagination
                rangeLabel={`Showing 1–${payables.length} of ${payables.length} invoices`}
                page={payPage}
                pageCount={1}
                onPageChange={setPayPage}
              />
            </>
          )}
        </div>
      </section>

    </div>
  );
}

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
  COMPLIANCE_DOCS,
  DOC_ACTION_LABEL,
  DOC_STATUS_TONE,
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
  IconFile,
  IconFilter,
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
  const [docQuery, setDocQuery] = useState("");
  const [paySelected, setPaySelected] = useState<string[]>([]);
  const [docSelected, setDocSelected] = useState<string[]>([]);
  const [payPage, setPayPage] = useState(1);
  const [docPage, setDocPage] = useState(1);

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

  const docs = useMemo(() => {
    const q = docQuery.trim().toLowerCase();
    if (!q) return COMPLIANCE_DOCS;
    return COMPLIANCE_DOCS.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.file.toLowerCase().includes(q) ||
        row.reference.toLowerCase().includes(q),
    );
  }, [docQuery]);

  const payHeader: CheckboxState =
    paySelected.length === 0
      ? "off"
      : paySelected.length === payables.length && payables.length > 0
        ? "on"
        : "indeterminate";

  const docHeader: CheckboxState =
    docSelected.length === 0
      ? "off"
      : docSelected.length === docs.length && docs.length > 0
        ? "on"
        : "indeterminate";

  const togglePayAll = (state: CheckboxState) => {
    setPaySelected(state === "on" ? payables.map((r) => r.id) : []);
  };

  const toggleDocAll = (state: CheckboxState) => {
    setDocSelected(state === "on" ? docs.map((r) => r.id) : []);
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

  const toggleDoc = (id: string, state: CheckboxState) => {
    setDocSelected((current) =>
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
                      <span className="payables-sheet__invoice pt-mono">{row.invoice}</span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <StackCell>
                        <StackLine>{row.booking}</StackLine>
                        <StackLine muted>{row.bookingDetail}</StackLine>
                      </StackCell>
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

      <section className="vendor-finance__section" aria-labelledby="docs-title">
        <div className="vendor-finance__section-head">
          <h2 id="docs-title" className="vendor-finance__title">
            Compliance documents
          </h2>
        </div>

        <div className="vendor-finance__toolbar">
          <SearchField
            fullWidth
            value={docQuery}
            onChange={(event) => {
              setDocQuery(event.target.value);
              setDocPage(1);
              setDocSelected([]);
            }}
            placeholder="Search document"
            aria-label="Search document"
          />
          <div className="vendor-finance__tools">
            <Tooltip tip="Filter">
              <IconButton label="Filter documents">
                <IconFilter />
              </IconButton>
            </Tooltip>
            <Button variant="brand" size="sm">
              Request documents
            </Button>
            <Button variant="primary" size="sm">
              <IconPlus />
              Upload file
            </Button>
          </div>
        </div>

        <div className="vendor-finance__sheet">
          {docs.length === 0 ? (
            <EmptyState
              title="No documents match this search"
              description="Try another document name or reference."
            />
          ) : (
            <>
              <DataSheet className="docs-sheet" aria-label="Compliance documents">
                <DataSheetHeader>
                  <DataSheetCell check>
                    <Checkbox
                      state={docHeader}
                      onCheckedChange={toggleDocAll}
                      label="Select all documents"
                    />
                  </DataSheetCell>
                  <DataSheetCell>Document</DataSheetCell>
                  <DataSheetCell>Reference</DataSheetCell>
                  <DataSheetCell>Valid to</DataSheetCell>
                  <DataSheetCell>Owner</DataSheetCell>
                  <DataSheetCell>Status</DataSheetCell>
                  <DataSheetCell>Action</DataSheetCell>
                </DataSheetHeader>
                {docs.map((row) => (
                  <DataSheetRow key={row.id}>
                    <DataSheetCell check>
                      <Checkbox
                        state={docSelected.includes(row.id) ? "on" : "off"}
                        onCheckedChange={(state) => toggleDoc(row.id, state)}
                        label={`Select ${row.name}`}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <LeadCell
                        icon={<IconFile size={15} />}
                        title={row.name}
                        subtitle={row.file}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="docs-sheet__ref pt-mono">{row.reference}</span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <span
                        className={
                          row.validTone === "warn"
                            ? "docs-sheet__valid docs-sheet__valid--warn"
                            : "docs-sheet__valid"
                        }
                      >
                        {row.validTo}
                      </span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="docs-sheet__owner">
                        <Avatar tone="pink" size={26}>
                          {row.ownerInitials}
                        </Avatar>
                        {row.ownerName}
                      </span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <StatusChipWithDot tone={DOC_STATUS_TONE[row.status]}>
                        {row.statusLabel}
                      </StatusChipWithDot>
                    </DataSheetCell>
                    <DataSheetCell>
                      <Button
                        variant={row.action === "request-renewal" ? "primary" : "brand"}
                        size="sm"
                      >
                        {DOC_ACTION_LABEL[row.action]}
                      </Button>
                    </DataSheetCell>
                  </DataSheetRow>
                ))}
              </DataSheet>
              <Pagination
                rangeLabel={`Showing 1–${docs.length} of ${docs.length} documents`}
                page={docPage}
                pageCount={1}
                onPageChange={setDocPage}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

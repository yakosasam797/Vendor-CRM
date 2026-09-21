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
  PACKAGE_STATUS_LABEL,
  PACKAGE_STATUS_TONE,
  VENDOR_PACKAGES,
  packageStats,
} from "../data/packages";
import { IconFilter, IconMore, IconPackages, IconPlus } from "../icons";
import { StatusChipWithDot } from "./StatusChipWithDot";
import "./PackagesPanel.css";

/**
 * Vendor Packages tab — ND03 sheet language (booking DataSheet).
 * Sheet columns sized to fit the workspace without horizontal scroll.
 */
export function PackagesPanel() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const stats = packageStats();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VENDOR_PACKAGES;
    return VENDOR_PACKAGES.filter((pkg) => {
      const hay = `${pkg.name} ${pkg.detail} ${pkg.services} ${pkg.pricedFrom}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === filtered.length && filtered.length > 0
        ? "on"
        : "indeterminate";

  const toggleAll = (state: CheckboxState) => {
    setSelected(state === "on" ? filtered.map((p) => p.id) : []);
  };

  const toggleRow = (id: string, state: CheckboxState) => {
    setSelected((cur) =>
      state === "on" ? (cur.includes(id) ? cur : [...cur, id]) : cur.filter((x) => x !== id),
    );
  };

  return (
    <div className="packages-panel">
      <div className="packages-panel__head">
        <p className="packages-panel__meta pt-mono">
          {stats.live} live · {stats.reprice} need re-pricing
        </p>
      </div>

      <div className="packages-panel__toolbar">
        <SearchField
          fullWidth
          className="packages-panel__search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
            setSelected([]);
          }}
          placeholder="Search package name"
          aria-label="Search package name"
        />
        <div className="packages-panel__tools">
          <Tooltip tip="Filter">
            <IconButton label="Filter packages">
              <IconFilter />
            </IconButton>
          </Tooltip>
          <Button variant="primary" size="sm">
            <IconPlus />
            Build package
          </Button>
        </div>
      </div>

      <div className="packages-panel__sheet">
        {filtered.length === 0 ? (
          <EmptyState
            title="No packages match this search"
            description="Try another package name or service."
          />
        ) : (
          <>
            <DataSheet className="packages-sheet" aria-label="Packages">
              <DataSheetHeader>
                <DataSheetCell check>
                  <Checkbox
                    state={headerState}
                    onCheckedChange={toggleAll}
                    label="Select all packages"
                  />
                </DataSheetCell>
                <DataSheetCell>Package</DataSheetCell>
                <DataSheetCell>Services</DataSheetCell>
                <DataSheetCell>Priced from</DataSheetCell>
                <DataSheetCell>Sell</DataSheetCell>
                <DataSheetCell>Status</DataSheetCell>
                <DataSheetCell>Action</DataSheetCell>
              </DataSheetHeader>
              {filtered.map((pkg) => (
                <DataSheetRow key={pkg.id}>
                  <DataSheetCell check>
                    <Checkbox
                      state={selected.includes(pkg.id) ? "on" : "off"}
                      onCheckedChange={(state) => toggleRow(pkg.id, state)}
                      label={`Select ${pkg.name}`}
                    />
                  </DataSheetCell>
                  <DataSheetCell>
                    <LeadCell
                      align="start"
                      icon={<IconPackages size={15} />}
                      title={pkg.name}
                      subtitle={pkg.detail}
                    />
                  </DataSheetCell>
                  <DataSheetCell>
                    <span className="packages-sheet__services" title={pkg.services}>
                      {pkg.services}
                    </span>
                  </DataSheetCell>
                  <DataSheetCell>
                    <StackCell>
                      <StackLine>{pkg.pricedFrom}</StackLine>
                      <StackLine muted>{pkg.pricedFromKind}</StackLine>
                    </StackCell>
                  </DataSheetCell>
                  <DataSheetCell>
                    <span className="packages-sheet__price pt-mono">{pkg.sellPrice}</span>
                  </DataSheetCell>
                  <DataSheetCell>
                    <StatusChipWithDot tone={PACKAGE_STATUS_TONE[pkg.status]}>
                      {PACKAGE_STATUS_LABEL[pkg.status]}
                    </StatusChipWithDot>
                  </DataSheetCell>
                  <DataSheetCell>
                    <Tooltip tip="More">
                      <IconButton label={`More for ${pkg.name}`}>
                        <IconMore />
                      </IconButton>
                    </Tooltip>
                  </DataSheetCell>
                </DataSheetRow>
              ))}
            </DataSheet>
            <Pagination
              rangeLabel={`Showing 1–${filtered.length} of ${filtered.length} packages`}
              page={page}
              pageCount={1}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

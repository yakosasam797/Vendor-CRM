import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
  Tooltip,
  type CheckboxState,
} from "@paryatech/design-system";
import {
  COMPLIANCE_DOCS,
  DOC_ACTION_LABEL,
  DOC_STATUS_TONE,
} from "../data/vendorFinance";
import {
  IconClose,
  IconFile,
  IconFilter,
  IconMore,
  IconPlus,
  IconTrash,
  IconWarn,
} from "../icons";
import { StatusChipWithDot } from "./StatusChipWithDot";
import "./VendorFinancePanel.css";

interface OpenDocMenu {
  id: string;
  top: number;
  left: number;
}

export function VendorDocsPanel({
  onRequestDocuments,
}: {
  onRequestDocuments?: (documentName?: string, action?: "request-renewal" | "chase") => void;
}) {
  const [query, setQuery] = useState("");
  const [documentRows, setDocumentRows] = useState(() => [...COMPLIANCE_DOCS]);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<OpenDocMenu | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const docs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documentRows;
    return documentRows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.file.toLowerCase().includes(q) ||
        row.reference.toLowerCase().includes(q),
    );
  }, [documentRows, query]);

  const documentToDelete = documentRows.find((row) => row.id === deleteId) ?? null;

  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  useEffect(() => {
    if (!deleteId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDeleteId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteId]);

  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === docs.length && docs.length > 0
        ? "on"
        : "indeterminate";

  const toggleAll = (state: CheckboxState) => {
    setSelected(state === "on" ? docs.map((row) => row.id) : []);
  };

  const toggleRow = (id: string, state: CheckboxState) => {
    setSelected((current) =>
      state === "on"
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((item) => item !== id),
    );
  };

  const showRowMenu = (id: string, button: HTMLButtonElement) => {
    if (openMenu?.id === id) {
      setOpenMenu(null);
      return;
    }
    const rect = button.getBoundingClientRect();
    const menuWidth = 188;
    const menuHeight = 48;
    const gap = 6;
    const left = Math.max(12, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12));
    const top =
      rect.bottom + gap + menuHeight <= window.innerHeight
        ? rect.bottom + gap
        : rect.top - menuHeight - gap;
    setOpenMenu({ id, top, left });
  };

  const deleteDocument = () => {
    if (!deleteId) return;
    setDocumentRows((rows) => rows.filter((row) => row.id !== deleteId));
    setSelected((ids) => ids.filter((id) => id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="vendor-finance">
      <section className="vendor-finance__section" aria-labelledby="docs-title">
        <div className="vendor-finance__section-head">
          <h2 id="docs-title" className="vendor-finance__title">
            Compliance documents
          </h2>
        </div>

        <div className="vendor-finance__toolbar">
          <SearchField
            fullWidth
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
              setSelected([]);
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
            <Button variant="brand" size="sm" onClick={() => onRequestDocuments?.()}>
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
                      state={headerState}
                      onCheckedChange={toggleAll}
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
                        state={selected.includes(row.id) ? "on" : "off"}
                        onCheckedChange={(state) => toggleRow(row.id, state)}
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
                      <div className="docs-sheet__actions">
                        <Button
                          variant={row.action === "request-renewal" ? "primary" : "brand"}
                          size="sm"
                          onClick={() => {
                            if (row.action === "request-renewal" || row.action === "chase") {
                              onRequestDocuments?.(row.name, row.action);
                            }
                          }}
                        >
                          {DOC_ACTION_LABEL[row.action]}
                        </Button>
                        <IconButton
                          className="docs-sheet__more"
                          label={`More actions for ${row.name}`}
                          aria-haspopup="menu"
                          aria-expanded={openMenu?.id === row.id}
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={(event) => showRowMenu(row.id, event.currentTarget)}
                        >
                          <IconMore />
                        </IconButton>
                      </div>
                    </DataSheetCell>
                  </DataSheetRow>
                ))}
              </DataSheet>
              <Pagination
                rangeLabel={`Showing 1–${docs.length} of ${docs.length} documents`}
                page={page}
                pageCount={1}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </section>

      {openMenu
        ? createPortal(
            <div
              className="docs-row-menu"
              role="menu"
              aria-label="Document actions"
              style={{ top: openMenu.top, left: openMenu.left }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="docs-row-menu__item docs-row-menu__item--danger"
                role="menuitem"
                autoFocus
                onClick={() => {
                  setDeleteId(openMenu.id);
                  setOpenMenu(null);
                }}
              >
                <IconTrash />
                Delete document
              </button>
            </div>,
            document.body,
          )
        : null}

      {documentToDelete
        ? createPortal(
            <div
              className="rc-modal-backdrop docs-delete-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setDeleteId(null);
              }}
            >
              <div
                className="rc-modal docs-delete-confirm"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-doc-title"
                aria-describedby="delete-doc-description"
              >
                <div className="docs-delete-confirm__head">
                  <span className="docs-delete-confirm__icon" aria-hidden="true">
                    <IconWarn />
                  </span>
                  <IconButton label="Close" onClick={() => setDeleteId(null)}>
                    <IconClose />
                  </IconButton>
                </div>
                <h2 id="delete-doc-title" className="rc-modal__title">
                  Delete document?
                </h2>
                <p id="delete-doc-description" className="docs-delete-confirm__description">
                  <strong>{documentToDelete.name}</strong> and its uploaded file will be removed from
                  this vendor. This action cannot be undone.
                </p>
                <div className="docs-delete-confirm__actions">
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(null)}>
                    Cancel
                  </Button>
                  <Button
                    className="docs-delete-confirm__button"
                    variant="primary"
                    size="sm"
                    onClick={deleteDocument}
                    autoFocus
                  >
                    Delete document
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

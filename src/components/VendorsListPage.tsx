import { useEffect, useMemo, useRef, useState } from "react";
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
  StatusChip,
  TabBar,
  type CheckboxState,
  type TabItem,
} from "@paryatech/design-system";
import {
  VENDOR_ROLE_FILTERS,
  visibleVendorsForRole,
  type Vendor,
  type VendorRole,
} from "../data/vendors";
import { can, type OrgRole } from "../permissions";
import { IconImport, IconMore, IconPin, IconPlus } from "../icons";
import { VendorFormModal } from "./VendorFormModal";
import "./VendorsListPage.css";

export function VendorsListPage({
  vendors,
  orgRole,
  flash,
  onClearFlash,
  onOpenVendor,
  onVendorsChange,
  onVendorCreated,
}: {
  vendors: Vendor[];
  orgRole: OrgRole;
  flash?: string | null;
  onClearFlash?: () => void;
  onOpenVendor: (id: string) => void;
  onVendorsChange: (next: Vendor[]) => void;
  onVendorCreated: (vendor: Vendor) => void;
}) {
  const [roleFilter, setRoleFilter] = useState<"all" | VendorRole>("all");
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const canAdd = can(orgRole, "vendor.add");
  const canEdit = can(orgRole, "vendor.edit");

  const scoped = useMemo(
    () => visibleVendorsForRole(vendors, orgRole),
    [vendors, orgRole],
  );

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: scoped.length };
    for (const role of VENDOR_ROLE_FILTERS) {
      if (role === "all") continue;
      counts[role] = scoped.filter((v) => v.roles.includes(role)).length;
    }
    return counts;
  }, [scoped]);

  const tabs: TabItem[] = useMemo(
    () =>
      VENDOR_ROLE_FILTERS.map((role) => ({
        id: role,
        label: role === "all" ? "All" : role,
        count: roleCounts[role],
      })),
    [roleCounts],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = locationQuery.trim().toLowerCase();
    return scoped.filter((vendor) => {
      if (roleFilter !== "all" && !vendor.roles.includes(roleFilter)) return false;
      if (q) {
        const haystack = `${vendor.name} ${vendor.code} ${vendor.owner}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (loc && !vendor.location.toLowerCase().includes(loc)) return false;
      return true;
    });
  }, [query, locationQuery, roleFilter, scoped]);

  const editVendor = editId ? vendors.find((v) => v.id === editId) ?? null : null;

  useEffect(() => {
    if (!menuId) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuId(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuId]);

  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === filtered.length && filtered.length > 0
        ? "on"
        : "indeterminate";

  const toggleAll = (state: CheckboxState) => {
    if (state === "on") setSelected(filtered.map((v) => v.id));
    else setSelected([]);
  };

  const toggleRow = (id: string, state: CheckboxState) => {
    setSelected((current) => {
      if (state === "on") return current.includes(id) ? current : [...current, id];
      return current.filter((item) => item !== id);
    });
  };

  const setFilter = (id: string) => {
    setRoleFilter(id as "all" | VendorRole);
    setPage(1);
    setSelected([]);
  };

  return (
    <div className="vendors-page">
      <header className="vendors-page__head">
        <h1 className="vendors-page__title">Vendors</h1>
        <div className="vendors-page__actions">
          <Button variant="brand" size="sm">
            <IconImport />
            Import
          </Button>
          {canAdd ? (
            <Button variant="primary" size="sm" onClick={() => setModal("create")}>
              <IconPlus />
              Add vendor
            </Button>
          ) : null}
        </div>
      </header>

      {flash ? (
        <div className="vendors-page__flash" role="status">
          <span>{flash}</span>
          {onClearFlash ? (
            <button type="button" className="vendors-page__flash-dismiss" onClick={onClearFlash}>
              Dismiss
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="vendors-page__tabs">
        <TabBar
          items={tabs}
          value={roleFilter}
          onValueChange={setFilter}
          aria-label="Vendor roles"
        />
      </div>

      <div className="vendors-page__toolbar">
        <SearchField
          fullWidth
          className="vendors-page__search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
            setSelected([]);
          }}
          placeholder="Search vendors by name, code, or owner"
          aria-label="Search vendors by name, code, or owner"
        />
        <label className="vendors-page__location">
          <span className="visually-hidden">Search by location</span>
          <span className="vendors-page__location-icon" aria-hidden="true">
            <IconPin size={16} />
          </span>
          <input
            type="search"
            value={locationQuery}
            onChange={(event) => {
              setLocationQuery(event.target.value);
              setPage(1);
              setSelected([]);
            }}
            placeholder="Search by location"
            aria-label="Search by location"
          />
        </label>
      </div>

      <div className="vendors-page__sheet">
        {filtered.length === 0 ? (
          <EmptyState
            title="No vendors match these filters"
            description={
              orgRole === "Member"
                ? "Members only see assigned vendors."
                : "Try another name, code, owner, or location."
            }
          />
        ) : (
          <>
            <DataSheet className="vendors-sheet" aria-label="Vendors">
              <DataSheetHeader>
                <DataSheetCell check>
                  <Checkbox
                    state={headerState}
                    onCheckedChange={toggleAll}
                    label="Select all vendors"
                  />
                </DataSheetCell>
                <DataSheetCell>Vendor</DataSheetCell>
                <DataSheetCell>Roles</DataSheetCell>
                <DataSheetCell>Location</DataSheetCell>
                <DataSheetCell>Status</DataSheetCell>
                <DataSheetCell>Updated</DataSheetCell>
                <DataSheetCell>Action</DataSheetCell>
              </DataSheetHeader>
              {filtered.map((vendor) => (
                <DataSheetRow key={vendor.id}>
                  <DataSheetCell check>
                    <Checkbox
                      state={selected.includes(vendor.id) ? "on" : "off"}
                      onCheckedChange={(state) => toggleRow(vendor.id, state)}
                      label={`Select ${vendor.name}`}
                    />
                  </DataSheetCell>
                  <DataSheetCell>
                    <button
                      type="button"
                      className="vendors-sheet__lead-btn"
                      onClick={() => onOpenVendor(vendor.id)}
                    >
                      <LeadCell
                        icon={
                          <Avatar tone="pink" size={32}>
                            {vendor.initials}
                          </Avatar>
                        }
                        title={vendor.name}
                        subtitle={vendor.code}
                      />
                    </button>
                  </DataSheetCell>
                  <DataSheetCell>
                    <div className="vendors-sheet__roles">
                      {vendor.roles.map((role) => (
                        <StatusChip key={role} tone="open">
                          {role}
                        </StatusChip>
                      ))}
                    </div>
                  </DataSheetCell>
                  <DataSheetCell>
                    <span className="vendors-sheet__location">
                      <IconPin size={14} />
                      {vendor.location}
                    </span>
                  </DataSheetCell>
                  <DataSheetCell>
                    <StatusChip
                      tone={
                        vendor.status === "Active"
                          ? "done"
                          : vendor.status === "Setup incomplete"
                            ? "progress"
                            : "open"
                      }
                    >
                      {vendor.status}
                    </StatusChip>
                  </DataSheetCell>
                  <DataSheetCell>
                    <span className="vendors-sheet__updated">{vendor.updated}</span>
                  </DataSheetCell>
                  <DataSheetCell>
                    <div className="vendors-sheet__acts">
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={() => onOpenVendor(vendor.id)}
                      >
                        View
                      </Button>
                      {canEdit ? (
                        <div
                          className="vendors-sheet__more"
                          ref={menuId === vendor.id ? menuRef : undefined}
                        >
                          <IconButton
                            label={`More actions for ${vendor.name}`}
                            onClick={() =>
                              setMenuId((current) => (current === vendor.id ? null : vendor.id))
                            }
                          >
                            <IconMore />
                          </IconButton>
                          {menuId === vendor.id ? (
                            <div className="vendors-sheet__menu" role="menu">
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setEditId(vendor.id);
                                  setModal("edit");
                                  setMenuId(null);
                                }}
                              >
                                Edit vendor
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </DataSheetCell>
                </DataSheetRow>
              ))}
            </DataSheet>
            <Pagination
              rangeLabel={`Showing 1–${filtered.length} of ${filtered.length} vendors`}
              page={page}
              pageCount={1}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <VendorFormModal
        mode={modal === "edit" ? "edit" : "create"}
        open={modal !== null}
        vendor={modal === "edit" ? editVendor : null}
        vendors={vendors}
        orgRole={orgRole}
        onClose={() => {
          setModal(null);
          setEditId(null);
        }}
        onCreated={(created) => {
          setModal(null);
          setEditId(null);
          onVendorCreated(created);
        }}
        onUpdated={(updated) => {
          onVendorsChange(vendors.map((v) => (v.id === updated.id ? updated : v)));
          setModal(null);
          setEditId(null);
        }}
        onViewExisting={onOpenVendor}
      />
    </div>
  );
}

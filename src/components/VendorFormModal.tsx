import { useEffect, useId, useMemo, useState } from "react";
import { Button, StatusChip } from "@paryatech/design-system";
import {
  INTERNAL_OWNERS,
  SERVICE_CATEGORIES,
  VENDOR_COUNTRIES,
  VENDOR_STATUS_OPTIONS,
  type Vendor,
} from "../data/vendors";
import { ForbiddenError, type OrgRole } from "../permissions";
import {
  createVendor,
  emptyVendorFormValues,
  findDuplicateVendors,
  updateVendor,
  validateVendorForm,
  vendorToFormValues,
  type VendorFormValues,
} from "../vendorApi";
import "./VendorFormModal.css";

export type VendorFormMode = "create" | "edit";

export function VendorFormModal({
  mode,
  open,
  vendor,
  vendors,
  orgRole,
  onClose,
  onCreated,
  onUpdated,
  onViewExisting,
}: {
  mode: VendorFormMode;
  open: boolean;
  vendor?: Vendor | null;
  vendors: Vendor[];
  orgRole: OrgRole;
  onClose: () => void;
  onCreated: (vendor: Vendor) => void;
  onUpdated: (vendor: Vendor) => void;
  onViewExisting: (id: string) => void;
}) {
  const titleId = useId();
  const [values, setValues] = useState<VendorFormValues>(emptyVendorFormValues());
  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrors([]);
    setSubmitError(null);
    setValues(mode === "edit" && vendor ? vendorToFormValues(vendor) : emptyVendorFormValues());
  }, [open, mode, vendor]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  const duplicates = useMemo(
    () =>
      open
        ? findDuplicateVendors(
            vendors,
            { name: values.name, phone: values.phone, email: values.email },
            mode === "edit" ? vendor?.id : undefined,
          )
        : [],
    [open, vendors, values.name, values.phone, values.email, mode, vendor?.id],
  );

  if (!open) return null;

  const setField = <K extends keyof VendorFormValues>(key: K, value: VendorFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setSubmitError(null);
  };

  const toggleCategory = (category: (typeof SERVICE_CATEGORIES)[number]) => {
    setValues((current) => {
      const has = current.categories.includes(category);
      return {
        ...current,
        categories: has
          ? current.categories.filter((c) => c !== category)
          : [...current.categories, category],
      };
    });
    setSubmitError(null);
  };

  const submit = () => {
    const nextErrors = validateVendorForm(values);
    setErrors(nextErrors);
    if (nextErrors.length) return;

    try {
      if (mode === "create") {
        const created = createVendor(vendors, values, orgRole);
        onCreated(created);
        return;
      }
      if (!vendor) return;
      const updated = updateVendor(vendors, vendor.id, values, orgRole);
      onUpdated(updated);
    } catch (err) {
      if (err instanceof ForbiddenError) {
        setSubmitError(err.message);
        return;
      }
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div className="pt-modal-overlay open" role="presentation" onClick={onClose}>
      <div
        className="pt-modal pt-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-modal__head">
          <p className="pt-modal__eyebrow">Vendors</p>
          <h2 id={titleId} className="pt-modal__title">
            {mode === "create" ? "Add vendor" : "Edit vendor"}
          </h2>
          {mode === "create" ? (
            <p className="pt-modal__desc">
              Create the supplier profile now. Services, documents and rate cards can be added
              afterward.
            </p>
          ) : (
            <p className="pt-modal__desc">
              Update the parent vendor profile. Services, rate cards and documents stay on their
              own tabs.
            </p>
          )}
        </div>

        <div className="pt-modal__body">
          <div className="pt-mf">
            <label className="pt-mf__l" htmlFor="vf-name">
              Vendor / business name
            </label>
            <input
              id="vf-name"
              className={`pt-mf__i${errors.some((e) => e.includes("name")) ? " is-invalid" : ""}`}
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Coral Bay Hospitality"
              autoComplete="organization"
            />
            {mode === "edit" && vendor ? (
              <p className="pt-mf__note">
                Vendor ID <span className="pt-mono">{vendor.code}</span> stays the same when the name
                changes.
              </p>
            ) : null}
          </div>

          <fieldset className="pt-mf">
            <legend className="pt-mf__l">Service categories</legend>
            <div className="pt-mf__chips">
              {SERVICE_CATEGORIES.map((category) => {
                const on = values.categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    className={`pt-mf__chip${on ? " is-on" : ""}`}
                    aria-pressed={on}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="pt-mf-row">
            <div className="pt-mf">
              <label className="pt-mf__l" htmlFor="vf-country">
                Country
              </label>
              <select
                id="vf-country"
                className="pt-mf__i"
                value={values.country}
                onChange={(e) => setField("country", e.target.value)}
              >
                {VENDOR_COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-mf">
              <label className="pt-mf__l" htmlFor="vf-city">
                City
              </label>
              <input
                id="vf-city"
                className="pt-mf__i"
                value={values.city}
                onChange={(e) => setField("city", e.target.value)}
                placeholder="Kochi"
              />
            </div>
          </div>

          <div className="pt-mf">
            <label className="pt-mf__l" htmlFor="vf-contact">
              Primary contact name
            </label>
            <input
              id="vf-contact"
              className="pt-mf__i"
              value={values.contactName}
              onChange={(e) => setField("contactName", e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="pt-mf-row">
            <div className="pt-mf">
              <label className="pt-mf__l" htmlFor="vf-phone">
                Phone
              </label>
              <input
                id="vf-phone"
                className="pt-mf__i"
                value={values.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+91 …"
                inputMode="tel"
              />
            </div>
            <div className="pt-mf">
              <label className="pt-mf__l" htmlFor="vf-email">
                Email
              </label>
              <input
                id="vf-email"
                className="pt-mf__i"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="ops@supplier.com"
                inputMode="email"
                autoComplete="email"
              />
            </div>
          </div>
          <p className="pt-mf__note">At least one of phone or email is required.</p>

          <div className={mode === "edit" ? "pt-mf-row" : "pt-mf"}>
            <div className="pt-mf">
              <label className="pt-mf__l" htmlFor="vf-owner">
                Internal owner
              </label>
              <select
                id="vf-owner"
                className="pt-mf__i"
                value={values.owner}
                onChange={(e) => setField("owner", e.target.value)}
              >
                {INTERNAL_OWNERS.map((owner) => (
                  <option key={owner.name} value={owner.name}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>
            {mode === "edit" ? (
              <div className="pt-mf">
                <label className="pt-mf__l" htmlFor="vf-status">
                  Vendor status
                </label>
                <select
                  id="vf-status"
                  className="pt-mf__i"
                  value={values.status}
                  onChange={(e) => setField("status", e.target.value as VendorFormValues["status"])}
                >
                  {VENDOR_STATUS_OPTIONS.filter((status) => {
                    if (status === "Archived" && orgRole !== "Owner") return false;
                    return true;
                  }).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          {duplicates.length > 0 ? (
            <div className="pt-dup" role="status">
              <div className="pt-dup__title">A similar vendor may already exist</div>
              <ul className="pt-dup__list">
                {duplicates.slice(0, 3).map(({ vendor: match, reasons }) => (
                  <li key={match.id} className="pt-dup__item">
                    <div className="pt-dup__main">
                      <strong>{match.name}</strong>
                      <span className="pt-dup__meta">
                        {match.categories.join(" · ") || match.roles.join(" · ")}
                      </span>
                      <span className="pt-dup__meta">
                        {match.location} · {match.status}
                      </span>
                      <span className="pt-dup__reasons">{reasons.join(" · ")}</span>
                    </div>
                    <div className="pt-dup__side">
                      <StatusChip tone={match.status === "Active" ? "done" : "open"}>
                        {match.status}
                      </StatusChip>
                      <Button
                        variant="brand"
                        size="sm"
                        type="button"
                        onClick={() => {
                          onClose();
                          onViewExisting(match.id);
                        }}
                      >
                        View existing vendor
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {errors.length || submitError ? (
            <div className="pt-mf__errors" role="alert">
              {submitError ? <p>{submitError}</p> : null}
              {errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="pt-modal__foot">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="button" onClick={submit}>
            {mode === "create" ? "Create vendor" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

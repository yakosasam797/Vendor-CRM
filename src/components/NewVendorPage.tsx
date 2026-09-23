import { useMemo, useState } from "react";
import { Button } from "@paryatech/design-system";
import {
  INTERNAL_OWNERS,
  SERVICE_CATEGORIES,
  VENDOR_COUNTRIES,
  makeInitials,
  makeVendorCode,
  type ServiceCategory,
  type Vendor,
} from "../data/vendors";
import { ForbiddenError, type OrgRole } from "../permissions";
import {
  createVendor,
  emptyVendorFormValues,
  findDuplicateVendors,
  validateVendorForm,
  type VendorFormValues,
} from "../vendorApi";
import "./NewVendorPage.css";

type NewVendorDetails = VendorFormValues & {
  labels: string;
  dmcScope: "Domestic" | "International" | "Both";
  specializations: string;
  phoneCode: string;
  whatsappCode: string;
  whatsapp: string;
  state: string;
  address: string;
  postalCode: string;
  legalName: string;
  gstin: string;
  pan: string;
  reservationsEmail: string;
  emergencyPhone: string;
  confirmationSla: string;
  confirmationChannel: string;
  paymentTerms: string;
  internalNotes: string;
};

const ROLE_LABELS: Record<ServiceCategory, string> = {
  Accommodation: "Accommodation",
  "DMC/Ground handling": "DMC",
  Transport: "Transport",
  Activities: "Activities",
  Flights: "Flights",
  Visa: "Visa",
  Cruise: "Cruise",
  Other: "Other",
};

const DIAL_CODES = ["+91", "+971", "+44", "+65", "+66", "+94"];

const SETUP_SECTIONS = [
  ["01", "Identity", "new-vendor-identity"],
  ["02", "Primary contact", "new-vendor-contact"],
  ["03", "Location", "new-vendor-location"],
  ["04", "Booking operations", "new-vendor-booking"],
  ["05", "Business details", "new-vendor-business"],
] as const;

function initialValues(): NewVendorDetails {
  return {
    ...emptyVendorFormValues(),
    labels: "",
    dmcScope: "Domestic",
    specializations: "",
    phoneCode: "+91",
    whatsappCode: "+91",
    whatsapp: "",
    state: "",
    address: "",
    postalCode: "",
    legalName: "",
    gstin: "",
    pan: "",
    reservationsEmail: "",
    emergencyPhone: "",
    confirmationSla: "Within 4 hours",
    confirmationChannel: "Email",
    paymentTerms: "",
    internalNotes: "",
  };
}

function SectionIntro({
  id,
  step,
  title,
  description,
  requirement,
}: {
  id: string;
  step: string;
  title: string;
  description: string;
  requirement: string;
}) {
  return (
    <div className="new-vendor-section__intro">
      <span className="new-vendor-section__step" aria-hidden="true">{step}</span>
      <div>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
      <span className="new-vendor-section__requirement">{requirement}</span>
    </div>
  );
}

function Field({
  label,
  hint,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`new-vendor-field ${className}`}>
      <span className="new-vendor-field__label">{label}</span>
      {children}
      {hint ? <span className="new-vendor-field__hint">{hint}</span> : null}
    </label>
  );
}

export function NewVendorPage({
  vendors,
  orgRole,
  onCancel,
  onCreated,
  onViewExisting,
}: {
  vendors: Vendor[];
  orgRole: OrgRole;
  onCancel: () => void;
  onCreated: (vendor: Vendor) => void;
  onViewExisting: (id: string) => void;
}) {
  const [values, setValues] = useState<NewVendorDetails>(initialValues);
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>(SETUP_SECTIONS[0][2]);

  const phone = values.phone.trim()
    ? `${values.phoneCode} ${values.phone.trim()}`
    : "";
  const previewCode = makeVendorCode(values.name || "New vendor", vendors);
  const previewInitials = makeInitials(values.name || "New vendor");
  const completedRequired = [
    values.name.trim(),
    values.categories.length > 0,
    values.city.trim(),
    values.country.trim(),
    values.owner.trim(),
    values.phone.trim() || values.email.trim(),
  ].filter(Boolean).length;
  const canSubmit = Boolean(
    values.name.trim() &&
    values.categories.length &&
    values.city.trim() &&
    values.country.trim() &&
    values.owner.trim() &&
    (values.phone.trim() || values.email.trim()),
  );
  const duplicates = useMemo(
    () =>
      findDuplicateVendors(vendors, {
        name: values.name,
        phone,
        email: values.email,
      }),
    [phone, values.email, values.name, vendors],
  );

  const setField = <K extends keyof NewVendorDetails>(
    key: K,
    value: NewVendorDetails[K],
  ) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (sameAsPhone && key === "phone") next.whatsapp = String(value);
      if (sameAsPhone && key === "phoneCode") next.whatsappCode = String(value);
      return next;
    });
    setSubmitError(null);
  };

  const toggleCategory = (category: ServiceCategory) => {
    setValues((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const coreValues: VendorFormValues = {
      name: values.name,
      categories: values.categories,
      country: values.country,
      city: values.city,
      contactName: values.contactName,
      phone,
      email: values.email,
      owner: values.owner,
      status: values.status,
    };
    const nextErrors = validateVendorForm(coreValues);
    if (values.reservationsEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.reservationsEmail.trim())) {
      nextErrors.push("Enter a valid reservations email address.");
    }
    setErrors(nextErrors);
    if (nextErrors.length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const created = createVendor(vendors, coreValues, orgRole);
      const enriched: Vendor = {
        ...created,
        labels: values.labels.split(",").map((label) => label.trim()).filter(Boolean),
        whatsapp: values.whatsapp.trim()
          ? `${values.whatsappCode} ${values.whatsapp.trim()}`
          : "",
        state: values.state.trim(),
        address: values.address.trim(),
        postalCode: values.postalCode.trim(),
        legalName: values.legalName.trim(),
        gstin: values.gstin.trim().toUpperCase(),
        pan: values.pan.trim().toUpperCase(),
        dmcScope: values.categories.includes("DMC/Ground handling") ? values.dmcScope : "",
        specializations: values.specializations.trim(),
        reservationsEmail: values.reservationsEmail.trim(),
        emergencyPhone: values.emergencyPhone.trim(),
        confirmationSla: values.confirmationSla,
        confirmationChannel: values.confirmationChannel,
        paymentTerms: values.paymentTerms.trim(),
        internalNotes: values.internalNotes.trim(),
      };
      onCreated(enriched);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError(error instanceof Error ? error.message : "Vendor could not be created.");
    }
  };

  return (
    <div className="new-vendor-page">
      <header className="new-vendor-hero">
        <div className="new-vendor-hero__copy">
          <h1>Add vendor</h1>
          <p className="new-vendor-hero__description">Set up the core supplier profile. Services, rate cards, and packages can be added after creation.</p>
        </div>
        <div className="new-vendor-preview" aria-label="Vendor identity preview">
          <span className="new-vendor-preview__avatar" aria-hidden="true">{previewInitials}</span>
          <div className="new-vendor-preview__identity">
            <span>Profile preview</span>
            <strong>{values.name.trim() || "Unnamed vendor"}</strong>
            <small className="pt-mono">{previewCode}</small>
          </div>
          <div className="new-vendor-preview__progress">
            <strong>{completedRequired}/6</strong>
            <span>required details</span>
            <progress max={6} value={completedRequired} aria-label={`${completedRequired} of 6 required details complete`} />
          </div>
        </div>
      </header>

      <div className="new-vendor-workspace">
        <nav className="new-vendor-steps" aria-label="Vendor setup sections">
          <p>Vendor setup</p>
          {SETUP_SECTIONS.map(([step, label, target]) => (
            <a
              key={target}
              href={`#${target}`}
              className={activeSection === target ? "is-active" : undefined}
              aria-current={activeSection === target ? "step" : undefined}
              onClick={() => setActiveSection(target)}
            >
              <span className="pt-mono">{step}</span>
              {label}
            </a>
          ))}
        </nav>

        <div className="new-vendor-content">
          {errors.length || submitError ? (
            <div className="new-vendor-errors" role="alert">
              <strong>Complete the highlighted setup</strong>
              {submitError ? <p>{submitError}</p> : null}
              {errors.map((error) => <p key={error}>{error}</p>)}
            </div>
          ) : null}

          <form className="new-vendor-form" onSubmit={submit} noValidate>
        <section className="new-vendor-section" aria-labelledby="new-vendor-identity">
          <SectionIntro id="new-vendor-identity" step="01" title="Identity" description="The core details used across CRM, costing, and booking records." requirement="Name, category, and owner required" />
          <div className="new-vendor-section__fields">
            <div className="new-vendor-grid new-vendor-grid--2">
              <Field label="Vendor or business name *">
                <input required value={values.name} onChange={(event) => setField("name", event.target.value)} placeholder="e.g. Coral Bay Hospitality" autoComplete="organization" />
              </Field>
              <Field label="Internal owner *">
                <select required value={values.owner} onChange={(event) => setField("owner", event.target.value)}>
                  {INTERNAL_OWNERS.map((owner) => <option key={owner.name}>{owner.name}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Vendor code" hint="Generated automatically and stays fixed after creation." className="new-vendor-field--short">
              <input value={previewCode} readOnly className="is-readonly" />
            </Field>

            <fieldset className="new-vendor-role-field">
              <legend>Service categories *</legend>
              <p className="new-vendor-role-field__hint">Choose what this vendor can support. Add individual services after creating the vendor.</p>
              <div className="new-vendor-role-list">
                {SERVICE_CATEGORIES.map((category) => {
                  const selected = values.categories.includes(category);
                  return (
                    <button key={category} type="button" className={selected ? "is-selected" : ""} aria-pressed={selected} onClick={() => toggleCategory(category)}>
                      {ROLE_LABELS[category]}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Field label="Labels" hint="Comma-separated labels help teams filter and shortlist vendors.">
              <input value={values.labels} onChange={(event) => setField("labels", event.target.value)} placeholder="Preferred, premium, Kerala" />
            </Field>

            {values.categories.includes("DMC/Ground handling") ? (
              <div className="new-vendor-conditional">
                <div className="new-vendor-grid new-vendor-grid--2">
                  <Field label="DMC scope">
                    <select value={values.dmcScope} onChange={(event) => setField("dmcScope", event.target.value as NewVendorDetails["dmcScope"])}>
                      <option>Domestic</option>
                      <option>International</option>
                      <option>Both</option>
                    </select>
                  </Field>
                  <Field label="Specializations">
                    <input value={values.specializations} onChange={(event) => setField("specializations", event.target.value)} placeholder="Regions, trip styles, or supplier strengths" />
                  </Field>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="new-vendor-section" aria-labelledby="new-vendor-contact">
          <SectionIntro id="new-vendor-contact" step="02" title="Primary contact" description="The first person your team contacts for availability, rates, and changes." requirement="Phone or email required" />
          <div className="new-vendor-section__fields">
            <Field label="Contact name">
              <input value={values.contactName} onChange={(event) => setField("contactName", event.target.value)} placeholder="Full name" autoComplete="name" />
            </Field>
            <div className="new-vendor-grid new-vendor-grid--2">
              <Field label="Phone">
                <span className="new-vendor-phone">
                  <select aria-label="Phone country code" value={values.phoneCode} onChange={(event) => setField("phoneCode", event.target.value)}>
                    {DIAL_CODES.map((code) => <option key={code}>{code}</option>)}
                  </select>
                  <input aria-label="Phone number" value={values.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="81234 56789" inputMode="tel" />
                </span>
              </Field>
              <Field label="Email">
                <input value={values.email} onChange={(event) => setField("email", event.target.value)} placeholder="contact@vendor.com" inputMode="email" autoComplete="email" />
              </Field>
            </div>
            <div className="new-vendor-grid new-vendor-grid--2">
              <Field label="WhatsApp number">
                <span className="new-vendor-phone">
                  <select aria-label="WhatsApp country code" value={values.whatsappCode} disabled={sameAsPhone} onChange={(event) => setField("whatsappCode", event.target.value)}>
                    {DIAL_CODES.map((code) => <option key={code}>{code}</option>)}
                  </select>
                  <input aria-label="WhatsApp number" value={values.whatsapp} disabled={sameAsPhone} onChange={(event) => setField("whatsapp", event.target.value)} placeholder="81234 56789" inputMode="tel" />
                </span>
              </Field>
              <label className="new-vendor-check">
                <input type="checkbox" checked={sameAsPhone} onChange={(event) => {
                  const checked = event.target.checked;
                  setSameAsPhone(checked);
                  if (checked) setValues((current) => ({ ...current, whatsapp: current.phone, whatsappCode: current.phoneCode }));
                }} />
                <span>Use the same number for WhatsApp</span>
              </label>
            </div>
          </div>
        </section>

        <section className="new-vendor-section" aria-labelledby="new-vendor-location">
          <SectionIntro id="new-vendor-location" step="03" title="Location" description="Headquarters and the address used for contracts and tax documents." requirement="City and country required" />
          <div className="new-vendor-section__fields">
            <div className="new-vendor-grid new-vendor-grid--3">
              <Field label="City *"><input required value={values.city} onChange={(event) => setField("city", event.target.value)} placeholder="Kochi" /></Field>
              <Field label="State or region"><input value={values.state} onChange={(event) => setField("state", event.target.value)} placeholder="Kerala" /></Field>
              <Field label="Country *">
                <select required value={values.country} onChange={(event) => setField("country", event.target.value)}>
                  {VENDOR_COUNTRIES.map((country) => <option key={country}>{country}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Street address"><textarea rows={2} value={values.address} onChange={(event) => setField("address", event.target.value)} placeholder="Building, street, district" /></Field>
            <Field label="Postal code" className="new-vendor-field--short"><input value={values.postalCode} onChange={(event) => setField("postalCode", event.target.value)} placeholder="682001" /></Field>
          </div>
        </section>

        <section className="new-vendor-section" aria-labelledby="new-vendor-booking">
          <SectionIntro id="new-vendor-booking" step="04" title="Booking operations" description="Defaults used when requesting availability and following up on live bookings." requirement="Optional setup" />
          <div className="new-vendor-section__fields">
            <div className="new-vendor-grid new-vendor-grid--2">
              <Field label="Reservations email"><input value={values.reservationsEmail} onChange={(event) => setField("reservationsEmail", event.target.value)} placeholder="reservations@vendor.com" inputMode="email" /></Field>
              <Field label="Emergency or after-hours phone"><input value={values.emergencyPhone} onChange={(event) => setField("emergencyPhone", event.target.value)} placeholder="+91 98765 43210" inputMode="tel" /></Field>
              <Field label="Expected confirmation time">
                <select value={values.confirmationSla} onChange={(event) => setField("confirmationSla", event.target.value)}>
                  <option>Within 1 hour</option><option>Within 4 hours</option><option>Same business day</option><option>Within 24 hours</option><option>On request</option>
                </select>
              </Field>
              <Field label="Preferred confirmation channel">
                <select value={values.confirmationChannel} onChange={(event) => setField("confirmationChannel", event.target.value)}>
                  <option>Email</option><option>WhatsApp</option><option>Phone</option><option>Vendor portal</option>
                </select>
              </Field>
            </div>
            <Field label="Default payment terms" hint="A working default only. Rate cards and contracts can override it."><input value={values.paymentTerms} onChange={(event) => setField("paymentTerms", event.target.value)} placeholder="e.g. 25% deposit, balance 15 days before arrival" /></Field>
          </div>
        </section>

        <section className="new-vendor-section" aria-labelledby="new-vendor-business">
          <SectionIntro id="new-vendor-business" step="05" title="Business details" description="Legal, tax, and internal context for this commercial relationship." requirement="Optional setup" />
          <div className="new-vendor-section__fields">
            <div className="new-vendor-grid new-vendor-grid--2">
              <Field label="Legal business name"><input value={values.legalName} onChange={(event) => setField("legalName", event.target.value)} placeholder="Name shown on contracts and invoices" /></Field>
              <Field label="GSTIN"><input value={values.gstin} onChange={(event) => setField("gstin", event.target.value)} placeholder="GST registration number" /></Field>
              <Field label="PAN"><input value={values.pan} onChange={(event) => setField("pan", event.target.value)} placeholder="Permanent account number" /></Field>
            </div>
            <Field label="Internal notes"><textarea rows={3} value={values.internalNotes} onChange={(event) => setField("internalNotes", event.target.value)} placeholder="Commercial context, escalation paths, contracting notes, or known constraints" /></Field>
          </div>
        </section>

        {duplicates.length > 0 ? (
          <aside className="new-vendor-duplicate" aria-live="polite">
            <div><strong>A similar vendor may already exist</strong><span>{duplicates[0].reasons.join(" · ")}</span></div>
            <button type="button" onClick={() => onViewExisting(duplicates[0].vendor.id)}>View {duplicates[0].vendor.name}</button>
          </aside>
        ) : null}

        <footer className="new-vendor-actions">
          <p><strong>{completedRequired} of 6 required details complete.</strong> Vendor name, one service, location, owner, and one contact method are required.</p>
          <div>
            <Button variant="ghost" size="sm" type="button" onClick={onCancel}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" disabled={!canSubmit}>Create vendor</Button>
          </div>
        </footer>
          </form>
        </div>
      </div>
    </div>
  );
}

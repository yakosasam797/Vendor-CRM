import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@paryatech/design-system";
import { DIRECTORY_CATEGORIES, type DirectoryCategory, type DirectoryService } from "../data/vendorDirectory";
import { IconIdCard, IconPackages, IconPin } from "../icons";
import { ServiceTypeIcon } from "./ServiceTypeLabel";
import "./NewVendorPage.css";
import "./NewServicePage.css";

type FieldDefinition = { key: string; label: string; placeholder: string; required?: boolean };

const typeDetails: Record<DirectoryCategory, { description: string; fields: FieldDefinition[] }> = {
  Accommodation: {
    description: "Describe the property and the stays your team can offer.",
    fields: [
      { key: "propertyType", label: "Property type", placeholder: "Hotel, resort, homestay…", required: true },
      { key: "roomTypes", label: "Room types", placeholder: "Deluxe room, suite, villa…" },
      { key: "checkIn", label: "Check-in time", placeholder: "e.g. 14:00" },
      { key: "checkOut", label: "Check-out time", placeholder: "e.g. 11:00" },
    ],
  },
  Transport: {
    description: "Capture the vehicle and route details needed for trip planning.",
    fields: [
      { key: "vehicleType", label: "Vehicle type", placeholder: "Sedan, SUV, coach…", required: true },
      { key: "capacity", label: "Passenger capacity", placeholder: "e.g. 4 passengers" },
      { key: "route", label: "Route or coverage", placeholder: "Airport to city, full-day local…" },
      { key: "luggage", label: "Luggage allowance", placeholder: "e.g. 2 large bags" },
    ],
  },
  Activities: {
    description: "Make the experience clear enough to add to an itinerary.",
    fields: [
      { key: "duration", label: "Duration", placeholder: "e.g. 3 hours", required: true },
      { key: "groupSize", label: "Group size", placeholder: "e.g. Up to 12 guests" },
      { key: "age", label: "Age suitability", placeholder: "e.g. Ages 8 and above" },
      { key: "meetingPoint", label: "Meeting point", placeholder: "Hotel pickup or meeting address" },
    ],
  },
  Visa: {
    description: "Record the destination and processing scope of this visa service.",
    fields: [
      { key: "visaType", label: "Visa type", placeholder: "Tourist, business, transit…", required: true },
      { key: "validity", label: "Visa validity", placeholder: "e.g. 30 days" },
      { key: "processing", label: "Typical processing time", placeholder: "e.g. 5–7 working days" },
      { key: "documents", label: "Key documents", placeholder: "Passport, photograph…" },
    ],
  },
  Flights: {
    description: "Describe the flight product your team will search or quote.",
    fields: [
      { key: "route", label: "Route", placeholder: "e.g. Delhi to Dubai", required: true },
      { key: "airline", label: "Airline", placeholder: "Airline or multiple carriers" },
      { key: "cabin", label: "Cabin", placeholder: "Economy, premium, business…" },
      { key: "baggage", label: "Baggage", placeholder: "e.g. 20 kg checked" },
    ],
  },
};

function Section({ title, description, icon, children }: { title: string; description: string; icon: ReactNode; children: ReactNode }) {
  const id = `add-service-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return <section className="new-vendor-section" aria-labelledby={id}>
    <div className="new-vendor-section__label"><span aria-hidden="true">{icon}</span><div><h2 id={id}>{title}</h2><p>{description}</p></div></div>
    <div className="new-vendor-section__content">{children}</div>
  </section>;
}

export function NewServicePage({ existingServices, onCancel, onCreated }: {
  existingServices: DirectoryService[];
  onCancel: () => void;
  onCreated: (service: DirectoryService) => void;
}) {
  const [category, setCategory] = useState<DirectoryCategory>("Accommodation");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [details, setDetails] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [id] = useState(() => `svc-${crypto.randomUUID().slice(0, 8)}`);
  const fields = typeDetails[category].fields;
  const duplicate = existingServices.find((service) => service.category === category && service.name.trim().toLowerCase() === name.trim().toLowerCase());
  const missing = !name.trim() || !location.trim() || fields.some((field) => field.required && !details[`${category}:${field.key}`]?.trim());

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (missing || duplicate) return;
    onCreated({
      id,
      serviceId: id,
      profileVendorId: "",
      name: name.trim(),
      category,
      location: location.trim(),
      status: "Draft",
      description: description.trim(),
      attributes: fields.map((field) => ({ label: field.label, value: details[`${category}:${field.key}`]?.trim() ?? "" })).filter((field) => field.value),
      inclusions: inclusions.split("\n").map((line) => line.trim()).filter(Boolean),
      exclusions: exclusions.split("\n").map((line) => line.trim()).filter(Boolean),
    });
  };

  return <div className="new-vendor-page new-service-page">
    <form className="new-vendor-form" onSubmit={submit} noValidate>
      <header className="new-vendor-form__head"><h1>Add service</h1></header>
      {(attempted && missing || duplicate) ? <div className="new-vendor-errors" role="alert">
        <strong>{duplicate ? "This service already exists" : "Complete the required details"}</strong>
        <p>{duplicate ? `${duplicate.name} is already listed under ${category}.` : "Add a name, base location, and the required service detail."}</p>
      </div> : null}

      <Section title="Service identity" description="Name the service and choose the type staff will use to find it." icon={<IconPackages size={18} />}>
        <fieldset className="new-vendor-role-field">
          <legend>Service type *</legend>
          <div className="new-service-types">
            {DIRECTORY_CATEGORIES.filter((item): item is DirectoryCategory => item !== "all").map((type) => <button
              key={type}
              type="button"
              className={category === type ? "is-selected" : ""}
              aria-pressed={category === type}
              onClick={() => { setCategory(type); setAttempted(false); }}
            ><ServiceTypeIcon type={type} size={18} /><span>{type}</span></button>)}
          </div>
        </fieldset>
        <div className="new-vendor-grid new-vendor-grid--2">
          <label className="new-vendor-field"><span className="new-vendor-field__label">Service name *</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder={category === "Accommodation" ? "e.g. Coral Bay Resort" : category === "Transport" ? "e.g. Kochi airport transfer" : "Name staff will recognise"} /></label>
          <label className="new-vendor-field"><span className="new-vendor-field__label">Service ID</span><span className="new-vendor-control"><span className="new-vendor-control__icon"><IconIdCard size={17} /></span><input value={id.toUpperCase()} readOnly className="is-readonly" aria-readonly="true" /></span></label>
          <label className="new-vendor-field"><span className="new-vendor-field__label">{category === "Visa" ? "Destination country *" : "Base location *"}</span><span className="new-vendor-control"><span className="new-vendor-control__icon"><IconPin size={17} /></span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder={category === "Visa" ? "e.g. United Arab Emirates" : "City, destination, or operating area"} /></span></label>
        </div>
      </Section>

      <Section title={`${category} details`} description={typeDetails[category].description} icon={<ServiceTypeIcon type={category} size={18} />}>
        <div className="new-vendor-grid new-vendor-grid--2">
          {fields.map((field) => <label className="new-vendor-field" key={field.key}><span className="new-vendor-field__label">{field.label}{field.required ? " *" : ""}</span><input value={details[`${category}:${field.key}`] ?? ""} onChange={(event) => setDetails((current) => ({ ...current, [`${category}:${field.key}`]: event.target.value }))} placeholder={field.placeholder} /></label>)}
        </div>
      </Section>

      <Section title="Scope & notes" description="Give your team the context to evaluate and use this service." icon={<IconPackages size={18} />}>
        <label className="new-vendor-field"><span className="new-vendor-field__label">Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="What does this service include and when should it be used?" /></label>
        <div className="new-vendor-grid new-vendor-grid--2">
          <label className="new-vendor-field"><span className="new-vendor-field__label">Included</span><textarea value={inclusions} onChange={(event) => setInclusions(event.target.value)} rows={4} placeholder="One item per line" /></label>
          <label className="new-vendor-field"><span className="new-vendor-field__label">Excluded</span><textarea value={exclusions} onChange={(event) => setExclusions(event.target.value)} rows={4} placeholder="One item per line" /></label>
        </div>
        <p className="new-service-page__hint">The service starts as a draft. Vendors and rate cards can be linked after creation.</p>
      </Section>

      <footer className="new-vendor-actions"><div><Button variant="ghost" size="sm" type="button" onClick={onCancel}>Cancel</Button><Button variant="primary" size="sm" type="submit">Create draft service</Button></div></footer>
    </form>
  </div>;
}

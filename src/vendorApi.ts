import { VENDOR_SERVICES } from "./data/services";
import { RATE_CARDS } from "./data/rateCards";
import {
  categoriesToRoles,
  INTERNAL_OWNERS,
  makeInitials,
  makeVendorCode,
  makeVendorId,
  type ServiceCategory,
  type Vendor,
  type VendorActivityEvent,
  type VendorStatus,
} from "./data/vendors";
import { assertCan, type OrgRole } from "./permissions";

export interface VendorFormValues {
  name: string;
  categories: ServiceCategory[];
  country: string;
  city: string;
  contactName: string;
  phone: string;
  email: string;
  owner: string;
  status: VendorStatus;
}

export interface CategoryConflict {
  category: ServiceCategory;
  services: string[];
  rateCards: string[];
}

export interface DuplicateMatch {
  vendor: Vendor;
  reasons: string[];
}

function nowStamp(): string {
  return "Just now";
}

function activityEvent(
  vendorId: string,
  actor: string,
  event: string,
  area = "Vendor",
): VendorActivityEvent {
  return {
    id: `${vendorId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: nowStamp(),
    actor,
    role: "Workspace",
    event,
    area,
  };
}

function ownerInitials(owner: string): string {
  return INTERNAL_OWNERS.find((o) => o.name === owner)?.initials ?? makeInitials(owner);
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function namesSimilar(a: string, b: string): boolean {
  const left = a.trim().toLowerCase();
  const right = b.trim().toLowerCase();
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.includes(right) || right.includes(left)) return true;
  const leftTokens = new Set(left.split(/\s+/).filter((t) => t.length > 2));
  const rightTokens = right.split(/\s+/).filter((t) => t.length > 2);
  const overlap = rightTokens.filter((t) => leftTokens.has(t)).length;
  return overlap >= 2;
}

export function findDuplicateVendors(
  list: Vendor[],
  values: Pick<VendorFormValues, "name" | "phone" | "email">,
  excludeId?: string,
): DuplicateMatch[] {
  const phone = normalizePhone(values.phone);
  const email = values.email.trim().toLowerCase();
  const matches: DuplicateMatch[] = [];

  for (const vendor of list) {
    if (excludeId && vendor.id === excludeId) continue;
    if (vendor.status === "Archived") continue;
    const reasons: string[] = [];
    if (values.name.trim() && namesSimilar(vendor.name, values.name)) {
      reasons.push("Similar name");
    }
    if (phone && normalizePhone(vendor.phone) && normalizePhone(vendor.phone) === phone) {
      reasons.push("Same phone");
    }
    if (email && vendor.email.trim().toLowerCase() === email) {
      reasons.push("Same email");
    }
    if (reasons.length) matches.push({ vendor, reasons });
  }

  return matches;
}

export function categoryConflicts(
  vendorId: string,
  removing: ServiceCategory[],
): CategoryConflict[] {
  if (removing.length === 0) return [];
  const conflicts: CategoryConflict[] = [];

  for (const category of removing) {
    const services =
      vendorId === "exhosp"
        ? VENDOR_SERVICES.filter((s) => {
            if (category === "Accommodation") return s.type === "Accommodation";
            if (category === "Activities") return s.type === "Activity";
            return false;
          }).map((s) => s.name)
        : [];

    const rateCards =
      vendorId === "exhosp"
        ? RATE_CARDS.filter((c) => {
            if (category === "Accommodation") return c.category === "Accommodation";
            if (category === "Transport") return c.category === "Transport";
            if (category === "Visa") return c.category === "Visa";
            return false;
          }).map((c) => c.title)
        : [];

    if (services.length || rateCards.length) {
      conflicts.push({ category, services, rateCards });
    }
  }

  return conflicts;
}

export function validateVendorForm(values: VendorFormValues): string[] {
  const errors: string[] = [];
  if (!values.name.trim()) errors.push("Vendor/business name is required.");
  if (values.categories.length === 0) errors.push("Select at least one service category.");
  if (!values.country.trim()) errors.push("Country is required.");
  if (!values.city.trim()) errors.push("City is required.");
  if (!values.owner.trim()) errors.push("Internal owner is required.");
  if (!values.phone.trim() && !values.email.trim()) {
    errors.push("Add at least one contact method — phone or email.");
  }
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.push("Enter a valid email address.");
  }
  return errors;
}

export function createVendor(
  list: Vendor[],
  values: VendorFormValues,
  role: OrgRole,
  actor = "Vrushabh Jain",
): Vendor {
  assertCan(role, "vendor.add");
  const errors = validateVendorForm(values);
  if (errors.length) throw new Error(errors[0]);

  const id = makeVendorId(values.name, list);
  const code = makeVendorCode(values.name, list);
  const vendor: Vendor = {
    id,
    code,
    name: values.name.trim(),
    initials: makeInitials(values.name),
    categories: [...values.categories],
    roles: categoriesToRoles(values.categories),
    country: values.country.trim(),
    city: values.city.trim(),
    location: `${values.city.trim()}, ${values.country.trim()}`,
    contactName: values.contactName.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    labels: [],
    updated: nowStamp(),
    owner: values.owner,
    ownerInitials: ownerInitials(values.owner),
    status: "Draft",
    setup: {
      profileComplete: true,
      hasService: false,
      hasContactsDocs: false,
      hasRateCard: false,
      activated: false,
    },
    activity: [
      activityEvent(id, actor, "Created vendor draft", "Vendor"),
    ],
    assignedMemberIds: [],
  };

  return vendor;
}

export function updateVendor(
  list: Vendor[],
  vendorId: string,
  values: VendorFormValues,
  role: OrgRole,
  actor = "Vrushabh Jain",
): Vendor {
  assertCan(role, "vendor.edit");
  const current = list.find((v) => v.id === vendorId);
  if (!current) throw new Error("Vendor not found.");

  const errors = validateVendorForm(values);
  if (errors.length) throw new Error(errors[0]);

  if (values.status === "Archived") {
    assertCan(role, "vendor.archive");
  }
  if (values.status === "Inactive" && current.status !== "Inactive") {
    assertCan(role, "vendor.deactivate");
  }

  const removing = current.categories.filter((c) => !values.categories.includes(c));
  const conflicts = categoryConflicts(vendorId, removing);
  if (conflicts.length) {
    const detail = conflicts
      .map((c) => {
        const bits = [...c.services, ...c.rateCards].slice(0, 3).join(", ");
        return `${c.category} (${bits})`;
      })
      .join("; ");
    throw new Error(
      `Cannot remove service categor${conflicts.length > 1 ? "ies" : "y"} still used by services or rate cards: ${detail}. Resolve those records first.`,
    );
  }

  const changes: string[] = [];
  if (current.name !== values.name.trim()) changes.push("name");
  if (current.city !== values.city.trim() || current.country !== values.country.trim()) {
    changes.push("location");
  }
  if (current.owner !== values.owner) changes.push("owner");
  if (current.status !== values.status) changes.push(`status → ${values.status}`);
  if (removing.length || values.categories.some((c) => !current.categories.includes(c))) {
    changes.push("categories");
  }

  return {
    ...current,
    // code + id never change
    name: values.name.trim(),
    initials: makeInitials(values.name),
    categories: [...values.categories],
    roles: categoriesToRoles(values.categories),
    country: values.country.trim(),
    city: values.city.trim(),
    location: `${values.city.trim()}, ${values.country.trim()}`,
    contactName: values.contactName.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    owner: values.owner,
    ownerInitials: ownerInitials(values.owner),
    status: values.status,
    updated: nowStamp(),
    setup: {
      ...current.setup,
      profileComplete: true,
      activated: values.status === "Active",
    },
    activity: [
      activityEvent(
        current.id,
        actor,
        changes.length
          ? `Updated vendor ${changes.join(", ")}`
          : "Saved vendor profile with no field changes",
      ),
      ...current.activity,
    ],
  };
}

export function vendorToFormValues(vendor: Vendor): VendorFormValues {
  return {
    name: vendor.name,
    categories: [...vendor.categories],
    country: vendor.country,
    city: vendor.city,
    contactName: vendor.contactName,
    phone: vendor.phone,
    email: vendor.email,
    owner: vendor.owner,
    status: vendor.status,
  };
}

export function emptyVendorFormValues(): VendorFormValues {
  return {
    name: "",
    categories: [],
    country: "India",
    city: "",
    contactName: "",
    phone: "",
    email: "",
    owner: "Anjali Menon",
    status: "Draft",
  };
}

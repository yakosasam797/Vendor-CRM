import { useMemo, useState } from "react";
import {
  AppShell,
  Avatar,
  CreditsMeter,
  IconButton,
  NotesStrip,
  SearchField,
} from "@paryatech/design-system";
import { VendorsListPage } from "./components/VendorsListPage";
import { VendorRateCardsPage } from "./components/VendorRateCardsPage";
import { RateCardDetailPage } from "./components/rateCard/RateCardDetailPage";
import { SEED_VENDORS, type Vendor } from "./data/vendors";
import { buildNavGroups } from "./nav";
import type { OrgRole } from "./permissions";
import { getDetailCard } from "./rateCard/cards";
import {
  IconBell,
  IconBrandCaret,
  IconChevronDown,
  IconChevronLeft,
  IconHelp,
  IconPhone,
  IconSettings,
} from "./icons";
import "./App.css";
import "./components/rateCard/RateCardDetail.css";

/** Opens WhatsApp chat for product support. */
const SUPPORT_WHATSAPP_URL =
  "https://wa.me/919876543210?text=" +
  encodeURIComponent("Hi, I need help with Paryatech.");

type Route =
  | { name: "vendors" }
  | { name: "vendor"; id: string }
  | { name: "rate-card"; id: string; vendorId: string }
  | { name: "rate-card-new"; templateId: string; vendorId: string };

function blankFromTemplate(templateId: string) {
  const id = templateId === "visa" ? "rc-new-visa" : "rc-new-hotel";
  return id;
}

export default function App() {
  const [activeNav, setActiveNav] = useState("vendors");
  const [route, setRoute] = useState<Route>({ name: "vendors" });
  const [notesOpen, setNotesOpen] = useState(false);
  const orgRole: OrgRole = "Owner";
  const [vendors, setVendors] = useState<Vendor[]>(() =>
    SEED_VENDORS.map((v) => structuredClone(v)),
  );
  const [flash, setFlash] = useState<string | null>(null);
  const navGroups = useMemo(() => buildNavGroups(activeNav, setActiveNav), [activeNav]);

  const detail =
    route.name === "rate-card"
      ? getDetailCard(route.id)
      : route.name === "rate-card-new"
        ? getDetailCard(blankFromTemplate(route.templateId))
        : undefined;

  const openVendors = () => setRoute({ name: "vendors" });
  const openVendor = (id: string, message?: string) => {
    if (message) setFlash(message);
    setRoute({ name: "vendor", id });
  };
  const openCard = (id: string, vendorId: string) =>
    setRoute({ name: "rate-card", id, vendorId });
  const backFromCard = () => {
    if (route.name === "rate-card" || route.name === "rate-card-new") {
      setRoute({ name: "vendor", id: route.vendorId });
      return;
    }
    openVendors();
  };

  const isVendorsList = route.name === "vendors";
  const isVendorDetail = route.name === "vendor";
  const isList = isVendorsList;

  const currentVendorId =
    route.name === "vendor"
      ? route.id
      : route.name === "rate-card" || route.name === "rate-card-new"
        ? route.vendorId
        : "exhosp";

  const vendorName = (id: string) =>
    vendors.find((v) => v.id === id)?.name ?? "Example Hospitality";

  const crumbs = (
    <ol className="app-shell-crumbs__list">
      {isVendorsList ? (
        <>
          <li>CRM</li>
          <li className="rc-crumb-sep" aria-hidden="true">
            ›
          </li>
          <li aria-current="page">Vendors</li>
        </>
      ) : (
        <>
          <li>
            <button type="button" className="app-shell-crumbs__link" onClick={openVendors}>
              CRM
            </button>
          </li>
          <li className="rc-crumb-sep" aria-hidden="true">
            ›
          </li>
          <li>
            <button type="button" className="app-shell-crumbs__link" onClick={openVendors}>
              Vendors
            </button>
          </li>
          <li className="rc-crumb-sep" aria-hidden="true">
            ›
          </li>
          {isVendorDetail ? (
            <li aria-current="page">{vendorName(currentVendorId)}</li>
          ) : (
            <>
              <li>
                <button
                  type="button"
                  className="app-shell-crumbs__link"
                  onClick={() => openVendor(currentVendorId)}
                >
                  {detail?.vendor ?? vendorName(currentVendorId)}
                </button>
              </li>
              <li className="rc-crumb-sep" aria-hidden="true">
                ›
              </li>
              <li aria-current="page">{detail?.name ?? "New rate card"}</li>
            </>
          )}
        </>
      )}
    </ol>
  );

  return (
    <AppShell
      brandName="paryatech"
      brandAction={<IconBrandCaret />}
      listMode={isList}
      notes={
        <NotesStrip
          label={isVendorsList ? "Module notes" : "Rate card notes"}
          badge={2}
          onOpen={() => setNotesOpen(true)}
          onAdd={() => setNotesOpen(true)}
        />
      }
      navGroups={navGroups}
      sidebarFooter={<CreditsMeter remaining={720} total={1000} />}
      leading={
        !isVendorsList ? (
          <IconButton
            label={isVendorDetail ? "Back to vendors" : "Back to vendor"}
            onClick={isVendorDetail ? openVendors : backFromCard}
          >
            <IconChevronLeft />
          </IconButton>
        ) : undefined
      }
      crumbs={crumbs}
      actions={
        <>
          <SearchField
            className="app-top-search"
            placeholder="Search anything"
            aria-label="Search anything"
          />
          <IconButton className="app-top-util" label="Settings">
            <IconSettings />
          </IconButton>
          <IconButton className="app-top-util" label="Help and support">
            <IconHelp />
          </IconButton>
          <IconButton
            className="app-top-util"
            label="Customer support via WhatsApp"
            onClick={() => window.open(SUPPORT_WHATSAPP_URL, "_blank", "noopener,noreferrer")}
          >
            <IconPhone />
          </IconButton>
          <IconButton className="app-top-util" label="Notifications" alert>
            <IconBell />
          </IconButton>
          <button type="button" className="account-btn" aria-label="Account, Vrushabh Jain">
            <Avatar tone="pink" size={26}>
              VJ
            </Avatar>
            <IconChevronDown size={13} />
          </button>
        </>
      }
    >
      {isVendorsList ? (
        <VendorsListPage
          vendors={vendors}
          orgRole={orgRole}
          flash={flash}
          onClearFlash={() => setFlash(null)}
          onOpenVendor={(id) => {
            setFlash(null);
            openVendor(id);
          }}
          onVendorCreated={(created) => {
            setVendors((prev) => [created, ...prev]);
            openVendor(
              created.id,
              "Vendor created successfully. Complete the setup to make this vendor operational.",
            );
          }}
          onVendorsChange={(next) => {
            setVendors(next);
            setFlash("Vendor details updated successfully.");
          }}
        />
      ) : isVendorDetail ? (
        <VendorRateCardsPage
          vendorId={route.id}
          vendors={vendors}
          orgRole={orgRole}
          flash={flash}
          onClearFlash={() => setFlash(null)}
          onOpenVendor={(id) => openVendor(id)}
          onVendorsChange={(next) => {
            setVendors(next);
            setFlash("Vendor details updated successfully.");
          }}
          onOpenCard={(id) => openCard(id, route.id)}
          onNewCard={() =>
            setRoute({ name: "rate-card-new", templateId: "hotel", vendorId: route.id })
          }
        />
      ) : (
        <RateCardDetailPage
          key={
            route.name === "rate-card"
              ? route.id
              : `new-${route.templateId}`
          }
          cardId={
            route.name === "rate-card"
              ? route.id
              : blankFromTemplate(route.templateId)
          }
          startEditing={route.name === "rate-card-new"}
          onBack={backFromCard}
        />
      )}
      {notesOpen && !isVendorsList ? (
        <div className="rc-modal-backdrop" role="presentation" onClick={() => setNotesOpen(false)}>
          <div className="rc-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="rc-modal__title">Rate card notes</h2>
            <p className="rc-modal__desc">Notes for this rate card — same shell pattern as Booking notes.</p>
            <button type="button" className="account-btn" onClick={() => setNotesOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

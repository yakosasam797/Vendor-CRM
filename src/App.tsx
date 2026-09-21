import { useEffect, useMemo, useRef, useState } from "react";
import {
  AppShell,
  Avatar,
  CreditsMeter,
  IconButton,
  NotesStrip,
  SearchField,
} from "@paryatech/design-system";
import { AccountLauncher } from "./components/account/AccountLauncher";
import { NotificationPanel } from "./components/notifications/NotificationPanel";
import { RoleSwitcher } from "./components/RoleSwitcher";
import { SettingsLauncherModal } from "./components/settings/SettingsLauncherModal";
import { WorkspaceSetupStrip } from "./components/setup/WorkspaceSetupStrip";
import { VendorsListPage } from "./components/VendorsListPage";
import { VendorRateCardsPage } from "./components/VendorRateCardsPage";
import { RateCardDetailPage } from "./components/rateCard/RateCardDetailPage";
import { NotesPanel } from "./components/NotesPanel";
import { SEED_VENDORS, type Vendor } from "./data/vendors";
import { getVendorService } from "./data/services";
import { buildNavGroups } from "./nav";
import { AccountHubPage } from "./pages/account/AccountHubPage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { SettingsHubPage } from "./pages/settings/SettingsHubPage";
import { canOpenWorkspaceSettings, type OrgRole } from "./permissions";
import { createBlankCard, getDetailCard } from "./rateCard/cards";
import { CreateRateCardModal } from "./components/CreateRateCardModal";
import type { RateCardDetail } from "./rateCard/types";
import {
  pathForHub,
  parsePathname,
  type CrmRoute,
  type HubRoute,
} from "./routing";
import type { AccountDestinationId, SettingsDestinationId } from "./settings/destinations";
import {
  IconBell,
  IconBrandCaret,
  IconChevronDown,
  IconChevronLeft,
  IconHelp,
  IconNotes,
  IconSettings,
} from "./icons";
import "./App.css";
import "./components/rateCard/RateCardDetail.css";
import "./components/settings/settings.css";

/** Opens WhatsApp chat for product support (Help). Call logs removed from the top bar. */
const SUPPORT_WHATSAPP_URL =
  "https://wa.me/919876543210?text=" +
  encodeURIComponent("Hi, I need help with Paryatech.");

function blankFromTemplate(templateId: string) {
  return templateId === "visa" ? "rc-new-visa" : "rc-new-hotel";
}

export default function App() {
  const [activeNav, setActiveNav] = useState("vendors");
  const [crmRoute, setCrmRoute] = useState<CrmRoute>({ name: "vendors" });
  const [hubRoute, setHubRoute] = useState<HubRoute | null>(() =>
    parsePathname(window.location.pathname),
  );
  const [notesOpen, setNotesOpen] = useState(false);
  const [orgRole, setOrgRole] = useState<OrgRole>("Owner");
  const [vendors, setVendors] = useState<Vendor[]>(() =>
    SEED_VENDORS.map((v) => structuredClone(v)),
  );
  const [flash, setFlash] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [setupDismissed, setSetupDismissed] = useState(false);
  const [openServiceId, setOpenServiceId] = useState<string | null>(null);
  const [createCardOpen, setCreateCardOpen] = useState(false);
  const [activeDraft, setActiveDraft] = useState<RateCardDetail | null>(null);

  const settingsBtnRef = useRef<HTMLElement>(null);
  const notifBtnRef = useRef<HTMLElement>(null);
  const accountBtnRef = useRef<HTMLButtonElement>(null);

  const leaveHub = () => {
    setHubRoute(null);
    if (window.location.pathname.startsWith("/settings") ||
      window.location.pathname.startsWith("/account") ||
      window.location.pathname === "/notifications") {
      window.history.pushState({}, "", "/");
    }
  };

  const openVendors = () => {
    leaveHub();
    setActiveNav("vendors");
    setOpenServiceId(null);
    setCrmRoute({ name: "vendors" });
  };
  const goHome = () => {
    leaveHub();
    setActiveNav("home");
    setOpenServiceId(null);
    setCrmRoute({ name: "vendors" });
  };
  const openVendor = (id: string, message?: string) => {
    leaveHub();
    setActiveNav("vendors");
    setOpenServiceId(null);
    if (message) setFlash(message);
    setCrmRoute({ name: "vendor", id });
  };
  const openCard = (id: string, vendorId: string) => {
    leaveHub();
    setActiveNav("vendors");
    setOpenServiceId(null);
    setCrmRoute({ name: "rate-card", id, vendorId });
  };
  const backFromCard = () => {
    if (crmRoute.name === "rate-card" || crmRoute.name === "rate-card-new") {
      setOpenServiceId(null);
      setCrmRoute({ name: "vendor", id: crmRoute.vendorId });
      return;
    }
    openVendors();
  };

  const navGroups = useMemo(
    () =>
      buildNavGroups(activeNav, (id) => {
        setActiveNav(id);
        leaveHub();
        setOpenServiceId(null);
        setCrmRoute({ name: "vendors" });
      }),
    [activeNav],
  );

  useEffect(() => {
    const onPop = () => {
      setHubRoute(parsePathname(window.location.pathname));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const goHub = (route: HubRoute) => {
    setSettingsOpen(false);
    setAccountOpen(false);
    setNotifOpen(false);
    setHubRoute(route);
    window.history.pushState({ hub: route }, "", pathForHub(route));
  };

  const isHub = hubRoute !== null;
  const isVendorsList = !isHub && crmRoute.name === "vendors" && activeNav === "vendors";
  const isVendorDetail = !isHub && crmRoute.name === "vendor";
  const isHome = !isHub && activeNav === "home" && crmRoute.name === "vendors";
  const isOtherNav =
    !isHub &&
    crmRoute.name === "vendors" &&
    activeNav !== "vendors" &&
    activeNav !== "home";

  const detail =
    !isHub && crmRoute.name === "rate-card"
      ? getDetailCard(crmRoute.id)
      : !isHub && crmRoute.name === "rate-card-new"
        ? (activeDraft ?? getDetailCard(blankFromTemplate(crmRoute.templateId)))
        : undefined;

  const isRateCard =
    !isHub && (crmRoute.name === "rate-card" || crmRoute.name === "rate-card-new");

  const notesTitle = isVendorsList
    ? "Module notes"
    : isHome
      ? "Workspace notes"
    : isHub
      ? "Workspace notes"
      : isRateCard
        ? "Rate card notes"
        : "Vendor notes";

  const notesItems = detail?.notes ?? [];
  const notesBadge = notesItems.length || undefined;

  const openNotes = () => setNotesOpen(true);

  const currentVendorId =
    crmRoute.name === "vendor"
      ? crmRoute.id
      : crmRoute.name === "rate-card" || crmRoute.name === "rate-card-new"
        ? crmRoute.vendorId
        : "exhosp";

  const vendorName = (id: string) =>
    vendors.find((v) => v.id === id)?.name ?? "Example Hospitality";

  const openService =
    isVendorDetail && openServiceId ? getVendorService(openServiceId) : undefined;

  const crumbs = isHub ? (
    <ol className="app-shell-crumbs__list">
      <li>
        <button type="button" className="app-shell-crumbs__link" onClick={leaveHub}>
          Workspace
        </button>
      </li>
      <li className="rc-crumb-sep" aria-hidden="true">
        ›
      </li>
      <li aria-current="page">
        {hubRoute.area === "settings"
          ? "Settings"
          : hubRoute.area === "account"
            ? "Account"
            : "Notifications"}
      </li>
    </ol>
  ) : (
    <ol className="app-shell-crumbs__list">
      {isHome ? (
        <li aria-current="page">Home</li>
      ) : isOtherNav ? (
        <li aria-current="page">
          {activeNav === "customers"
            ? "Customers"
            : activeNav.charAt(0).toUpperCase() + activeNav.slice(1).replace(/-/g, " ")}
        </li>
      ) : isVendorsList ? (
        <>
          <li>
            <button type="button" className="app-shell-crumbs__link" onClick={goHome}>
              CRM
            </button>
          </li>
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
            openService ? (
              <>
                <li>
                  <button
                    type="button"
                    className="app-shell-crumbs__link"
                    onClick={() => openVendor(currentVendorId)}
                  >
                    {vendorName(currentVendorId)}
                  </button>
                </li>
                <li className="rc-crumb-sep" aria-hidden="true">
                  ›
                </li>
                <li>
                  <button
                    type="button"
                    className="app-shell-crumbs__link"
                    onClick={() => setOpenServiceId(null)}
                  >
                    Services
                  </button>
                </li>
                <li className="rc-crumb-sep" aria-hidden="true">
                  ›
                </li>
                <li aria-current="page">{openService.name}</li>
              </>
            ) : (
              <li aria-current="page">{vendorName(currentVendorId)}</li>
            )
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

  const openSettingsDestination = (id: SettingsDestinationId) => {
    goHub({ area: "settings", id });
  };

  const openAccountDestination = (id: AccountDestinationId | "notification-preferences") => {
    goHub({ area: "account", id });
  };

  return (
    <AppShell
      brandName="paryatech"
      brandAction={<IconBrandCaret />}
      listMode={false}
      notes={
        <NotesStrip
          label={notesTitle}
          icon={<IconNotes />}
          badge={notesBadge}
          tip="Open notes"
          addTip="Write a note"
          onOpen={openNotes}
          onAdd={openNotes}
        />
      }
      navGroups={navGroups}
      sidebarFooter={<CreditsMeter remaining={720} total={1000} />}
      leading={
        isHub ? (
          <IconButton label="Back to workspace" onClick={leaveHub}>
            <IconChevronLeft />
          </IconButton>
        ) : isHome ? undefined : (
          <IconButton
            label={
              isVendorsList
                ? "Back to home"
                : isVendorDetail
                  ? "Back to vendors"
                  : "Back to vendor"
            }
            onClick={isVendorsList ? goHome : isVendorDetail ? openVendors : backFromCard}
          >
            <IconChevronLeft />
          </IconButton>
        )
      }
      crumbs={crumbs}
      actions={
        <>
          <SearchField
            className="app-top-search"
            placeholder="Search anything"
            aria-label="Search anything"
          />
          <RoleSwitcher value={orgRole} onChange={setOrgRole} />
          <span ref={settingsBtnRef}>
            <IconButton
              className="app-top-util"
              label="Workspace settings"
              onClick={() => {
                if (!canOpenWorkspaceSettings(orgRole)) return;
                setAccountOpen(false);
                setNotifOpen(false);
                setSettingsOpen(true);
              }}
            >
              <IconSettings />
            </IconButton>
          </span>
          <IconButton
            className="app-top-util"
            label="Help and support"
            onClick={() => window.open(SUPPORT_WHATSAPP_URL, "_blank", "noopener,noreferrer")}
          >
            <IconHelp />
          </IconButton>
          <span ref={notifBtnRef}>
            <IconButton
              className="app-top-util"
              label="Notifications"
              alert
              onClick={() => {
                setSettingsOpen(false);
                setAccountOpen(false);
                setNotifOpen(true);
              }}
            >
              <IconBell />
            </IconButton>
          </span>
          <div className="account-btn-wrap">
            <button
              ref={accountBtnRef}
              type="button"
              className="account-btn"
              aria-label="Account, Vrushabh Jain"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              onClick={() => {
                setSettingsOpen(false);
                setNotifOpen(false);
                setAccountOpen((open) => !open);
              }}
            >
              <Avatar tone="pink" size={26}>
                VJ
              </Avatar>
              <IconChevronDown size={13} />
            </button>
            <AccountLauncher
              open={accountOpen}
              anchorRef={accountBtnRef}
              onClose={() => setAccountOpen(false)}
              onNavigate={(id) => {
                setAccountOpen(false);
                openAccountDestination(id);
              }}
              onSignOut={() => {
                setAccountOpen(false);
                window.alert("Sign out is a demo action in this trial.");
              }}
            />
          </div>
        </>
      }
    >
      {isHub && hubRoute.area === "settings" ? (
        <SettingsHubPage
          id={hubRoute.id}
          orgRole={orgRole}
          onAllSettings={() => setSettingsOpen(true)}
        />
      ) : isHub && hubRoute.area === "account" ? (
        <AccountHubPage id={hubRoute.id} />
      ) : isHub && hubRoute.area === "notifications" ? (
        <NotificationsPage
          onOpenPreferences={() => openAccountDestination("notification-preferences")}
        />
      ) : isVendorsList ? (
        <>
          <WorkspaceSetupStrip
            orgRole={orgRole}
            dismissed={setupDismissed}
            onDismiss={() => setSetupDismissed(true)}
            onOpen={openSettingsDestination}
          />
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
        </>
      ) : isVendorDetail && crmRoute.name === "vendor" ? (
        <VendorRateCardsPage
          vendorId={crmRoute.id}
          vendors={vendors}
          orgRole={orgRole}
          flash={flash}
          onClearFlash={() => setFlash(null)}
          openServiceId={openServiceId}
          onOpenServiceIdChange={setOpenServiceId}
          onOpenVendor={(id) => openVendor(id)}
          onVendorsChange={(next) => {
            setVendors(next);
            setFlash("Vendor details updated successfully.");
          }}
          onOpenCard={(id) => openCard(id, crmRoute.id)}
          onNewCard={() => setCreateCardOpen(true)}
        />
      ) : (
        <RateCardDetailPage
          key={
            crmRoute.name === "rate-card"
              ? crmRoute.id
              : activeDraft?.id ??
                `new-${crmRoute.name === "rate-card-new" ? crmRoute.templateId : "x"}`
          }
          cardId={
            crmRoute.name === "rate-card"
              ? crmRoute.id
              : (activeDraft?.id ??
                blankFromTemplate(
                  crmRoute.name === "rate-card-new" ? crmRoute.templateId : "hotel",
                ))
          }
          seedCard={
            crmRoute.name === "rate-card-new" ? (activeDraft ?? undefined) : undefined
          }
          startEditing={crmRoute.name === "rate-card-new"}
          onBack={backFromCard}
          onOpenNotes={openNotes}
          onDraftChange={
            crmRoute.name === "rate-card-new"
              ? (next) => setActiveDraft(next)
              : undefined
          }
        />
      )}

      {isVendorDetail && crmRoute.name === "vendor" ? (
        <CreateRateCardModal
          open={createCardOpen}
          vendorName={vendorName(crmRoute.id)}
          onClose={() => setCreateCardOpen(false)}
          onCreate={(templateId) => {
            const draft = createBlankCard(templateId, vendorName(crmRoute.id));
            setActiveDraft(draft);
            setCreateCardOpen(false);
            setCrmRoute({
              name: "rate-card-new",
              templateId,
              vendorId: crmRoute.id,
            });
          }}
        />
      ) : null}

      <SettingsLauncherModal
        open={settingsOpen}
        orgRole={orgRole}
        onClose={() => setSettingsOpen(false)}
        returnFocusRef={settingsBtnRef}
        onNavigate={openSettingsDestination}
      />

      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        returnFocusRef={notifBtnRef}
        onViewAll={() => goHub({ area: "notifications" })}
        onOpenPreferences={() => openAccountDestination("notification-preferences")}
      />

      <NotesPanel
        open={notesOpen}
        title={notesTitle}
        notes={notesItems}
        onClose={() => setNotesOpen(false)}
      />
    </AppShell>
  );
}

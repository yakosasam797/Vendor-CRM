import { useState } from "react";
import { Button } from "@paryatech/design-system";
import { IconBell, IconDevices, IconShield, IconUser } from "../../icons";
import {
  SettingsComingLater,
  SettingsCrumbs,
  SettingsPageHeader,
  SettingsSectionCard,
  UnsavedChangesBar,
} from "../../components/settings/SettingsPageChrome";
import "../../components/settings/settings.css";
import type { AccountDestinationId } from "../../settings/destinations";

export function AccountHubPage({
  id,
}: {
  id: AccountDestinationId | "notification-preferences";
}) {
  if (id === "notification-preferences") {
    return <NotificationPreferencesPage />;
  }
  if (id === "profile") return <ProfilePage />;
  if (id === "security") return <SecurityPage />;
  if (id === "sessions") return <SessionsPage />;
  if (id === "preferences") return <PreferencesPage />;
  if (id === "workspaces") return <WorkspacesPage />;
  return null;
}

function ProfilePage() {
  const initial = { name: "Vrushabh Jain", email: "vrushabh@paryatech.app", phone: "+91 98470 10001" };
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  return (
    <div className="settings-page">
      <SettingsCrumbs area="Account" page="My profile" />
      <SettingsPageHeader
        icon={<IconUser size={18} />}
        title="My profile"
        description="Personal name, photo and contact details for your account."
      />
      <SettingsSectionCard title="Profile">
        <div className="settings-grid-2">
          <label className="settings-field">
            <span className="settings-field__label">Full name</span>
            <input
              className="settings-field__input"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </label>
          <label className="settings-field">
            <span className="settings-field__label">Email</span>
            <input
              className="settings-field__input"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            />
          </label>
          <label className="settings-field">
            <span className="settings-field__label">Phone</span>
            <input
              className="settings-field__input"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            />
          </label>
        </div>
      </SettingsSectionCard>
      <UnsavedChangesBar
        dirty={dirty}
        onDiscard={() => setDraft(saved)}
        onSave={() => setSaved(draft)}
      />
    </div>
  );
}

function SecurityPage() {
  return (
    <div className="settings-page">
      <SettingsCrumbs area="Account" page="Security and sign-in" />
      <SettingsPageHeader
        icon={<IconShield size={18} />}
        title="Security and sign-in"
        description="Password and two-factor authentication for your personal account."
      />
      <SettingsSectionCard title="Password" action={<Button variant="brand" size="sm">Change password</Button>}>
        <p className="settings-section__desc" style={{ margin: 0 }}>
          Last changed 84 days ago.
        </p>
      </SettingsSectionCard>
      <SettingsSectionCard title="Two-factor authentication" action={<Button variant="primary" size="sm">Enable 2FA</Button>}>
        <p className="settings-section__desc" style={{ margin: 0 }}>
          Not enabled.
        </p>
      </SettingsSectionCard>
    </div>
  );
}

function SessionsPage() {
  return (
    <div className="settings-page">
      <SettingsCrumbs area="Account" page="Devices and sessions" />
      <SettingsPageHeader
        icon={<IconDevices size={18} />}
        title="Devices and sessions"
        description="Review signed-in devices and end sessions you no longer recognize."
      />
      <SettingsSectionCard title="This device">
        <p className="settings-section__desc" style={{ margin: 0 }}>
          Windows · Chrome · Active now
        </p>
      </SettingsSectionCard>
      <SettingsSectionCard title="Other sessions" action={<Button variant="brand" size="sm">Sign out others</Button>}>
        <p className="settings-section__desc" style={{ margin: 0 }}>
          iPhone · Safari · 2 days ago
        </p>
      </SettingsSectionCard>
    </div>
  );
}

function PreferencesPage() {
  return (
    <div className="settings-page">
      <SettingsCrumbs area="Account" page="Personal preferences" />
      <SettingsPageHeader
        icon={<IconUser size={18} />}
        title="Personal preferences"
        description="Language, time zone and display preferences for your account."
      />
      <SettingsSectionCard title="Locale">
        <div className="settings-grid-2">
          <label className="settings-field">
            <span className="settings-field__label">Language</span>
            <select className="settings-field__select" defaultValue="en-IN">
              <option value="en-IN">English (India)</option>
              <option value="en-GB">English (UK)</option>
            </select>
          </label>
          <label className="settings-field">
            <span className="settings-field__label">Time zone</span>
            <select className="settings-field__select" defaultValue="Asia/Kolkata">
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="UTC">UTC</option>
            </select>
          </label>
        </div>
      </SettingsSectionCard>
    </div>
  );
}

function WorkspacesPage() {
  return (
    <div className="settings-page">
      <SettingsCrumbs area="Account" page="Workspace role and memberships" />
      <SettingsPageHeader
        icon={<IconUser size={18} />}
        title="Workspace role and memberships"
        description="Workspaces you belong to and your role in each."
      />
      <SettingsSectionCard title="Current workspace">
        <p className="settings-section__desc" style={{ margin: 0 }}>
          Paryatech · Owner
        </p>
      </SettingsSectionCard>
    </div>
  );
}

function NotificationPreferencesPage() {
  return (
    <div className="settings-page">
      <SettingsCrumbs area="Account" page="Notification preferences" />
      <SettingsPageHeader
        icon={<IconBell size={18} />}
        title="Notification preferences"
        description="Choose how you receive mentions, tasks, approvals and system notices."
      />
      <SettingsSectionCard title="Channels">
        <label className="settings-field">
          <span className="settings-field__label">In-app notifications</span>
          <select className="settings-field__select" defaultValue="all">
            <option value="all">All activity</option>
            <option value="important">Important only</option>
          </select>
        </label>
        <label className="settings-field">
          <span className="settings-field__label">Email notifications</span>
          <select className="settings-field__select" defaultValue="digest">
            <option value="digest">Daily digest</option>
            <option value="immediate">Immediate</option>
            <option value="off">Off</option>
          </select>
        </label>
        <label className="settings-field">
          <span className="settings-field__label">Push notifications</span>
          <select className="settings-field__select" defaultValue="mentions">
            <option value="mentions">Mentions and assignments</option>
            <option value="all">All</option>
            <option value="off">Off</option>
          </select>
        </label>
        <label className="settings-field">
          <span className="settings-field__label">WhatsApp notifications</span>
          <select className="settings-field__select" defaultValue="off">
            <option value="off">Off</option>
            <option value="urgent">Urgent only</option>
          </select>
        </label>
      </SettingsSectionCard>
      <SettingsSectionCard title="Timing">
        <div className="settings-grid-2">
          <label className="settings-field">
            <span className="settings-field__label">Digest frequency</span>
            <select className="settings-field__select" defaultValue="daily">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
          <label className="settings-field">
            <span className="settings-field__label">Quiet hours</span>
            <select className="settings-field__select" defaultValue="22-07">
              <option value="off">Off</option>
              <option value="22-07">22:00 – 07:00</option>
            </select>
          </label>
        </div>
      </SettingsSectionCard>
      <SettingsComingLater title="Advanced routing rules" />
    </div>
  );
}

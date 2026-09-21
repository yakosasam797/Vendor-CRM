import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 17, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconHome({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

export function IconInbox({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.5 6.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-5.5A2 2 0 0 0 16.8 5H7.2a2 2 0 0 0-1.7 1.5z" />
    </Svg>
  );
}

export function IconNews({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M4 22h16a2 2 0 0 0 2-2V4a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v16a2 2 0 0 1-2 2 2 2 0 0 1-2-2V9h4" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </Svg>
  );
}

export function IconAutomations({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
    </Svg>
  );
}

export function IconReports({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M3 3v18h18" />
      <path d="M7 15l3-4 3 3 4-6" />
    </Svg>
  );
}

export function IconBrandCaret({ size = 15 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.9">
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function IconTasks({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function IconQueries({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M15 2H8.6A1.6 1.6 0 0 0 7 3.6v16.8A1.6 1.6 0 0 0 8.6 22h10.8a1.6 1.6 0 0 0 1.6-1.6V7.5Z" />
      <path d="M14 2v6h6" />
    </Svg>
  );
}

export function IconPackages({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </Svg>
  );
}

export function IconBookings({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </Svg>
  );
}

export function IconCustomers({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.2 19a6 6 0 0 1 11.6 0" />
    </Svg>
  );
}

export function IconVendors({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M3 9.5 4.5 4h15L21 9.5" />
      <path d="M4 9.5V20h16V9.5" />
      <path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    </Svg>
  );
}

export function IconFinance({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M3 21h18" />
      <path d="M5 21V10l7-5 7 5v11" />
      <path d="M9 21v-6h6v6" />
    </Svg>
  );
}

export function IconTeam({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </Svg>
  );
}

export function IconSettings({ size = 17 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="2">
      <path d="M21 4h-7" />
      <path d="M10 4H3" />
      <path d="M21 12h-9" />
      <path d="M8 12H3" />
      <path d="M21 20h-5" />
      <path d="M12 20H3" />
      <path d="M14 2v4" />
      <path d="M8 10v4" />
      <path d="M16 18v4" />
    </Svg>
  );
}

export function IconHelp({ size = 17 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </Svg>
  );
}

export function IconChevronDown({ size = 16 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function IconCircleUser({ size = 16 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.2 19a6 6 0 0 1 11.6 0" />
    </Svg>
  );
}

export function IconPhone({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.35 1.84.59 2.8.72A2 2 0 0 1 22 16.92z" />
    </Svg>
  );
}

export function IconMail({ size = 15 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </Svg>
  );
}

export function IconBell({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Svg>
  );
}

export function IconUser({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

export function IconFilter({ size = 17 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.9">
      <path d="M3 5h18" />
      <path d="M7 12h10" />
      <path d="M10 19h4" />
    </Svg>
  );
}

export function IconCalendar({ size = 17 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </Svg>
  );
}

export function IconRefresh({ size = 14 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.9">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </Svg>
  );
}

export function IconPlus({ size = 14 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.9">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Svg>
  );
}

export function IconPencil({ size = 14 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.9">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Svg>
  );
}

export function IconImport({ size = 14 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.9">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </Svg>
  );
}

export function IconChevronLeft({ size = 16 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="m15 18-6-6 6-6" />
    </Svg>
  );
}

export function IconClose({ size = 16 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Svg>
  );
}

export function IconDownload({ size = 14 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.9">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </Svg>
  );
}

export function IconWarn({ size = 16 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.8">
      <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Svg>
  );
}

export function IconFile({ size = 15 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.7">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </Svg>
  );
}

export function IconCard({ size = 15 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.8">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </Svg>
  );
}

export function IconNotes({ size = 16 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h5" />
    </Svg>
  );
}

export function IconAttach({ size = 15 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.8">
      <path d="m21.4 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </Svg>
  );
}

export function IconSend({ size = 15 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.9">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </Svg>
  );
}

export function IconClock({ size = 13 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  );
}

export function IconModule({ size = 15 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </Svg>
  );
}

/** Bookmark / record-ref mark — booking `bk-ref` chip */
export function IconBookmark({ size = 12 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.9">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

export function IconCopy({ size = 12 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.9">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Svg>
  );
}

export function IconCheck({ size = 12 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="2.2">
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}

/** Map pin — booking list LeadCell */
export function IconPin({ size = 15 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  );
}

export function IconBuilding({ size = 15 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
    </Svg>
  );
}

export function IconGlobe({ size = 15 }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </Svg>
  );
}

export function IconBed({ size = 15 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
      <path d="M4 10V6a2 2 0 0 1 2-2h6v6" />
      <path d="M2 18h20" />
    </Svg>
  );
}

export function IconCar({ size = 15 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M5 17h14v-5l-2-5H7L5 12v5Z" />
      <path d="M5 17H3v2h2M19 17h2v2h-2" />
      <circle cx="7.5" cy="17" r="1.5" />
      <circle cx="16.5" cy="17" r="1.5" />
    </Svg>
  );
}

export function IconImage({ size = 16 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </Svg>
  );
}

export function IconMore({ size = 16 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="2">
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </Svg>
  );
}

/** Checklist mark — booking Tasks LeadCell */
export function IconTaskCheck({ size = 15 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </Svg>
  );
}

/** Open / jump-out — booking Tasks row action */
export function IconOpenOut({ size = 14 }: IconProps) {
  return (
    <Svg size={size} strokeWidth="1.9">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </Svg>
  );
}

export function IconCompass({ size = 15 }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.5 6.5L7 17l2.5-6.5L16 8Z" />
    </Svg>
  );
}

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 10.6 12 3l9 7.6" />
      <path d="M5.5 9.4V21h13V9.4" />
      <path d="M9.5 21v-6h5v6" />
    </Icon>
  );
}

export function IconApps(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </Icon>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M16 21v-1.8a4.2 4.2 0 0 0-4.2-4.2H6.2A4.2 4.2 0 0 0 2 19.2V21" />
      <circle cx="9" cy="7.2" r="4" />
      <path d="M22 21v-1.8a4.2 4.2 0 0 0-3.1-4.05" />
      <path d="M16.2 3.3a4 4 0 0 1 0 7.75" />
    </Icon>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </Icon>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.1.37.32.7.6 1 .3.26.68.4 1.1.4H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5.6Z" />
    </Icon>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 5 7 7-7 7" />
    </Icon>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 9 7 7 7-7" />
    </Icon>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m15 5-7 7 7 7" />
    </Icon>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  );
}

export function IconArrowUpRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </Icon>
  );
}

export function IconExternal(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4h6v6" />
      <path d="m20 4-9 9" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </Icon>
  );
}

export function IconStar(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 3.6 2.5 5.1 5.6.8-4 3.9.94 5.6L12 16.4 6.96 19l.94-5.6-4-3.9 5.6-.8Z" />
    </Icon>
  );
}

export function IconStarFilled(props: IconProps) {
  return (
    <Icon {...props} fill="currentColor" stroke="none">
      <path d="m12 3.4 2.63 5.33 5.87.85-4.25 4.14 1 5.86L12 16.86l-5.25 2.72 1-5.86L3.5 9.58l5.87-.85Z" />
    </Icon>
  );
}

export function IconLink(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 13a5 5 0 0 0 7.07 0l1.8-1.8a5 5 0 0 0-7.07-7.07l-.9.9" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-1.8 1.8a5 5 0 0 0 7.07 7.07l.9-.9" />
    </Icon>
  );
}

export function IconRepo(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="6" cy="5" r="2.4" />
      <circle cx="6" cy="19" r="2.4" />
      <circle cx="18" cy="19" r="2.4" />
      <path d="M6 7.4v9.2" />
      <path d="M18 16.6v-3.1a3.5 3.5 0 0 0-3.5-3.5H9.5" />
      <path d="M10 6.5h4.5a3.5 3.5 0 0 1 3.5 3.5" />
    </Icon>
  );
}

export function IconServer(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path d="M7 7h.01M7 17h.01" />
    </Icon>
  );
}

export function IconDatabase(props: IconProps) {
  return (
    <Icon {...props}>
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
      <path d="M4 11.5v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </Icon>
  );
}

export function IconKey(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="15.5" r="4.5" />
      <path d="m11.2 12.3 8.3-8.3" />
      <path d="m16 4 3.5 3.5" />
      <path d="m13 7 2.5 2.5" />
    </Icon>
  );
}

export function IconLock(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
      <path d="M12 14v3" />
    </Icon>
  );
}

export function IconUnlock(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 0 1 7.6-1.7" />
      <path d="M12 14v3" />
    </Icon>
  );
}

export function IconEye(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function IconEyeOff(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m3 3 18 18" />
      <path d="M10.6 6.1A10.6 10.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-2.2 2.9" />
      <path d="M6.3 7.6A16.7 16.7 0 0 0 2.5 12S6 18 12 18a9.7 9.7 0 0 0 4.1-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Icon>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H6a2 2 0 0 0-2 2v6.5A2.5 2.5 0 0 0 6.5 14" />
    </Icon>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Icon>
  );
}

export function IconPencil(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h4.2L19 9.2a2.3 2.3 0 0 0-3.2-3.2L5 16.8V20Z" />
      <path d="m14.5 7.5 3 3" />
    </Icon>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V7" />
      <path d="m6 7 .8 12.2A1.8 1.8 0 0 0 8.6 21h6.8a1.8 1.8 0 0 0 1.8-1.8L18 7" />
      <path d="M10 11v6M14 11v6" />
    </Icon>
  );
}

export function IconX(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </Icon>
  );
}

export function IconShield(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 4.8 6v5.4c0 4.4 3 8.4 7.2 9.6 4.2-1.2 7.2-5.2 7.2-9.6V6Z" />
      <path d="m8.8 12 2.1 2.1 4.3-4.4" />
    </Icon>
  );
}

export function IconClock(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3.2 2" />
    </Icon>
  );
}

export function IconMail(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.4" />
      <path d="m4 7 8 6 8-6" />
    </Icon>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 3.5h2.2l1.6 4-2 1.3a12.5 12.5 0 0 0 6.9 6.9l1.3-2 4 1.6v2.2a2.5 2.5 0 0 1-2.7 2.5A16.8 16.8 0 0 1 4 6.2a2.5 2.5 0 0 1 2.5-2.7Z" />
    </Icon>
  );
}

export function IconGlobe(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5a13 13 0 0 1 0 17 13 13 0 0 1 0-17Z" />
    </Icon>
  );
}

export function IconSparkles(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 3 1.5 4.2L18 9l-4.5 1.8L12 15l-1.5-4.2L6 9l4.5-1.8Z" />
      <path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" />
      <path d="m5 14 .7 1.8 1.8.7-1.8.7L5 19l-.7-1.8L2.5 16.5l1.8-.7Z" />
    </Icon>
  );
}

export function IconFolder(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.2l2 2.5h7.8A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z" />
    </Icon>
  );
}

export function IconActivity(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 12h4l2.5-7 5 14 2.5-7h4" />
    </Icon>
  );
}

export function IconFilter(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 5h18l-7 8v5.5L10 21v-8Z" />
    </Icon>
  );
}

export function IconMore(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V13M12 16.5h.01" />
    </Icon>
  );
}

export function IconInfo(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 7.8h.01" />
    </Icon>
  );
}

export function IconLoader(props: IconProps) {
  return (
    <Icon {...props} style={{ animation: "spin 0.9s linear infinite", ...props.style }}>
      <path d="M21 12a9 9 0 1 1-6.2-8.6" />
    </Icon>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 21V6.5L12 3l8 3.5V21" />
      <path d="M4 21h16" />
      <path d="M8 9h2M14 9h2M8 13h2M14 13h2M8 17h2M14 17h2" />
    </Icon>
  );
}

export function IconUser(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20.5a7 7 0 0 1 14 0" />
    </Icon>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.4" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </Icon>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 11a8 8 0 0 0-14-4.5L4 9" />
      <path d="M4 4v5h5" />
      <path d="M4 13a8 8 0 0 0 14 4.5L20 15" />
      <path d="M20 20v-5h-5" />
    </Icon>
  );
}

export function IconCloud(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 18.5h10a3.5 3.5 0 0 0 .4-6.98A5.5 5.5 0 0 0 6.7 9.8 4.4 4.4 0 0 0 7 18.5Z" />
    </Icon>
  );
}

export function IconWifiOff(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m3 3 18 18" />
      <path d="M8.5 8.6A11.5 11.5 0 0 1 21 9.4" />
      <path d="M5 12.6a11.4 11.4 0 0 1 1.9-1.2" />
      <path d="M8.8 15.7a6.5 6.5 0 0 1 6.8.3" />
      <path d="M12 19h.01" />
    </Icon>
  );
}

export function IconTerminal(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.4" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </Icon>
  );
}

export function IconGithub(props: IconProps) {
  return (
    <Icon {...props} stroke="none" fill="currentColor">
      <path d="M12 2.2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18a2.65 2.65 0 0 0-1.11-1.46c-.9-.62.07-.61.07-.61a2.1 2.1 0 0 1 1.53 1.03 2.13 2.13 0 0 0 2.91.83 2.13 2.13 0 0 1 .63-1.34c-2.22-.25-4.56-1.11-4.56-4.94a3.87 3.87 0 0 1 1.03-2.68 3.6 3.6 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.55 9.55 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02a3.6 3.6 0 0 1 .1 2.64 3.86 3.86 0 0 1 1.03 2.68c0 3.84-2.34 4.68-4.57 4.93a2.38 2.38 0 0 1 .68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2.2Z" />
    </Icon>
  );
}

export function IconLockCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
      <path d="m9.5 15 1.8 1.8 3.4-3.6" />
    </Icon>
  );
}

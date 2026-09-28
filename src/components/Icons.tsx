export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.17 8.17 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.3-.02-.47-.02-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.21 3.72.59.25 1.05.4 1.4.52.59.18 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg className="icon-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 6h14M3 10h14M3 14h14" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

const serviceIcons = {
  target: (
    <svg viewBox="0 0 40 40" fill="none" stroke="#F5F2E6" strokeWidth="1.4">
      <circle cx="20" cy="20" r="16" />
      <circle cx="20" cy="20" r="9.5" />
      <circle cx="20" cy="20" r="2.2" fill="#F5F2E6" />
      <line x1="20" y1="1" x2="20" y2="8" />
      <line x1="20" y1="32" x2="20" y2="39" />
    </svg>
  ),
  compass: (
    <svg viewBox="0 0 40 40" fill="none" stroke="#F5F2E6" strokeWidth="1.4">
      <circle cx="20" cy="20" r="15" />
      <path d="M20 8v6M20 26v6M8 20h6M26 20h6" />
      <circle cx="20" cy="20" r="3" fill="#F5F2E6" />
    </svg>
  ),
  network: (
    <svg viewBox="0 0 40 40" fill="none" stroke="#F5F2E6" strokeWidth="1.4">
      <circle cx="11" cy="14" r="2" fill="#F5F2E6" stroke="none" />
      <circle cx="26" cy="10" r="2" fill="#F5F2E6" stroke="none" />
      <circle cx="29" cy="26" r="2" fill="#F5F2E6" stroke="none" />
      <circle cx="13" cy="28" r="2" fill="#F5F2E6" stroke="none" />
      <path d="M11 14L26 10M26 10L29 26M29 26L13 28M13 28L11 14" />
    </svg>
  ),
  prism: (
    <svg viewBox="0 0 40 40" fill="none" stroke="#F5F2E6" strokeWidth="1.4">
      <path d="M20 6L32 26H8Z" />
      <path d="M20 6L14 26M20 6L26 26" opacity="0.6" />
    </svg>
  ),
};

export function ServiceIcon({ kind }: { kind: keyof typeof serviceIcons }) {
  return serviceIcons[kind];
}

/** Brand marks for the social links; each is labelled by its link, so hidden here. */
export function SocialIcon({ network }: { network: "Facebook" | "Instagram" | "LinkedIn" }) {
  const paths = {
    Facebook:
      "M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.87.25-1.46 1.5-1.46h1.6V4.46A21 21 0 0 0 14.3 4.3c-2.3 0-3.8 1.4-3.8 3.96v2.24H7.9v3h2.6V21h3Z",
    Instagram:
      "M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.8-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM12 3c-2.4 0-2.7 0-3.7.06-3.2.14-5 1.94-5.2 5.2C3 9.3 3 9.6 3 12s0 2.7.06 3.7c.14 3.2 1.94 5 5.2 5.2 1 .05 1.3.06 3.7.06s2.7 0 3.7-.06c3.2-.14 5-1.94 5.2-5.2.05-1 .06-1.3.06-3.7s0-2.7-.06-3.7c-.14-3.2-1.94-5-5.2-5.2C14.7 3 14.4 3 12 3Zm0 1.6c2.4 0 2.7 0 3.6.05 2.4.1 3.6 1.26 3.7 3.7.04.95.05 1.23.05 3.65s0 2.7-.05 3.65c-.1 2.43-1.3 3.6-3.7 3.7-.95.04-1.23.05-3.6.05s-2.7 0-3.65-.05c-2.44-.1-3.6-1.27-3.7-3.7C4.6 14.7 4.6 14.4 4.6 12s0-2.7.05-3.65c.1-2.44 1.27-3.6 3.7-3.7.95-.04 1.23-.05 3.65-.05Z",
    LinkedIn:
      "M6.9 8.7H3.6V20h3.3V8.7ZM5.25 3.5a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM20.4 13.5c0-3.03-.65-5.1-4.2-5.1-1.7 0-2.84.93-3.3 1.8h-.05V8.7H9.7V20H13v-5.6c0-1.48.28-2.9 2.1-2.9 1.8 0 1.82 1.68 1.82 3V20h3.3l.18-6.5Z",
  } as const;
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d={paths[network]} />
    </svg>
  );
}

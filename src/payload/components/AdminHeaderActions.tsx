import LogoutButton from "./LogoutButton";

/**
 * The admin's top bar, on every page: the website, and a way out. Your
 * account is the round initials button beside these (Payload's own).
 */
export default function AdminHeaderActions() {
  return (
    <div className="zk-header-actions">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="zk-header-btn zk-header-btn--site"
        title="Open the website in a new tab"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        <span className="zk-header-btn__label">View website</span>
      </a>

      <LogoutButton variant="header" />
    </div>
  );
}

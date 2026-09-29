"use client";

import { useState } from "react";

type Props = {
  variant?: "sidebar" | "header" | "chip";
  className?: string;
};

/**
 * Logout button component that destroys the current Payload session
 * and redirects cleanly to /admin/login.
 */
export default function LogoutButton({ variant = "sidebar", className = "" }: Props) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      /* network or parse error — proceed with redirect */
    }

    // Force hard redirect to clear browser-cached auth states
    window.location.href = "/admin/login";
  };

  const getClassName = () => {
    if (variant === "header") {
      return `zk-btn-logout zk-btn-logout--header ${className}`.trim();
    }
    if (variant === "chip") {
      return `zk-chip zk-chip--danger ${className}`.trim();
    }
    return `zk-logout ${className}`.trim();
  };

  return (
    <button
      type="button"
      className={getClassName()}
      onClick={handleLogout}
      disabled={loading}
      title="Log out of admin session"
      aria-label="Log out"
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
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span className="zk-header-btn__label">{loading ? "Logging out…" : "Log out"}</span>
    </button>
  );
}

"use client";

import { useAuth } from "@payloadcms/ui";

/**
 * Above the Enquiries and Quote requests lists: downloads every lead as a
 * spreadsheet. Shown to admins only, matching who the download is open to.
 */
export default function ExportButton({ href, label }: { href: string; label: string }) {
  const { user } = useAuth<{ role?: string }>();
  if (user?.role !== "superadmin" && user?.role !== "admin") return null;
  return (
    <div className="zk-export">
      <a className="zk-export__btn" href={href} download>
        {label}
      </a>
      <span className="zk-export__hint">Opens in Excel, Google Sheets or Numbers.</span>
    </div>
  );
}

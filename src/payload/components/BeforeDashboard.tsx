import type React from "react";
import Link from "next/link";
import { getPayload, type Where } from "payload";
import config from "../../payload.config";
import Greeting from "./Greeting";
import TrafficChart from "./TrafficChart";
import TopPages from "./TopPages";
import { sql } from "@payloadcms/db-postgres";
import { OPEN_STAGES } from "../fields/lead";
import { dbKind } from "../db";

type Props = {
  user?: {
    id?: string | number;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
};

const ROLE_LABEL: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  worker: "Worker",
};

const DAYS = 30;

const ICON = (paths: React.ReactNode) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
);

/**
 * Jobs that start from nothing. Reading enquiries, quotes and calls starts from
 * the "Needs your attention" list instead, so they are not repeated here.
 */
type Shortcut = { href: string; label: string; icon: React.ReactNode; external?: boolean; adminOnly?: boolean };
const SHORTCUTS: Shortcut[] = [
  {
    href: "/admin/collections/projects/create",
    label: "Add a finished project",
    icon: ICON(<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></>),
  },
  {
    href: "/admin/collections/posts/create",
    label: "Write a blog post",
    icon: ICON(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>),
  },
  {
    href: "/admin/globals/site-settings",
    label: "Edit contact details and homepage text",
    icon: ICON(<><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></>),
  },
  {
    href: "/api/submissions/export",
    label: "Download enquiries (spreadsheet)",
    adminOnly: true,
    icon: ICON(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></>),
  },
  {
    href: "/",
    label: "View the website",
    external: true,
    icon: ICON(<><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>),
  },
];

export default async function BeforeDashboard({ user }: Props) {
  const payload = await getPayload({ config });

  const countOf = async (collection: string, where?: Where) => {
    try {
      const { totalDocs } = await payload.find({
        collection: collection as never,
        limit: 0,
        depth: 0,
        ...(where ? { where } : {}),
      });
      return totalDocs;
    } catch {
      return 0;
    }
  };

  const role = user?.role ? ROLE_LABEL[user.role] ?? user.role : null;
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (DAYS - 1));

  // Lead tracker: anything not yet won or closed, what's due for a follow-up
  // by the end of today, and what was won since the 1st of this month.
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const openLead = (collection: keyof typeof OPEN_STAGES): Where => ({ status: { in: OPEN_STAGES[collection] } });
  const dueLead = (collection: keyof typeof OPEN_STAGES): Where => ({
    and: [openLead(collection), { followUp: { less_than_equal: endOfToday.toISOString() } }],
  });

  const wonThisMonth = async () => {
    let count = 0;
    let value = 0;
    await Promise.all(
      (["submissions", "quotes"] as const).map(async (collection) => {
        try {
          const { docs } = await payload.find({
            collection,
            limit: 500,
            depth: 0,
            select: { dealValue: true },
            where: { and: [{ status: { equals: "won" } }, { wonAt: { greater_than_equal: monthStart.toISOString() } }] },
          });
          count += docs.length;
          value += docs.reduce((sum, d) => sum + (Number((d as { dealValue?: number | null }).dealValue) || 0), 0);
        } catch {
          // Leave the tile at what could be counted.
        }
      })
    );
    return { count, value };
  };

  /**
   * Views per day and the top pages. The database does the counting: loading
   * every page view of the month (up to 20,000 rows) to count them in here
   * was the slowest part of opening the dashboard.
   */
  const pageViewStats = async () => {
    const perDay = new Map<string, number>();
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(since);
      d.setUTCDate(since.getUTCDate() + i);
      perDay.set(d.toISOString().slice(0, 10), 0);
    }
    let perPath: { path: string; views: number }[] = [];

    if (dbKind === "postgres") {
      const drizzle = (payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<{ rows: Record<string, unknown>[] }> } }).drizzle;
      const [byDay, byPath] = await Promise.all([
        drizzle.execute(
          sql`select to_char(created_at at time zone 'UTC', 'YYYY-MM-DD') as day, count(*)::int as views
              from page_views where created_at >= ${since.toISOString()} group by 1`
        ),
        drizzle.execute(
          sql`select path, count(*)::int as views from page_views
              where created_at >= ${since.toISOString()} group by path order by views desc limit 5`
        ),
      ]);
      for (const r of byDay.rows) if (perDay.has(String(r.day))) perDay.set(String(r.day), Number(r.views));
      perPath = byPath.rows.map((r) => ({ path: String(r.path), views: Number(r.views) }));
    } else {
      // Local SQLite: small enough to count here.
      const { docs } = await payload.find({
        collection: "page-views",
        limit: 20000,
        depth: 0,
        where: { createdAt: { greater_than_equal: since.toISOString() } },
      });
      const paths = new Map<string, number>();
      for (const v of docs as { path: string; createdAt: string }[]) {
        const key = v.createdAt.slice(0, 10);
        if (perDay.has(key)) perDay.set(key, (perDay.get(key) ?? 0) + 1);
        paths.set(v.path, (paths.get(v.path) ?? 0) + 1);
      }
      perPath = [...paths.entries()]
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
    }

    const days = [...perDay.entries()].map(([date, views]) => ({
      date,
      label: new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      views,
    }));
    return { days, topPages: perPath, views: days.reduce((sum, d) => sum + d.views, 0) };
  };

  // Everything at once: each query waits on the database, not on the others.
  const [
    newEnquiries,
    newQuotes,
    confirmedBookings,
    openEnquiries,
    openQuotes,
    dueEnquiries,
    dueQuotes,
    won,
    stats,
    features,
    enquiriesThisMonth,
    quotesThisMonth,
  ] = await Promise.all([
    countOf("submissions", { status: { equals: "new" } }),
    countOf("quotes", { status: { equals: "new" } }),
    countOf("bookings", { status: { equals: "confirmed" } }),
    countOf("submissions", openLead("submissions")),
    countOf("quotes", openLead("quotes")),
    countOf("submissions", dueLead("submissions")),
    countOf("quotes", dueLead("quotes")),
    wonThisMonth(),
    // Page views are for admins only; a failed query just leaves the charts out.
    isAdmin ? pageViewStats().catch(() => null) : Promise.resolve(null),
    payload.findGlobal({ slug: "features", depth: 0 }) as Promise<{ maintenanceMode?: boolean }>,
    countOf("submissions", { createdAt: { greater_than_equal: monthStart.toISOString() } }),
    countOf("quotes", { createdAt: { greater_than_equal: monthStart.toISOString() } }),
  ]);
  const openLeads = openEnquiries + openQuotes;
  const leadsThisMonth = enquiriesThisMonth + quotesThisMonth;
  // The admin list reads `in` filters as an indexed array in the address.
  const openStageQuery = (collection: keyof typeof OPEN_STAGES) =>
    OPEN_STAGES[collection].map((stage, i) => `where[status][in][${i}]=${stage}`).join("&");
  const followUpsDue = dueEnquiries + dueQuotes;
  const dueFilter = `where[followUp][less_than_equal]=${encodeURIComponent(endOfToday.toISOString())}`;

  // No session id is stored on a visitor's device any more, so this counts
  // page views rather than unique people.
  const days = stats?.days ?? [];
  const topPages = stats?.topPages ?? [];

  const maintenanceOn = features.maintenanceMode === true;
  const displayName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  /** Everything waiting on someone, most time-sensitive first. Empty means all caught up. */
  const todo = [
    followUpsDue > 0 && {
      key: "followup",
      tone: "urgent",
      count: followUpsDue,
      title: plural(followUpsDue, "follow-up due", "follow-ups due"),
      detail: "Leads you planned to get back to by today",
      href:
        dueEnquiries > 0
          ? `/admin/collections/submissions?${dueFilter}&${openStageQuery("submissions")}&sort=followUp`
          : `/admin/collections/quotes?${dueFilter}&${openStageQuery("quotes")}&sort=followUp`,
    },
    newEnquiries > 0 && {
      key: "enquiries",
      tone: "new",
      count: newEnquiries,
      title: plural(newEnquiries, "new enquiry", "new enquiries"),
      detail: "Messages and free audit requests waiting for a reply",
      href: "/admin/collections/submissions?where[status][equals]=new",
    },
    newQuotes > 0 && {
      key: "quotes",
      tone: "new",
      count: newQuotes,
      title: plural(newQuotes, "new quote request", "new quote requests"),
      detail: "People waiting for a price",
      href: "/admin/collections/quotes?where[status][equals]=new",
    },
    confirmedBookings > 0 && {
      key: "calls",
      tone: "calm",
      count: confirmedBookings,
      title: plural(confirmedBookings, "upcoming call", "upcoming calls"),
      detail: "Booked through the website",
      href: "/admin/collections/bookings?where[status][equals]=confirmed",
    },
  ].filter(Boolean) as { key: string; tone: string; count: number; title: string; detail: string; href: string }[];

  const shortcuts = SHORTCUTS.filter((s) => !s.adminOnly || isAdmin);

  return (
    <div className="zk-dash">
      {/* Impossible to miss while the public site is closed. */}
      {maintenanceOn && (
        <div className="zk-maintenance" role="status">
          <div>
            <strong>Maintenance mode is on.</strong> Visitors see the maintenance notice, not the
            website.
          </div>
          <div className="zk-maintenance__actions">
            <a className="zk-maintenance__btn" href="/maintenance/bypass" target="_blank" rel="noopener">
              Preview the site
            </a>
            {user?.role === "superadmin" && (
              <Link className="zk-maintenance__btn zk-maintenance__btn--quiet" href="/admin/globals/features">
                Turn it off
              </Link>
            )}
          </div>
        </div>
      )}

      <header className="zk-dash__head">
        <h1 className="zk-dash__title">
          <Greeting name={displayName} />
        </h1>
        <p className="zk-dash__sub">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          {role && <span className="zk-dash__role">{role}</span>}
        </p>
      </header>

      <section className="zk-panel" aria-labelledby="zk-todo-title">
        <h2 id="zk-todo-title" className="zk-section-title">
          Needs your attention
        </h2>
        {todo.length > 0 ? (
          <ul className="zk-todo">
            {todo.map((t) => (
              <li key={t.key}>
                <Link className={`zk-todo__item zk-todo__item--${t.tone}`} href={t.href}>
                  <span className="zk-todo__count">{t.count}</span>
                  <span className="zk-todo__text">
                    <strong>{t.title}</strong>
                    <span>{t.detail}</span>
                  </span>
                  <span className="zk-todo__go" aria-hidden="true">
                    Open →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="zk-clear">
            <span aria-hidden="true">✓</span> You&rsquo;re all caught up. New enquiries, quote requests and
            booked calls will appear here.
          </p>
        )}
      </section>

      <section aria-labelledby="zk-glance-title">
        <h2 id="zk-glance-title" className="zk-section-title">
          At a glance
        </h2>
        <div className="zk-tiles">
          <Link
            className="zk-tile"
            href={`/admin/collections/submissions?where[createdAt][greater_than_equal]=${encodeURIComponent(monthStart.toISOString())}`}
          >
            <span className="zk-tile__label">Leads this month</span>
            <span className="zk-tile__num">{leadsThisMonth}</span>
            <span className="zk-tile__hint">
              {plural(enquiriesThisMonth, "enquiry", "enquiries")} · {plural(quotesThisMonth, "quote", "quotes")}
            </span>
          </Link>
          <Link className="zk-tile" href={`/admin/collections/submissions?${openStageQuery("submissions")}`}>
            <span className="zk-tile__label">Open leads</span>
            <span className="zk-tile__num">{openLeads}</span>
            <span className="zk-tile__hint">
              {plural(openEnquiries, "enquiry", "enquiries")} · {plural(openQuotes, "quote", "quotes")}
            </span>
          </Link>
          <Link className="zk-tile" href="/admin/collections/bookings">
            <span className="zk-tile__label">Upcoming calls</span>
            <span className="zk-tile__num">{confirmedBookings}</span>
            <span className="zk-tile__hint">Booked on the website</span>
          </Link>
          <div className="zk-tile zk-tile--static">
            <span className="zk-tile__label">Won this month</span>
            <span className="zk-tile__num">{won.count}</span>
            <span className="zk-tile__hint">
              {won.value > 0 ? `$${won.value.toLocaleString("en-US")} in deals` : "Mark a lead Won to count it"}
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="zk-shortcuts-title">
        <h2 id="zk-shortcuts-title" className="zk-section-title">
          Shortcuts
        </h2>
        <ul className="zk-shortcuts">
          {shortcuts.map((a) => {
            const content = (
              <>
                <span className="zk-shortcut__icon" aria-hidden="true">
                  {a.icon}
                </span>
                {a.label}
              </>
            );
            // The website and the spreadsheet download are full page loads, not admin screens.
            return (
              <li key={a.href}>
                {a.external || a.href.startsWith("/api/") ? (
                  <a className="zk-shortcut" href={a.href} {...(a.external ? { target: "_blank", rel: "noopener" } : {})}>
                    {content}
                  </a>
                ) : (
                  <Link className="zk-shortcut" href={a.href}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {isAdmin && days.length > 0 && (
        <section aria-labelledby="zk-traffic-title">
          <h2 id="zk-traffic-title" className="zk-section-title">
            Website visits
          </h2>
          <div className="zk-charts">
            <TrafficChart days={days} />
            <TopPages rows={topPages} />
          </div>
        </section>
      )}

      {/*
       * Payload's own grid of every collection is hidden in custom.css: with the
       * list above and the menu, it was another copy of the same links.
       */}
    </div>
  );
}

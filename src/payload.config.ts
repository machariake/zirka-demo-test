import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { db } from "./payload/db";
import { storage } from "./payload/storage";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { Users } from "./payload/collections/Users";
import { Media } from "./payload/collections/Media";
import { Services } from "./payload/collections/Services";
import { SolutionCategories } from "./payload/collections/SolutionCategories";
import { CaseStudies } from "./payload/collections/CaseStudies";
import { Projects } from "./payload/collections/Projects";
import { Posts } from "./payload/collections/Posts";
import { TeamMembers } from "./payload/collections/TeamMembers";
import { Testimonials } from "./payload/collections/Testimonials";
import { Engagements } from "./payload/collections/Engagements";
import { ProjectPricing } from "./payload/collections/ProjectPricing";
import { Faqs } from "./payload/collections/Faqs";
import { Submissions } from "./payload/collections/Submissions";
import { PageViews } from "./payload/collections/PageViews";
import { ProcessSteps } from "./payload/collections/ProcessSteps";
import { Values } from "./payload/collections/Values";
import { SiteSettings } from "./payload/globals/SiteSettings";
import { Features } from "./payload/globals/Features";
import { BookingSettings } from "./payload/globals/BookingSettings";
import { Bookings } from "./payload/collections/Bookings";
import { Quotes } from "./payload/collections/Quotes";
import { emailAdapter } from "./payload/email";
import { dailyCron } from "./payload/cron";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    // Initials rather than Gravatar: no outside image request, and no broken
    // picture for anyone without a Gravatar account.
    avatar: "default",
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      graphics: {
        Logo: "/payload/components/Logo",
        Icon: "/payload/components/Icon",
      },
      actions: ["/payload/components/AdminHeaderActions"],
      beforeDashboard: ["/payload/components/BeforeDashboard"],
      // Show/hide button on every password box, including the login page.
      providers: ["/payload/components/PasswordReveal"],
    },
    meta: {
      titleSuffix: " — Zirka Admin",
      description: "Content and enquiries for Zirka Digital Solutions.",
    },
  },
  // Menu: four groups, in the order they are used. Leads (every day), Website
  // (content), Pricing, then Setup (settings, users and rarely-touched parts).
  // Groups appear in the order of their first section here.
  collections: [
    Submissions,
    Quotes,
    Bookings,
    Projects,
    Posts,
    Services,
    CaseStudies,
    Testimonials,
    TeamMembers,
    Faqs,
    SolutionCategories,
    Media,
    Engagements,
    ProjectPricing,
    ProcessSteps,
    Values,
    Users,
    PageViews,
  ],
  globals: [SiteSettings, Features, BookingSettings],
  // Vercel Cron calls this every morning (vercel.json).
  endpoints: [dailyCron],
  email: emailAdapter,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db,
  sharp,
  plugins: storage,
});

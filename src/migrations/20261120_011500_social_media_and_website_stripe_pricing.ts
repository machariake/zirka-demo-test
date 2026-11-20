import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Add checkout_url columns to engagements and project_pricing (and their version tables)
  await db.execute(sql`
    ALTER TABLE "engagements" ADD COLUMN IF NOT EXISTS "checkout_url" varchar;
    ALTER TABLE "_engagements_v" ADD COLUMN IF NOT EXISTS "version_checkout_url" varchar;
    ALTER TABLE "project_pricing" ADD COLUMN IF NOT EXISTS "checkout_url" varchar;
    ALTER TABLE "_project_pricing_v" ADD COLUMN IF NOT EXISTS "version_checkout_url" varchar;
  `)

  // 2. Replace Monthly Plans with Social Media Management plans ($299, $599, $900) + Stripe links
  await db.execute(sql`
    UPDATE "engagements"
    SET
      "name" = 'Starter Visibility',
      "price" = '$299',
      "cadence" = 'per month',
      "checkout_url" = 'https://buy.stripe.com/aFacN79gD9rSbLBejz1gs02',
      "summary" = 'Best for a small business that needs a steady, professional social media presence and consistent visibility.',
      "order" = 0,
      "updated_at" = now()
    WHERE "name" IN ('Zirka Starter', 'Starter Visibility');

    UPDATE "engagements"
    SET
      "name" = 'Business Growth',
      "price" = '$599',
      "cadence" = 'per month',
      "checkout_url" = 'https://buy.stripe.com/dRm00lgJ57jK3f50sJ1gs01',
      "summary" = 'Best for a growing business ready to scale content, community engagement, and inbound leads.',
      "featured" = true,
      "order" = 1,
      "updated_at" = now()
    WHERE "name" IN ('Zirka Growth', 'Business Growth');

    UPDATE "engagements"
    SET
      "name" = 'Premium Digital Growth',
      "price" = '$900',
      "cadence" = 'per month',
      "checkout_url" = 'https://buy.stripe.com/8x200lakH7jKbLB4IZ1gs00',
      "summary" = 'Best for an established business growing on several channels at once with full-funnel marketing.',
      "order" = 2,
      "updated_at" = now()
    WHERE "name" IN ('Zirka Scale', 'Premium Digital Growth');

    UPDATE "_engagements_v"
    SET
      "version_name" = 'Starter Visibility',
      "version_price" = '$299',
      "version_cadence" = 'per month',
      "version_checkout_url" = 'https://buy.stripe.com/aFacN79gD9rSbLBejz1gs02',
      "version_summary" = 'Best for a small business that needs a steady, professional social media presence and consistent visibility.',
      "version_order" = 0,
      "version_updated_at" = now()
    WHERE "version_name" IN ('Zirka Starter', 'Starter Visibility');

    UPDATE "_engagements_v"
    SET
      "version_name" = 'Business Growth',
      "version_price" = '$599',
      "version_cadence" = 'per month',
      "version_checkout_url" = 'https://buy.stripe.com/dRm00lgJ57jK3f50sJ1gs01',
      "version_summary" = 'Best for a growing business ready to scale content, community engagement, and inbound leads.',
      "version_featured" = true,
      "version_order" = 1,
      "version_updated_at" = now()
    WHERE "version_name" IN ('Zirka Growth', 'Business Growth');

    UPDATE "_engagements_v"
    SET
      "version_name" = 'Premium Digital Growth',
      "version_price" = '$900',
      "version_cadence" = 'per month',
      "version_checkout_url" = 'https://buy.stripe.com/8x200lakH7jKbLB4IZ1gs00',
      "version_summary" = 'Best for an established business growing on several channels at once with full-funnel marketing.',
      "version_order" = 2,
      "version_updated_at" = now()
    WHERE "version_name" IN ('Zirka Scale', 'Premium Digital Growth');
  `)

  // 3. Update Website packages & Stripe links in project_pricing
  await db.execute(sql`
    UPDATE "project_pricing"
    SET
      "name" = 'Landing Page',
      "price" = '$997',
      "checkout_url" = 'https://buy.stripe.com/4gM7sN3WjeMc7vl2AR1gs06',
      "order" = 0,
      "updated_at" = now()
    WHERE "name" IN ('Landing Pages', 'Landing Page');

    UPDATE "project_pricing"
    SET
      "name" = 'Business Website (3–5 pages)',
      "price" = '$2,000',
      "checkout_url" = 'https://buy.stripe.com/3cI9AV64r47y6rh2AR1gs05',
      "order" = 1,
      "updated_at" = now()
    WHERE "name" IN (
      'Business Websites',
      'Business Websites (3-5 pages)',
      'Business Website (3-5 pages)',
      'Business Website (3–5 pages)'
    );

    UPDATE "project_pricing"
    SET
      "name" = 'Large Business Website (6–10 pages)',
      "price" = '$4,000',
      "checkout_url" = 'https://buy.stripe.com/fZudRb1Ob8nO9Dtdfv1gs04',
      "order" = 2,
      "updated_at" = now()
    WHERE "name" IN (
      'Large Business Website (6-10 pages)',
      'Large Business Website (6–10 pages)'
    );

    UPDATE "project_pricing"
    SET
      "name" = 'Website Care',
      "price" = '$129/mo',
      "checkout_url" = 'https://buy.stripe.com/cNi3cx3WjfQgg1R5N31gs03',
      "order" = 3,
      "updated_at" = now()
    WHERE "name" IN ('Website Care & Maintenance', 'Website Care');

    UPDATE "_project_pricing_v"
    SET
      "version_name" = 'Landing Page',
      "version_price" = '$997',
      "version_checkout_url" = 'https://buy.stripe.com/4gM7sN3WjeMc7vl2AR1gs06',
      "version_order" = 0,
      "version_updated_at" = now()
    WHERE "version_name" IN ('Landing Pages', 'Landing Page');

    UPDATE "_project_pricing_v"
    SET
      "version_name" = 'Business Website (3–5 pages)',
      "version_price" = '$2,000',
      "version_checkout_url" = 'https://buy.stripe.com/3cI9AV64r47y6rh2AR1gs05',
      "version_order" = 1,
      "version_updated_at" = now()
    WHERE "version_name" IN (
      'Business Websites',
      'Business Websites (3-5 pages)',
      'Business Website (3-5 pages)',
      'Business Website (3–5 pages)'
    );

    UPDATE "_project_pricing_v"
    SET
      "version_name" = 'Large Business Website (6–10 pages)',
      "version_price" = '$4,000',
      "version_checkout_url" = 'https://buy.stripe.com/fZudRb1Ob8nO9Dtdfv1gs04',
      "version_order" = 2,
      "version_updated_at" = now()
    WHERE "version_name" IN (
      'Large Business Website (6-10 pages)',
      'Large Business Website (6–10 pages)'
    );

    UPDATE "_project_pricing_v"
    SET
      "version_name" = 'Website Care',
      "version_price" = '$129/mo',
      "version_checkout_url" = 'https://buy.stripe.com/cNi3cx3WjfQgg1R5N31gs03',
      "version_order" = 3,
      "version_updated_at" = now()
    WHERE "version_name" IN ('Website Care & Maintenance', 'Website Care');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "engagements" DROP COLUMN IF EXISTS "checkout_url";
    ALTER TABLE "_engagements_v" DROP COLUMN IF EXISTS "version_checkout_url";
    ALTER TABLE "project_pricing" DROP COLUMN IF EXISTS "checkout_url";
    ALTER TABLE "_project_pricing_v" DROP COLUMN IF EXISTS "version_checkout_url";
  `)
}

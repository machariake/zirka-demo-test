import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. Landing Pages: from $750 to $997
  await db.execute(sql`
    UPDATE "project_pricing"
    SET "price" = '$997', "order" = 0, "updated_at" = now()
    WHERE "name" = 'Landing Pages';
  `)

  // 2. Business Websites: from $1,500 to $2,000, and rename to (3-5 pages)
  await db.execute(sql`
    UPDATE "project_pricing"
    SET "name" = 'Business Websites (3-5 pages)', "price" = '$2,000', "order" = 1, "updated_at" = now()
    WHERE "name" = 'Business Websites' OR "name" = 'Business Websites (3-5 pages)';
  `)

  // 3. Add Large Business Website (6-10 pages): $4,000
  await db.execute(sql`
    INSERT INTO "project_pricing" ("name", "price", "order", "_status", "created_at", "updated_at")
    SELECT 'Large Business Website (6-10 pages)', '$4,000', 2, 'published', now(), now()
    WHERE NOT EXISTS (
      SELECT 1 FROM "project_pricing" WHERE "name" = 'Large Business Website (6-10 pages)'
    );
  `)

  // 4. Add Website Care & Maintenance: $129/month
  await db.execute(sql`
    INSERT INTO "project_pricing" ("name", "price", "order", "_status", "created_at", "updated_at")
    SELECT 'Website Care & Maintenance', '$129/month', 3, 'published', now(), now()
    WHERE NOT EXISTS (
      SELECT 1 FROM "project_pricing" WHERE "name" = 'Website Care & Maintenance'
    );
  `)

  // 5. Update ordering for existing items so the list is clean and grouped
  await db.execute(sql`
    UPDATE "project_pricing" SET "order" = 4, "updated_at" = now() WHERE "name" = 'E-commerce Websites';
    UPDATE "project_pricing" SET "order" = 5, "updated_at" = now() WHERE "name" = 'Logo/Mini Brand Identity';
    UPDATE "project_pricing" SET "order" = 6, "updated_at" = now() WHERE "name" = 'Full Brand Identity';
    UPDATE "project_pricing" SET "order" = 7, "updated_at" = now() WHERE "name" = 'SEO Audit';
    UPDATE "project_pricing" SET "order" = 8, "updated_at" = now() WHERE "name" = 'Ad Campaign Setup';
    UPDATE "project_pricing" SET "order" = 9, "updated_at" = now() WHERE "name" = 'AI/WhatsApp Automation';
  `)

  // Sync draft/version history table if present
  await db.execute(sql`
    UPDATE "_project_pricing_v"
    SET "version_price" = '$997', "version_order" = 0, "version_updated_at" = now()
    WHERE "version_name" = 'Landing Pages';

    UPDATE "_project_pricing_v"
    SET "version_name" = 'Business Websites (3-5 pages)', "version_price" = '$2,000', "version_order" = 1, "version_updated_at" = now()
    WHERE "version_name" = 'Business Websites' OR "version_name" = 'Business Websites (3-5 pages)';

    INSERT INTO "_project_pricing_v" ("parent_id", "version_name", "version_price", "version_order", "version__status", "version_created_at", "version_updated_at", "created_at", "updated_at", "latest")
    SELECT p.id, p.name, p.price, p.order, 'published', now(), now(), now(), now(), true
    FROM "project_pricing" p
    WHERE p.name IN ('Large Business Website (6-10 pages)', 'Website Care & Maintenance')
      AND NOT EXISTS (
        SELECT 1 FROM "_project_pricing_v" v WHERE v.parent_id = p.id
      );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "project_pricing" SET "price" = 'from $750', "order" = 0 WHERE "name" = 'Landing Pages';
    UPDATE "project_pricing" SET "name" = 'Business Websites', "price" = 'from $1,500', "order" = 1 WHERE "name" = 'Business Websites (3-5 pages)';
    DELETE FROM "project_pricing" WHERE "name" IN ('Large Business Website (6-10 pages)', 'Website Care & Maintenance');
  `)
}

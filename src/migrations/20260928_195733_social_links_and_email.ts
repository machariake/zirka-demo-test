import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "email" SET DEFAULT 'info@zirkadigitalsolutions.com';
  ALTER TABLE "site_settings" ADD COLUMN "facebook_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "instagram_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "linkedin_url" varchar;`)
  // Fill in the business inbox where none was ever saved; a set email is left alone.
  await db.execute(sql`
   UPDATE "site_settings" SET "email" = 'info@zirkadigitalsolutions.com' WHERE "email" IS NULL OR "email" = '';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "email" DROP DEFAULT;
  ALTER TABLE "site_settings" DROP COLUMN "facebook_url";
  ALTER TABLE "site_settings" DROP COLUMN "instagram_url";
  ALTER TABLE "site_settings" DROP COLUMN "linkedin_url";`)
}

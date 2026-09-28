import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "facebook_url" SET DEFAULT 'https://www.facebook.com/share/19MhNyMNVX/';
  ALTER TABLE "site_settings" ALTER COLUMN "instagram_url" SET DEFAULT 'https://www.instagram.com/iamessy_blessed';`)
  // Fill in the business's profiles where none were saved; links set in the admin are left alone.
  await db.execute(sql`
   UPDATE "site_settings" SET "facebook_url" = 'https://www.facebook.com/share/19MhNyMNVX/' WHERE "facebook_url" IS NULL OR "facebook_url" = '';
  UPDATE "site_settings" SET "instagram_url" = 'https://www.instagram.com/iamessy_blessed' WHERE "instagram_url" IS NULL OR "instagram_url" = '';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "facebook_url" DROP DEFAULT;
  ALTER TABLE "site_settings" ALTER COLUMN "instagram_url" DROP DEFAULT;`)
}

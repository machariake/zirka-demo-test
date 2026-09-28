import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "features" ADD COLUMN "whatsapp_float" boolean DEFAULT true;
  ALTER TABLE "features" ADD COLUMN "translate_enabled" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "features" DROP COLUMN "whatsapp_float";
  ALTER TABLE "features" DROP COLUMN "translate_enabled";`)
}

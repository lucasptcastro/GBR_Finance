ALTER TABLE "egg_production" DROP CONSTRAINT "egg_production_date_unique";--> statement-breakpoint
ALTER TABLE "egg_production" ADD COLUMN "warehouse_id" uuid;--> statement-breakpoint
ALTER TABLE "egg_production" ADD CONSTRAINT "egg_production_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "egg_production_date_warehouse_unique" ON "egg_production" USING btree ("date","warehouse_id");
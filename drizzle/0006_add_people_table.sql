CREATE TYPE "public"."enrollment_status" AS ENUM('enrolled', 'late', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."person_category" AS ENUM('customer', 'supplier');--> statement-breakpoint
CREATE TYPE "public"."person_sex" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."person_type" AS ENUM('individual', 'company');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"nickname" text,
	"category" "person_category" NOT NULL,
	"type" "person_type" NOT NULL,
	"sex" "person_sex" DEFAULT 'male',
	"is_pcd" boolean DEFAULT false,
	"birth_date" timestamp,
	"rg" text,
	"state_registration" text,
	"email" text,
	"phone" text,
	"mobile" text,
	"cpf" text,
	"cnpj" text,
	"status" "status" DEFAULT 'active' NOT NULL,
	"enrollment_status" "enrollment_status" DEFAULT 'enrolled' NOT NULL,
	"observation" text,
	"needs_guardian" boolean DEFAULT false NOT NULL,
	"guardian_person_id" uuid,
	"zip_code" text,
	"state" text,
	"city" text,
	"street" text,
	"number" text,
	"complement" text,
	"neighborhood" text,
	"reference" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);

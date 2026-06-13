import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "deposit", // depósito
  "expense", // despesa
  "investment", // investimento
]);

export const transactionCategoryEnum = pgEnum("transaction_category", [
  "tax", // imposto
  "project", // projeto
  "housing", // habitação
  "transportation", // transporte
  "food", // alimentação
  "entertainment", // entretenimento
  "health", // saúde
  "utility", // utilidade
  "salary", // salário
  "education", // educação
  "travel", // viagem
  "insurance", // seguro
  "subscription", // assinatura
  "pets", // pets
  "car", // carro
  "clothing", // roupas
  "other", // outros
  "investment", // investimento
]);

export const transactionPaymentMethodEnum = pgEnum(
  "transaction_payment_method",
  [
    "credit_card", // cartão de crédito
    "debit_card", // cartão de débito
    "bank_transfer", // transferência bancária
    "bank_slip", // boleto bancário
    "cash", // dinheiro
    "pix", // pix
    "other", // outros
  ],
);

export const installmentTypeEnum = pgEnum("installment_type", [
  "single", // única
  "installment", // parcelada
]);

export const recurringAccountTypeEnum = pgEnum("recurring_account_type", [
  "payable", // conta a pagar
  "receivable", // conta a receber
  "investment", // investimento
]);

/* -------------------------------------------------------------------------- */
/*                                Transactions                                */
/* -------------------------------------------------------------------------- */

export const transactionsTable = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amountInCents: integer("amount_in_cents").notNull(),
  category: transactionCategoryEnum("category").notNull(),
  paymentMethod: transactionPaymentMethodEnum("payment_method").notNull(),
  issueDate: timestamp("date").notNull(), // data de emissão
  dueDate: timestamp("due_date").notNull(), // data do vencimento

  installmentType: installmentTypeEnum("installment_type")
    .default("single")
    .notNull(), // tipo de parcelamento
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),

  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),

  bankAccountId: uuid("bank_account_id").references(
    () => bankAccountsTable.id,
    {
      onDelete: "set null",
    },
  ),
});

export const transactionRelations = relations(
  transactionsTable,
  ({ one, many }) => ({
    // uma transação pertence a um usuário
    user: one(userTable, {
      fields: [transactionsTable.userId],
      references: [userTable.id],
    }),

    // uma transação pode ter uma conta bancária
    bankAccount: one(bankAccountsTable, {
      fields: [transactionsTable.bankAccountId],
      references: [bankAccountsTable.id],
    }),

    // uma transação pode ter várias parcelas
    installments: many(transactionInstallmentsTable),
  }),
);

/* -------------------------------------------------------------------------- */
/*                        Transactions Installments                           */
/* -------------------------------------------------------------------------- */

export const transactionInstallmentsTable = pgTable(
  "transaction_installments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    installmentNumber: integer("installment_number").notNull(), // número da parcela
    dueDate: timestamp("due_date").notNull(), // data de vencimento
    amountInCents: integer("amount_in_cents").notNull(), // valor da parcela
    isPaid: boolean("is_paid").default(false).notNull(), // se a parcela foi lançada
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),

    // Chave estrangeira para a transação
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactionsTable.id, { onDelete: "cascade" }),
  },
);

export const transactionInstallmentsRelations = relations(
  transactionInstallmentsTable,
  ({ one }) => ({
    // uma parcela pertence a uma transação
    transaction: one(transactionsTable, {
      fields: [transactionInstallmentsTable.transactionId],
      references: [transactionsTable.id],
    }),
  }),
);

/* -------------------------------------------------------------------------- */
/*                            Recurring Accounts                              */
/* -------------------------------------------------------------------------- */

export const recurringAccountsTable = pgTable(
  "recurring_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    amountInCents: integer("amount_in_cents").notNull(),
    type: recurringAccountTypeEnum("type").default("payable").notNull(),
    category: transactionCategoryEnum("category").default("other").notNull(),
    paymentMethod: transactionPaymentMethodEnum("payment_method")
      .default("other")
      .notNull(),
    dueDate: timestamp("due_date").notNull(), // data do vencimento
    isPaid: boolean("is_paid").default(false).notNull(), // se a conta foi paga
    paymentDate: timestamp("payment_date"), // data do pagamento
    // Recorrência: a conta "mestre" tem isRecurring=true e recurrenceMasterId=null.
    // As ocorrências mensais geradas têm isRecurring=false e recurrenceMasterId=<id da mestre>.
    isRecurring: boolean("is_recurring").default(false).notNull(),
    recurrenceMasterId: uuid("recurrence_master_id"),
    // Primeiro dia do mês da competência (derivado do dueDate). Usado para evitar duplicações.
    referenceMonth: date("reference_month", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),

    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),

    bankAccountId: uuid("bank_account_id").references(
      () => bankAccountsTable.id,
      {
        onDelete: "set null",
      },
    ),
  },
  (table) => ({
    recurrenceMonthUnique: uniqueIndex(
      "recurring_accounts_recurrence_master_month_unique",
    ).on(table.recurrenceMasterId, table.referenceMonth),
  }),
);

export const recurringAccountsRelations = relations(
  recurringAccountsTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [recurringAccountsTable.userId],
      references: [userTable.id],
    }),

    bankAccount: one(bankAccountsTable, {
      fields: [recurringAccountsTable.bankAccountId],
      references: [bankAccountsTable.id],
    }),
  }),
);

/* -------------------------------------------------------------------------- */
/*                                    Roles                                   */
/* -------------------------------------------------------------------------- */

export const rolesTable = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/* -------------------------------------------------------------------------- */
/*                               Bank Accounts                                */
/* -------------------------------------------------------------------------- */

export const bankAccountsTable = pgTable("bank_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#3b82f6"),
  dueDay: integer("due_day"), // dia do mês de vencimento (1-28)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),

  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const bankAccountsRelations = relations(
  bankAccountsTable,
  ({ one }) => ({
    // uma conta bancária pertence a um usuário
    user: one(userTable, {
      fields: [bankAccountsTable.userId],
      references: [userTable.id],
    }),
  }),
);

/* -------------------------------------------------------------------------- */
/*                               System Updates                               */
/* -------------------------------------------------------------------------- */

export const systemUpdatesTable = pgTable("system_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  version: text("version").notNull(),
  description: json("description").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/* -------------------------------------------------------------------------- */
/*                             Better Auth                                    */
/* -------------------------------------------------------------------------- */

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  roleId: uuid("role_id").references(() => rolesTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const accountTable = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationTable = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

/* -------------------------------------------------------------------------- */
/*                             Egg Production                                 */
/* -------------------------------------------------------------------------- */

export const eggProductionTable = pgTable("egg_production", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date", { mode: "date" }).notNull().unique(),
  traysProduced: integer("trays_produced").notNull().default(0),
  eggsLeftover: integer("eggs_leftover").notNull().default(0),
  crackedEggs: integer("cracked_eggs").notNull().default(0),
  feedUsed: integer("feed_used").notNull().default(0),
  deadBirds: integer("dead_birds").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/* -------------------------------------------------------------------------- */
/*                                 Relations                                  */
/* -------------------------------------------------------------------------- */

export const userRelations = relations(userTable, ({ one, many }) => ({
  transactions: many(transactionsTable),
  recurringAccounts: many(recurringAccountsTable),
  bankAccounts: many(bankAccountsTable),
  role: one(rolesTable, {
    fields: [userTable.roleId],
    references: [rolesTable.id],
  }),
}));

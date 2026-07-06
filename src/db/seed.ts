import "dotenv/config";

import { desc, eq, sql } from "drizzle-orm";

import { db } from "./index";
import {
  peopleTable,
  salesTable,
  salePaymentsTable,
  warehousesTable,
  userTable,
} from "./schema";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dateAt(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

const PAYMENT_METHODS = [
  "pix",
  "pix",
  "pix",
  "pix",
  "credit_card",
  "credit_card",
  "debit_card",
  "bank_slip",
  "crediary",
  "crediary",
  "crediary",
] as const;

const CUSTOMER_NAMES = [
  { name: "João Carlos Silva", type: "individual" as const },
  { name: "Maria Aparecida Oliveira", type: "individual" as const },
  { name: "Pedro Henrique Santos", type: "individual" as const },
  { name: "Ana Paula Costa", type: "individual" as const },
  { name: "Carlos Eduardo Mendes", type: "individual" as const },
  { name: "Fernanda Lima", type: "individual" as const },
  { name: "Ricardo Alves", type: "individual" as const },
  { name: "Juliana Ferreira", type: "individual" as const },
  { name: "Marcos Rocha", type: "individual" as const },
  { name: "Beatriz Souza", type: "individual" as const },
  { name: "Distribuidora ABC Ltda", type: "company" as const },
  { name: "Supermercado Central", type: "company" as const },
  { name: "Padaria São José", type: "company" as const },
  { name: "Restaurante Bom Sabor", type: "company" as const },
  { name: "Mercearia do Zé", type: "company" as const },
  { name: "Conveniência Norte", type: "company" as const },
  { name: "Lanchonete da Praça", type: "individual" as const },
  { name: "Tiago Nascimento", type: "individual" as const },
  { name: "Cláudia Ribeiro", type: "individual" as const },
  { name: "Henrique Moraes", type: "individual" as const },
];

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

async function seed() {
  console.log("🌱 Iniciando seed de dados fictícios...\n");

  /* ---- 1. Buscar usuário -------------------------------------------------- */
  const users = await db.select({ id: userTable.id }).from(userTable).limit(1);
  if (users.length === 0) {
    console.error("❌ Nenhum usuário encontrado. Faça login primeiro.");
    process.exit(1);
  }
  const userId = users[0].id;
  console.log(`✅ Usuário encontrado: ${userId}`);

  /* ---- 2. Garantir galpões ------------------------------------------------ */
  let warehouses = await db
    .select({ id: warehousesTable.id })
    .from(warehousesTable)
    .limit(3);

  if (warehouses.length === 0) {
    console.log("📦 Criando galpões...");
    await db.insert(warehousesTable).values([
      { name: "Galpão A", createdBy: userId },
      { name: "Galpão B", createdBy: userId },
      { name: "Galpão C", createdBy: userId },
    ]);
    warehouses = await db
      .select({ id: warehousesTable.id })
      .from(warehousesTable)
      .limit(3);
  }
  console.log(`✅ ${warehouses.length} galpão(ões) disponível(is)`);

  /* ---- 3. Criar clientes -------------------------------------------------- */
  const existingCustomers = await db
    .select({ id: peopleTable.id })
    .from(peopleTable)
    .where(eq(peopleTable.category, "customer"));

  let customerIds: string[];

  if (existingCustomers.length >= 5) {
    customerIds = existingCustomers.map((c) => c.id);
    console.log(`✅ Usando ${customerIds.length} clientes existentes`);
  } else {
    console.log("👥 Criando clientes...");
    const inserted = await db
      .insert(peopleTable)
      .values(
        CUSTOMER_NAMES.map((c) => ({
          name: c.name,
          category: "customer" as const,
          type: c.type,
          status: "active" as const,
          enrollmentStatus: "enrolled" as const,
        })),
      )
      .returning({ id: peopleTable.id });
    customerIds = inserted.map((c) => c.id);
    console.log(`✅ ${customerIds.length} clientes criados`);
  }

  /* ---- 4. Calcular próximo invoiceNumber ---------------------------------- */
  const lastSale = await db.query.salesTable.findFirst({
    orderBy: [desc(salesTable.invoiceNumber)],
  });
  let nextInvoice = (lastSale?.invoiceNumber ?? 0) + 1;

  /* ---- 5. Gerar vendas ---------------------------------------------------- */
  console.log("\n🛒 Gerando vendas...");

  type SaleInsert = {
    invoiceNumber: number;
    date: Date;
    traysSold: number;
    pricePerTrayInCents: number;
    totalAmountInCents: number;
    paymentMethod: (typeof PAYMENT_METHODS)[number];
    status: "paid" | "partially_paid" | "pending";
    customerId: string;
    warehouseId: string;
    createdBy: string;
    notes: string | null;
  };

  const salesToInsert: SaleInsert[] = [];

  // Gerar ~10 vendas por mês de Jan/2025 até Jul/2026 (19 meses)
  const months: { year: number; month: number; count: number }[] = [
    // 2025
    { year: 2025, month: 1, count: 8 },
    { year: 2025, month: 2, count: 7 },
    { year: 2025, month: 3, count: 10 },
    { year: 2025, month: 4, count: 9 },
    { year: 2025, month: 5, count: 11 },
    { year: 2025, month: 6, count: 8 },
    { year: 2025, month: 7, count: 12 },
    { year: 2025, month: 8, count: 9 },
    { year: 2025, month: 9, count: 10 },
    { year: 2025, month: 10, count: 13 },
    { year: 2025, month: 11, count: 11 },
    { year: 2025, month: 12, count: 14 },
    // 2026
    { year: 2026, month: 1, count: 10 },
    { year: 2026, month: 2, count: 9 },
    { year: 2026, month: 3, count: 12 },
    { year: 2026, month: 4, count: 11 },
    { year: 2026, month: 5, count: 13 },
    { year: 2026, month: 6, count: 10 },
    { year: 2026, month: 7, count: 8 },
  ];

  for (const { year, month, count } of months) {
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let i = 0; i < count; i++) {
      const day = randomBetween(1, daysInMonth);
      const traysSold = randomBetween(5, 150);
      const pricePerTrayInCents = randomBetween(1800, 3800);
      const totalAmountInCents = traysSold * pricePerTrayInCents;
      const paymentMethod = pickRandom(PAYMENT_METHODS);
      const isCrediary = paymentMethod === "crediary";

      let status: "paid" | "partially_paid" | "pending" = "paid";
      if (isCrediary) {
        const r = Math.random();
        if (r < 0.35) status = "pending";
        else if (r < 0.6) status = "partially_paid";
        else status = "paid";
      }

      salesToInsert.push({
        invoiceNumber: nextInvoice++,
        date: dateAt(year, month, day),
        traysSold,
        pricePerTrayInCents,
        totalAmountInCents,
        paymentMethod,
        status,
        customerId: pickRandom(customerIds),
        warehouseId: pickRandom(warehouses).id,
        createdBy: userId,
        notes: null,
      });
    }
  }

  // Inserir em lotes de 50
  const BATCH_SIZE = 50;
  const insertedSales: { id: string; totalAmountInCents: number; status: string; paymentMethod: string }[] = [];

  for (let i = 0; i < salesToInsert.length; i += BATCH_SIZE) {
    const batch = salesToInsert.slice(i, i + BATCH_SIZE);
    const result = await db
      .insert(salesTable)
      .values(batch)
      .returning({
        id: salesTable.id,
        totalAmountInCents: salesTable.totalAmountInCents,
        status: salesTable.status,
        paymentMethod: salesTable.paymentMethod,
      });
    insertedSales.push(...result);
  }

  console.log(`✅ ${insertedSales.length} vendas inseridas`);

  /* ---- 6. Gerar pagamentos de crediário ----------------------------------- */
  console.log("\n💳 Gerando pagamentos de crediário...");

  const crediaryPayments: {
    saleId: string;
    amountInCents: number;
    paymentDate: Date;
    paymentMethod: "pix" | "credit_card" | "debit_card" | "bank_slip" | "crediary";
    createdBy: string;
  }[] = [];

  for (const sale of insertedSales) {
    if (sale.paymentMethod !== "crediary") continue;
    if (sale.status === "pending") continue;

    const isPartial = sale.status === "partially_paid";
    const paymentAmount = isPartial
      ? Math.floor(sale.totalAmountInCents * randomBetween(20, 75) / 100)
      : sale.totalAmountInCents;

    // Use a payment date in the current year
    const now = new Date();
    const paymentDate = new Date(
      now.getFullYear(),
      randomBetween(0, now.getMonth()),
      randomBetween(1, 28),
    );

    crediaryPayments.push({
      saleId: sale.id,
      amountInCents: paymentAmount,
      paymentDate,
      paymentMethod: pickRandom(["pix", "credit_card", "debit_card"] as const),
      createdBy: userId,
    });
  }

  if (crediaryPayments.length > 0) {
    for (let i = 0; i < crediaryPayments.length; i += BATCH_SIZE) {
      await db
        .insert(salePaymentsTable)
        .values(crediaryPayments.slice(i, i + BATCH_SIZE));
    }
    console.log(`✅ ${crediaryPayments.length} pagamentos de crediário inseridos`);
  }

  /* ---- 7. Resumo ---------------------------------------------------------- */
  const totalSales = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(salesTable);
  const totalCustomers = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(peopleTable)
    .where(eq(peopleTable.category, "customer"));

  console.log("\n✨ Seed concluído!");
  console.log(`   Clientes: ${totalCustomers[0].count}`);
  console.log(`   Vendas:   ${totalSales[0].count}`);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

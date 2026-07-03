import { renderToBuffer } from "@react-pdf/renderer";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import React from "react";

import { db } from "@/db";
import { salesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { InvoicePdfData } from "@/components/invoice-pdf";
import { InvoicePdf } from "@/components/invoice-pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const sale = await db.query.salesTable.findFirst({
    where: eq(salesTable.id, id),
    with: {
      customer: { columns: { name: true } },
      warehouse: { columns: { name: true } },
      payments: { columns: { amountInCents: true } },
    },
  });

  if (!sale) {
    return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
  }

  const paidAmountInCents = sale.payments.reduce(
    (sum, p) => sum + p.amountInCents,
    0,
  );

  const data: InvoicePdfData = {
    invoiceNumber: sale.invoiceNumber,
    date: sale.date,
    customerName: sale.customer?.name ?? null,
    warehouseName: sale.warehouse.name,
    traysSold: sale.traysSold,
    pricePerTrayInCents: sale.pricePerTrayInCents,
    totalAmountInCents: sale.totalAmountInCents,
    paymentMethod: sale.paymentMethod,
    status: sale.status,
    notes: sale.notes ?? null,
    paidAmountInCents,
  };

  const element = React.createElement(InvoicePdf, { data });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(element as any);

  return new Response(pdfBuffer.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="nota-fiscal-${sale.invoiceNumber}.pdf"`,
    },
  });
}

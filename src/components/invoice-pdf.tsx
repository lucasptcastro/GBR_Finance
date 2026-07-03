import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  companySubtitle: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  invoiceLabel: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    textAlign: "right",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    color: "#6b7280",
    flex: 1,
  },
  value: {
    color: "#111827",
    fontWeight: 700,
    flex: 1,
    textAlign: "right",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    padding: "8 12",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    padding: "8 12",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  colDescription: { flex: 3, fontWeight: 700 },
  colQty: { flex: 1, textAlign: "center" },
  colUnit: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  colHeaderText: { color: "#6b7280", fontSize: 9 },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginVertical: 16,
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalBox: {
    width: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: { color: "#6b7280" },
  totalValue: { fontWeight: 700, color: "#111827" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#111827",
  },
  grandTotalLabel: { fontSize: 12, fontWeight: 700, color: "#111827" },
  grandTotalValue: { fontSize: 12, fontWeight: 700, color: "#111827" },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    color: "#9ca3af",
    fontSize: 8,
  },
  statusBadge: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 700,
  },
  statusBadgePending: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  statusBadgePartial: {
    backgroundColor: "#fef9c3",
    color: "#854d0e",
  },
});

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  bank_slip: "Boleto bancário",
  crediary: "Crediário",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "PAGO",
  pending: "AGUARDANDO PAGAMENTO",
  partially_paid: "PARCIALMENTE PAGO",
};

export interface InvoicePdfData {
  invoiceNumber: number;
  date: Date;
  customerName: string | null;
  warehouseName: string;
  traysSold: number;
  pricePerTrayInCents: number;
  totalAmountInCents: number;
  paymentMethod: string;
  status: string;
  notes: string | null;
  paidAmountInCents: number;
}

export function InvoicePdf({ data }: { data: InvoicePdfData }) {
  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const statusStyle =
    data.status === "paid"
      ? styles.statusBadge
      : data.status === "partially_paid"
        ? { ...styles.statusBadge, ...styles.statusBadgePartial }
        : { ...styles.statusBadge, ...styles.statusBadgePending };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Granja Barreto</Text>
            <Text style={styles.companySubtitle}>
              Produção e Venda de Ovos
            </Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>NOTA FISCAL</Text>
            <Text style={styles.invoiceNumber}>#{data.invoiceNumber}</Text>
            <Text style={{ ...styles.invoiceLabel, marginTop: 4 }}>
              {formatDate(data.date)}
            </Text>
          </View>
        </View>

        {/* Informações do cliente e galpão */}
        <View style={{ flexDirection: "row", gap: 24, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <Text style={{ fontWeight: 700, fontSize: 11 }}>
              {data.customerName ?? "Consumidor Final"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Galpão</Text>
            <Text style={{ fontWeight: 700, fontSize: 11 }}>
              {data.warehouseName}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Tabela de itens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens</Text>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.colDescription, ...styles.colHeaderText }}>
              Descrição
            </Text>
            <Text style={{ ...styles.colQty, ...styles.colHeaderText }}>
              Qtd.
            </Text>
            <Text style={{ ...styles.colUnit, ...styles.colHeaderText }}>
              Preço unit.
            </Text>
            <Text style={{ ...styles.colTotal, ...styles.colHeaderText }}>
              Total
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colDescription}>Bandeja de Ovos (30 un.)</Text>
            <Text style={styles.colQty}>{data.traysSold}</Text>
            <Text style={styles.colUnit}>
              {formatCurrency(data.pricePerTrayInCents)}
            </Text>
            <Text style={styles.colTotal}>
              {formatCurrency(data.totalAmountInCents)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Totais e pagamento */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Pagamento</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Forma</Text>
              <Text style={{ ...styles.value, textAlign: "left" }}>
                {PAYMENT_METHOD_LABELS[data.paymentMethod] ?? data.paymentMethod}
              </Text>
            </View>
            {data.paymentMethod === "crediary" && (
              <View style={styles.row}>
                <Text style={styles.label}>Pago</Text>
                <Text style={{ ...styles.value, textAlign: "left" }}>
                  {formatCurrency(data.paidAmountInCents)}
                </Text>
              </View>
            )}
            <View style={{ marginTop: 8 }}>
              <Text style={statusStyle}>
                {STATUS_LABELS[data.status] ?? data.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.totalBox}>
            {data.paymentMethod === "crediary" && (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(data.totalAmountInCents)}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Pago</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(data.paidAmountInCents)}
                  </Text>
                </View>
              </>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>
                {data.paymentMethod === "crediary"
                  ? "Saldo devedor"
                  : "Total"}
              </Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(
                  data.paymentMethod === "crediary"
                    ? data.totalAmountInCents - data.paidAmountInCents
                    : data.totalAmountInCents,
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Observações */}
        {data.notes && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Observações</Text>
              <Text style={{ color: "#4b5563" }}>{data.notes}</Text>
            </View>
          </>
        )}

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Granja Barreto — Documento de controle interno
          </Text>
          <Text style={styles.footerText}>
            NF #{data.invoiceNumber} · {formatDate(data.date)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

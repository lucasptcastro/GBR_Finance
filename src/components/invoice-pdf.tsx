import {
  Document,
  Line,
  Page,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";

const CONTENT_WIDTH = 280;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    paddingVertical: 24,
    paddingHorizontal: 40,
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  // ── Cabeçalho ──────────────────────────────────────────────
  headerContainer: {
    alignItems: "center",
    marginBottom: 6,
    width: CONTENT_WIDTH,
    alignSelf: "center",
  },
  companyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 1,
  },
  headerLine: {
    fontSize: 8,
    marginBottom: 1,
  },
  // ── Info pedido ─────────────────────────────────────────────
  infoContainer: {
    width: CONTENT_WIDTH,
    alignSelf: "center",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  infoText: {
    fontSize: 8,
  },
  // ── Divisória com texto ──────────────────────────────────────
  dividerContainer: {
    width: CONTENT_WIDTH,
    alignSelf: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  dividerText: {
    fontSize: 7,
    marginBottom: 1,
    fontWeight: "bold",
  },
  // ── Tabela de itens ──────────────────────────────────────────
  tableContainer: {
    width: CONTENT_WIDTH,
    alignSelf: "center",
    marginBottom: 2,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingBottom: 2,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    marginBottom: 1,
  },
  colCodigo: { width: 36, fontSize: 7 },
  colDescricao: { flex: 1, fontSize: 7 },
  colQtd: { width: 30, fontSize: 7, textAlign: "right" },
  colVrUnit: { width: 36, fontSize: 7, textAlign: "right" },
  colVrTot: { width: 36, fontSize: 7, textAlign: "right" },
  colHeaderText: { fontFamily: "Helvetica-Bold", fontSize: 7 },
  // ── Totais ───────────────────────────────────────────────────
  totaisContainer: {
    width: CONTENT_WIDTH,
    alignSelf: "center",
    marginBottom: 4,
  },
  totaisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  totaisLabel: { fontSize: 8 },
  totaisValue: { fontSize: 8 },
  totalDestaque: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  // ── Pagamento ────────────────────────────────────────────────
  pagamentoContainer: {
    width: CONTENT_WIDTH,
    alignSelf: "center",
    marginBottom: 4,
  },
  pagamentoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  pagamentoHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  pagamentoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  // ── Observação ───────────────────────────────────────────────
  observacaoContainer: {
    width: CONTENT_WIDTH,
    maxWidth: CONTENT_WIDTH,
    alignSelf: "center",
    marginBottom: 6,
  },
  observacaoText: {
    fontSize: 8,
    width: CONTENT_WIDTH,
  },
  // ── Operador ───────────────────────────────────────────────
  operadorContainer: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    marginBottom: 2,
  },
  // ── Rodapé ───────────────────────────────────────────────────
  footerContainer: {
    width: CONTENT_WIDTH,
    alignSelf: "center",
    alignItems: "center",
    marginTop: 4,
  },
  footerText: {
    fontSize: 7,
    marginBottom: 1,
  },
  footerBold: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    marginBottom: 1,
  },
});

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  bank_slip: "Boleto Bancário",
  crediary: "Crediário",
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

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const OBSERVACAO_CHARS_PER_LINE = 50;

function splitObservacaoIntoLines(
  text: string,
  maxCharsPerLine: number,
): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    if (!paragraph) {
      lines.push("");
      continue;
    }

    let currentLine = "";

    for (const segment of paragraph.split(/(\s+)/)) {
      if (!segment) continue;

      if (segment.length > maxCharsPerLine) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = "";
        }

        for (let i = 0; i < segment.length; i += maxCharsPerLine) {
          lines.push(segment.slice(i, i + maxCharsPerLine));
        }
        continue;
      }

      const nextLine = currentLine + segment;
      if (nextLine.length > maxCharsPerLine && currentLine) {
        lines.push(currentLine);
        currentLine = segment.trimStart();
      } else {
        currentLine = nextLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

function DottedLine() {
  return (
    <Svg height={4} width={CONTENT_WIDTH}>
      <Line
        x1={0}
        y1={2}
        x2={CONTENT_WIDTH}
        y2={2}
        strokeWidth={1.5}
        stroke="#000000"
        strokeDasharray="2,2"
      />
    </Svg>
  );
}

function Divider({ label }: { label?: string }) {
  return (
    <View style={styles.dividerContainer}>
      <DottedLine />
      {label && <Text style={styles.dividerText}>{label}</Text>}
      <DottedLine />
    </View>
  );
}

export function InvoicePdf({ data }: { data: InvoicePdfData }) {
  const isCrediary = data.paymentMethod === "crediary";
  const remainingInCents = data.totalAmountInCents - data.paidAmountInCents;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Cabeçalho ── */}
        <View style={styles.headerContainer}>
          <Text style={styles.companyName}>GRANJA BARRETO</Text>
          <Text style={styles.headerLine}>Produção e Venda de Ovos</Text>
        </View>

        {/* ── Info do pedido ── */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>Pedido: {data.invoiceNumber}</Text>
            <Text style={styles.infoText}>
              Emitido em: {formatDate(data.date)}
            </Text>
          </View>
          <Text style={styles.infoText}>
            Cliente: {data.customerName ?? "Consumidor Final"}
          </Text>
        </View>

        <Divider label="Documento não possui valor fiscal" />

        {/* ── Tabela de itens ── */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colCodigo, styles.colHeaderText]}>Cód</Text>
            <Text style={[styles.colDescricao, styles.colHeaderText]}>
              Descrição
            </Text>
            <Text style={[styles.colQtd, styles.colHeaderText]}>Qtd</Text>
            <Text style={[styles.colVrUnit, styles.colHeaderText]}>
              Vr Unit
            </Text>
            <Text style={[styles.colVrTot, styles.colHeaderText]}>Vr Tot</Text>
          </View>
          <DottedLine />
          <View style={styles.tableRow}>
            <Text style={styles.colCodigo}>1</Text>
            <Text style={styles.colDescricao}>BANDEJA DE OVOS (30UND.)</Text>
            <Text style={styles.colQtd}>{data.traysSold} Un</Text>
            <Text style={styles.colVrUnit}>
              {formatCurrency(data.pricePerTrayInCents)}
            </Text>
            <Text style={styles.colVrTot}>
              {formatCurrency(data.totalAmountInCents)}
            </Text>
          </View>
        </View>

        <Divider label="Documento não possui valor fiscal" />

        {/* ── Totais ── */}
        <View style={styles.totaisContainer}>
          <View style={styles.totaisRow}>
            <Text style={styles.totaisLabel}>Subtotal</Text>
            <Text style={styles.totaisValue}>
              {formatCurrency(data.totalAmountInCents)}
            </Text>
          </View>
          <View style={styles.totaisRow}>
            <Text style={styles.totaisLabel}>Total de Acréscimos (+)</Text>
            <Text style={styles.totaisValue}>R$ 0,00</Text>
          </View>
          <View style={styles.totaisRow}>
            <Text style={styles.totaisLabel}>Total de Descontos (-)</Text>
            <Text style={styles.totaisValue}>R$ 0,00</Text>
          </View>
          <View style={styles.totaisRow}>
            <Text style={styles.totaisLabel}>Frete</Text>
            <Text style={styles.totaisValue}>R$ 0,00</Text>
          </View>
          <View style={styles.totaisRow}>
            <Text style={styles.totaisLabel}>Serviço</Text>
            <Text style={styles.totaisValue}>R$ 0,00</Text>
          </View>
          <View style={styles.totaisRow}>
            <Text style={[styles.totaisLabel, styles.totalDestaque]}>
              Valor Total
            </Text>
            <Text style={[styles.totaisValue, styles.totalDestaque]}>
              {formatCurrency(data.totalAmountInCents)}
            </Text>
          </View>
          <View style={{ marginTop: 2 }}>
            <DottedLine />
          </View>
        </View>

        {/* ── Forma de pagamento ── */}
        <View style={styles.pagamentoContainer}>
          <View style={styles.pagamentoHeader}>
            <Text style={styles.pagamentoHeaderText}>Forma de Pagamento</Text>
            <Text style={styles.pagamentoHeaderText}>Valor Pago</Text>
          </View>
          <View style={styles.pagamentoRow}>
            <Text style={styles.infoText}>
              {PAYMENT_METHOD_LABELS[data.paymentMethod] ?? data.paymentMethod}
            </Text>
            <Text style={styles.infoText}>
              {formatCurrency(data.paidAmountInCents)}
            </Text>
          </View>
          {isCrediary && (
            <View style={styles.pagamentoRow}>
              <Text style={styles.infoText}>Saldo devedor</Text>
              <Text style={styles.infoText}>
                {formatCurrency(remainingInCents)}
              </Text>
            </View>
          )}
        </View>

        {/* ── Observação ── */}
        {data.notes ? (
          <View style={styles.observacaoContainer}>
            <Text
              style={{
                fontFamily: "Helvetica-Bold",
                fontSize: 8,
                marginBottom: 2,
              }}
            >
              Observação
            </Text>
            <Text style={styles.observacaoText}>
              {splitObservacaoIntoLines(
                data.notes,
                OBSERVACAO_CHARS_PER_LINE,
              ).join("\n")}
            </Text>
          </View>
        ) : null}

        {/* ── Operador ── */}
        <View style={styles.totaisContainer}>
          <View style={styles.totaisRow}>
            <Text style={styles.totaisLabel}>Operador: GRANJA BARRETO</Text>
          </View>
        </View>

        {/* ── Rodapé ── */}
        <View style={styles.footerContainer}>
          <DottedLine />
          <Text style={styles.footerBold}>Obrigado pela preferência</Text>
          <DottedLine />
          <Text style={styles.footerBold}>Terra-Bit x Grove Solutions</Text>
        </View>
      </Page>
    </Document>
  );
}

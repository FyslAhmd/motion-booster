import { InvoiceShell } from './InvoiceShell';

export interface BudgetReportRow {
  date: string;
  type: 'Add' | 'Deduct';
  amount: number;       // raw dollar value (always positive)
  amountLabel: string;  // pre-formatted e.g. "+$12.00" or "-$50.00"
  method: string;
  isDeduct: boolean;
}

interface BudgetReportInvoiceProps {
  invoiceNo: string;
  billDate: string;
  clientName: string;
  assignBy: string;
  rows: BudgetReportRow[];
}

const PER_DOLLAR_RATE = 145;

function fmtTk(value: number) {
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/-`;
}

// ── Column order: Date, Type, Method, Amount($), Per Dollar(Rate), Sub Total ──
const COL_CONFIG: Record<string, { label: string | React.ReactNode; flex: number; align: 'center' | 'left' | 'right' }> = {
  date: { label: 'Date & Time', flex: 20, align: 'center' },
  type: { label: 'Type', flex: 10, align: 'center' },
  method: { label: 'Method', flex: 14, align: 'center' },
  amount: {
    label: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
        <span>Amount</span>
        <span style={{ fontSize: '7px', fontWeight: 'normal', opacity: 0.8 }}>(Dollar)</span>
      </div>
    ),
    flex: 12,
    align: 'center',
  },
  perDollar: {
    label: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
        <span>Per Dollar</span>
        <span style={{ fontSize: '7px', fontWeight: 'normal', opacity: 0.8 }}>(Rate)</span>
      </div>
    ),
    flex: 12,
    align: 'center',
  },
  subTotal: { label: 'Sub Total', flex: 14, align: 'right' },
};

const ALL_COLS = Object.keys(COL_CONFIG);

const JUSTIFY_MAP = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
} as const;

const ROW: React.CSSProperties = {
  display: 'flex',
  gap: '2px',
  marginBottom: '2px',
};

function HeadCell({ children, flex }: { children: React.ReactNode; flex: number }) {
  return (
    <div
      style={{
        flex: `${flex} 1 0%`,
        minHeight: '32px',
        background: '#000000',
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px 6px',
        boxSizing: 'border-box',
        fontSize: '10px',
        fontWeight: 700,
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 1.3,
      }}
    >
      {children}
    </div>
  );
}

function DataCell({
  children,
  flex,
  align = 'center',
  color,
  bold,
}: {
  children: React.ReactNode;
  flex: number;
  align?: 'center' | 'left' | 'right';
  color?: string;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        flex: `${flex} 1 0%`,
        minHeight: '30px',
        background: '#d8d8d8',
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: JUSTIFY_MAP[align],
        padding: '5px 6px',
        boxSizing: 'border-box',
        fontSize: '10px',
        color: color || '#000000',
        fontWeight: bold ? 700 : 'normal',
        lineHeight: 1.3,
        wordBreak: align === 'left' ? 'break-word' : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function BudgetReportInvoice({
  invoiceNo,
  billDate,
  clientName,
  assignBy,
  rows,
}: BudgetReportInvoiceProps) {
  // Calculate grand total in Tk
  const grandTotalTk = rows.reduce((sum, r) => {
    const tkValue = r.amount * PER_DOLLAR_RATE;
    return sum + (r.isDeduct ? -tkValue : tkValue);
  }, 0);

  return (
    <InvoiceShell
      invoiceNo={invoiceNo}
      billDate={billDate}
      clientName={clientName}
      assignBy={assignBy}
      subtitle="Budget History"
    >
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div style={ROW}>
        {ALL_COLS.map((key) => (
          <HeadCell key={key} flex={COL_CONFIG[key].flex}>
            {COL_CONFIG[key].label}
          </HeadCell>
        ))}
      </div>

      {/* ── Data rows ──────────────────────────────────────────────────── */}
      {rows.map((row, idx) => {
        const subTotal = row.amount * PER_DOLLAR_RATE;
        const accentColor = row.isDeduct ? '#dc2626' : '#16a34a';

        const rowData: Record<string, React.ReactNode> = {
          date: row.date,
          type: row.type,
          method: row.method,
          amount: row.amountLabel,
          perDollar: `${PER_DOLLAR_RATE}Tk`,
          subTotal: fmtTk(subTotal),
        };

        return (
          <div key={idx} style={ROW}>
            {ALL_COLS.map((colKey) => {
              const cfg = COL_CONFIG[colKey];
              const isAccented = colKey === 'type' || colKey === 'amount';
              return (
                <DataCell
                  key={colKey}
                  flex={cfg.flex}
                  align={cfg.align}
                  color={isAccented ? accentColor : undefined}
                  bold={isAccented}
                >
                  {rowData[colKey]}
                </DataCell>
              );
            })}
          </div>
        );
      })}

      {/* ── Sub Total banner (red, full width) ─────────────────────────── */}
      <div
        style={{
          marginTop: '4px',
          background: '#ef0914',
          borderRadius: '2px',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          fontSize: '12px',
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '0.5px',
        }}
      >
        Sub Total amount= {fmtTk(Math.abs(grandTotalTk))}
      </div>
    </InvoiceShell>
  );
}

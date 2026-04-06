import { InvoiceShell } from './InvoiceShell';

interface NamedAmount {
  title: string;
  amount: number;
}

interface AccountsSummaryInvoiceProps {
  invoiceNo: string;
  billDate: string;
  clientName: string;
  assignBy: string;
  facebookSpend: number;
  otherEntries: NamedAmount[];
  totalAdjustments: NamedAmount[];
  totalAmount: number;
}

function fmt(value: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

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
        minHeight: '30px',
        background: '#000000',
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px 8px',
        boxSizing: 'border-box',
        fontSize: '10px',
        fontWeight: 700,
        color: '#ffffff',
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
  align = 'left',
  accent,
}: {
  children: React.ReactNode;
  flex: number;
  align?: 'left' | 'right' | 'center';
  accent?: boolean;
}) {
  const justify = align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start';

  return (
    <div
      style={{
        flex: `${flex} 1 0%`,
        minHeight: '30px',
        background: accent ? '#ffe8ea' : '#d8d8d8',
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: justify,
        padding: '5px 8px',
        boxSizing: 'border-box',
        fontSize: '10px',
        color: '#111827',
        fontWeight: accent ? 700 : 500,
        lineHeight: 1.3,
      }}
    >
      {children}
    </div>
  );
}

export function AccountsSummaryInvoice({
  invoiceNo,
  billDate,
  clientName,
  assignBy,
  facebookSpend,
  otherEntries,
  totalAdjustments,
  totalAmount,
}: AccountsSummaryInvoiceProps) {
  const rows: Array<{ title: string; amount: number; accent?: boolean }> = [
    { title: 'Facebook Ads Spend', amount: facebookSpend, accent: true },
    ...otherEntries.map((entry) => ({
      title: `Others - ${entry.title}`,
      amount: entry.amount,
    })),
    ...totalAdjustments.map((entry) => ({
      title: `Total Adjustment - ${entry.title}`,
      amount: entry.amount,
    })),
  ];

  return (
    <InvoiceShell
      invoiceNo={invoiceNo}
      billDate={billDate}
      clientName={clientName}
      assignBy={assignBy}
      subtitle="Accounts Summary"
    >
      <div style={ROW}>
        <HeadCell flex={8}>Item</HeadCell>
        <HeadCell flex={4}>Amount</HeadCell>
      </div>

      {rows.map((row, index) => (
        <div key={`${row.title}-${index}`} style={ROW}>
          <DataCell flex={8} accent={Boolean(row.accent)}>{row.title}</DataCell>
          <DataCell flex={4} align="right" accent={Boolean(row.accent)}>
            {fmt(row.amount)}
          </DataCell>
        </div>
      ))}

      <div
        style={{
          marginTop: '4px',
          background: '#ef0914',
          borderRadius: '2px',
          padding: '7px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          fontSize: '12px',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '0.2px',
        }}
      >
        Grand Total: {fmt(totalAmount)}
      </div>
    </InvoiceShell>
  );
}

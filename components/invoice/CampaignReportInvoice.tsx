import { InvoiceShell } from './InvoiceShell';

interface ReportInvoiceRow {
  adCreateDate: string;
  adEndDate: string;
  campaignName: string;
  spendUsd: number;
  spendTk: number;
  goal: string;
  goalResult: number;
  costPerGoalResult: number;
  reach: number;
  impressions: number;
}

interface CampaignReportInvoiceProps {
  invoiceNo: string;
  billDate: string;
  clientName: string;
  assignBy: string;
  rows: ReportInvoiceRow[];
  selectedColumns?: string[];
}

function fmt(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── WHY PURE DIVS INSTEAD OF <table> ─────────────────────────────────────────
// html2canvas fundamentally mishandles vertical centering inside <td> elements.
// No combination of vertical-align, line-height, flex wrappers, or padding
// reliably fixes it. The only solution that ALWAYS works:
//
//   Row = <div style="display:flex">         → all children share same height
//   Cell = <div style="display:flex; align-items:center">  → content centered
//
// Flex div layout is confirmed working by html2canvas maintainers.
// ─────────────────────────────────────────────────────────────────────────────

// Column Configuration with Flex Weights
export const COL_CONFIG: Record<string, { label: string; flex: number; align: 'center' | 'left' | 'right' }> = {
  campaignName: { label: 'Campaign Name', flex: 18, align: 'left' },
  goal: { label: 'Goal', flex: 10, align: 'center' },
  goalResult: { label: 'Goal Result', flex: 7, align: 'right' },
  costPerGoalResult: { label: 'Cost / Goal', flex: 7, align: 'right' },
  reach: { label: 'Reach', flex: 7, align: 'right' },
  impressions: { label: 'Impressions', flex: 7, align: 'right' },
  spendUsd: { label: 'Spend ($)', flex: 7, align: 'right' },
  spendTk: { label: 'Spend (Tk)', flex: 8, align: 'right' },
};

export const ALL_COLUMNS = Object.keys(COL_CONFIG);

// Map 'left'/'center'/'right' to flex justify
const JUSTIFY_MAP = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
} as const;

// Shared row container style (flex row, 2px gap)
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
        minHeight: '28px',
        background: '#000000',
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        boxSizing: 'border-box',
        fontSize: '8px',
        fontWeight: 'normal',
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
}: {
  children: React.ReactNode;
  flex: number;
  align?: 'center' | 'left' | 'right';
}) {
  return (
    <div
      style={{
        flex: `${flex} 1 0%`,
        minHeight: '26px',
        background: '#d8d8d8',
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: JUSTIFY_MAP[align],
        padding: '4px',
        boxSizing: 'border-box',
        fontSize: '8px',
        color: '#000000',
        lineHeight: 1.3,
        wordBreak: align === 'left' ? 'break-word' : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function CampaignReportInvoice({
  invoiceNo,
  billDate,
  clientName,
  assignBy,
  rows,
  selectedColumns,
}: CampaignReportInvoiceProps) {
  const activeCols = selectedColumns && selectedColumns.length > 0
    ? selectedColumns.filter((k: string) => COL_CONFIG[k])
    : ALL_COLUMNS;
    const grandTotalTk = rows.reduce((sum, row) => sum + row.spendTk, 0);
  return (
    <InvoiceShell
      invoiceNo={invoiceNo}
      billDate={billDate}
      dateLabel="Report Date"
      clientName={clientName}
      assignBy={assignBy}
      title="Report Summary"
      subtitle="Report Summary"
    >
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div style={ROW}>
        {activeCols.map((colKey: string) => {
          const cfg = COL_CONFIG[colKey];
          return (
            <HeadCell key={colKey} flex={cfg.flex}>
              {cfg.label}
            </HeadCell>
          );
        })}
      </div>

      {/* ── Data rows ──────────────────────────────────────────────────── */}
      {rows.map((row, idx) => {
        const rowData: Record<string, React.ReactNode> = {
          campaignName: (
            <div style={{ display: 'flex', flexDirection: 'column', padding: '2px 0', gap: '2px' }}>
              <span style={{ fontWeight: 600 }}>{row.campaignName}</span>
              <span style={{ fontSize: '9px', color: '#555' }}>
                ({row.adCreateDate} to {row.adEndDate})
              </span>
            </div>
          ),
          spendUsd: fmt(row.spendUsd),
          spendTk: fmt(row.spendTk),
          goal: row.goal,
          goalResult: String(row.goalResult),
          costPerGoalResult: fmt(row.costPerGoalResult),
          reach: String(row.reach),
          impressions: String(row.impressions),
        };

        return (
          <div key={`${row.campaignName}-${idx}`} style={ROW}>
            {activeCols.map((colKey: string) => {
              const cfg = COL_CONFIG[colKey];
              return (
                <DataCell key={colKey} flex={cfg.flex} align={cfg.align}>
                  {rowData[colKey]}
                </DataCell>
              );
            })}
          </div>
        );
      })}

      <div
        style={{
          marginTop: '4px',
          background: '#ef0914',
          borderRadius: '2px',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          fontSize: '10px',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '0.2px',
        }}
      >
        Total Campaign Spend (Tk): {fmt(grandTotalTk)}
      </div>

    </InvoiceShell>
  );
}

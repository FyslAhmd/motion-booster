import { InvoiceShell } from './InvoiceShell';

interface ReportInvoiceRow {
  date: string;
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

// Column width ratios (11 columns)
const COL_WIDTHS = [
  '8.5%',  // Date
  '9.5%',  // Ad Create Date
  '9%',    // Ad End Date
  '18%',   // Campaign Name
  '7.5%',  // Spend ($)
  '8.5%',  // Spend (Tk)
  '11%',   // Goal
  '7%',    // Goal Result
  '7%',    // Cost / Goal
  '7%',    // Reach
  '7%',    // Impressions
];

// Alignment per column
const COL_ALIGN: ('center' | 'left' | 'right')[] = [
  'center', 'center', 'center', 'left',
  'right', 'right', 'center', 'right',
  'right', 'right', 'right',
];

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

function HeadCell({ children, width }: { children: React.ReactNode; width: string }) {
  return (
    <div
      style={{
        width,
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
  width,
  align = 'center',
}: {
  children: React.ReactNode;
  width: string;
  align?: 'center' | 'left' | 'right';
}) {
  return (
    <div
      style={{
        width,
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

const HEADERS = [
  'Date', 'Ad Create Date', 'Ad End Date', 'Campaign Name',
  'Spend ($)', 'Spend (Tk)', 'Goal', 'Goal Result',
  'Cost / Goal', 'Reach', 'Impressions',
];

export function CampaignReportInvoice({
  invoiceNo,
  billDate,
  clientName,
  assignBy,
  rows,
}: CampaignReportInvoiceProps) {
  return (
    <InvoiceShell
      invoiceNo={invoiceNo}
      billDate={billDate}
      clientName={clientName}
      assignBy={assignBy}
      subtitle="Campaign History"
    >
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div style={ROW}>
        {HEADERS.map((label, i) => (
          <HeadCell key={label} width={COL_WIDTHS[i]}>{label}</HeadCell>
        ))}
      </div>

      {/* ── Data rows ──────────────────────────────────────────────────── */}
      {rows.map((row, idx) => {
        const vals = [
          row.date,
          row.adCreateDate,
          row.adEndDate,
          row.campaignName,
          fmt(row.spendUsd),
          fmt(row.spendTk),
          row.goal,
          String(row.goalResult),
          fmt(row.costPerGoalResult),
          String(row.reach),
          String(row.impressions),
        ];

        return (
          <div key={`${row.campaignName}-${idx}`} style={ROW}>
            {vals.map((val, i) => (
              <DataCell key={i} width={COL_WIDTHS[i]} align={COL_ALIGN[i]}>
                {val}
              </DataCell>
            ))}
          </div>
        );
      })}

    </InvoiceShell>
  );
}

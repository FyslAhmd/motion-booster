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

// ── WHY ALL INLINE STYLES ────────────────────────────────────────────────────
// This component is rendered in a hidden off-screen div and captured by
// html2canvas. html2canvas reads computed styles via getComputedStyle(), but
// for off-screen elements (left: -100000px) Tailwind utility classes are
// sometimes not computed correctly by the browser, causing rendering failures.
// Inline styles are ALWAYS applied regardless of viewport position.
// ─────────────────────────────────────────────────────────────────────────────

const TH: React.CSSProperties = {
  height: '28px',
  verticalAlign: 'middle',
  background: '#000000',
  padding: '0 4px',
  fontSize: '8px',
  fontWeight: 'normal',
  color: '#ffffff',
  borderRadius: '2px',
  textAlign: 'center',
  lineHeight: '28px',
  whiteSpace: 'nowrap',
};

const TD: React.CSSProperties = {
  height: '26px',
  verticalAlign: 'middle',
  background: '#d8d8d8',
  padding: '0 4px',
  fontSize: '8px',
  color: '#000000',
  borderRadius: '2px',
  textAlign: 'center',
  lineHeight: '26px',
  whiteSpace: 'nowrap',
};

const TD_L: React.CSSProperties = { ...TD, textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word' };
const TD_R: React.CSSProperties = { ...TD, textAlign: 'right' };

export function CampaignReportInvoice({
  invoiceNo,
  billDate,
  clientName,
  assignBy,
  rows,
}: CampaignReportInvoiceProps) {
  const totalUsd = rows.reduce((sum, row) => sum + row.spendUsd, 0);
  const totalTk = rows.reduce((sum, row) => sum + row.spendTk, 0);

  return (
    <InvoiceShell
      invoiceNo={invoiceNo}
      billDate={billDate}
      clientName={clientName}
      assignBy={assignBy}
      subtitle="BILL RECEIPT"
    >
      {/* ── Data table ─────────────────────────────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '2px' }}>
        <thead>
          <tr>
            <th style={TH}>Date</th>
            <th style={TH}>Ad Create Date</th>
            <th style={TH}>Ad End Date</th>
            <th style={TH}>Campaign Name</th>
            <th style={TH}>Spend ($)</th>
            <th style={TH}>Spend (Tk)</th>
            <th style={TH}>Goal</th>
            <th style={TH}>Goal Result</th>
            <th style={TH}>Cost / Goal</th>
            <th style={TH}>Reach</th>
            <th style={TH}>Impressions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={`${row.campaignName}-${idx}`}>
              <td style={TD}>{row.date}</td>
              <td style={TD}>{row.adCreateDate}</td>
              <td style={TD}>{row.adEndDate}</td>
              <td style={TD_L}>{row.campaignName}</td>
              <td style={TD_R}>{fmt(row.spendUsd)}</td>
              <td style={TD_R}>{fmt(row.spendTk)}</td>
              <td style={TD}>{row.goal}</td>
              <td style={TD_R}>{row.goalResult}</td>
              <td style={TD_R}>{fmt(row.costPerGoalResult)}</td>
              <td style={TD_R}>{row.reach}</td>
              <td style={TD_R}>{row.impressions}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Sub-total bar ──────────────────────────────────────────────── */}
      <div style={{
        marginTop: '6px',
        borderRadius: '2px',
        background: '#ef1f22',
        padding: '4px 8px',
        textAlign: 'right',
        fontSize: '12px',
        fontWeight: 'normal',
        color: '#ffffff',
      }}>
        Sub Total amount= ${fmt(totalUsd)}
      </div>

      {/* ── Important note box ─────────────────────────────────────────── */}
      <div style={{
        marginTop: '6px',
        overflow: 'hidden',
        borderRadius: '6px',
        border: '1px solid #cfcfcf',
        background: '#d8d8d8',
      }}>
        <div style={{
          borderBottom: '1px solid #c6c6c6',
          padding: '4px 0',
          textAlign: 'center',
          fontSize: '17px',
          fontWeight: '900',
          letterSpacing: '1px',
          color: '#000000',
        }}>
          IMPORTANT NOTE
        </div>
        <div style={{ padding: '8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'normal', color: '#000000' }}>
            <span>01. Sub Total Amount (USD)</span>
            <span>= ${fmt(totalUsd)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'normal', color: '#000000', marginTop: '2px' }}>
            <span>02. Sub Total Amount (Tk)</span>
            <span>= {fmt(totalTk)}</span>
          </div>
        </div>
      </div>
    </InvoiceShell>
  );
}

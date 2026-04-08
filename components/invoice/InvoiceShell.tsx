import { ReactNode } from 'react';

interface InvoiceShellProps {
  invoiceNo: string;
  billDate: string;
  dateLabel?: string;
  clientName: string;
  assignBy: string;
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function InvoiceShell({
  invoiceNo,
  billDate,
  dateLabel = 'Bill Date',
  clientName,
  assignBy,
  children,
  title = 'INVOICE',
  subtitle = 'BILL RECEIPT',
}: InvoiceShellProps) {
  return (
    <div
      data-invoice-root="true"
      style={{ background: '#d9d9d9', padding: '12px 8px', fontFamily: 'sans-serif' }}
    >
      <div style={{ background: '#ececec', padding: '10px', margin: '0 auto', maxWidth: '780px' }}>

        {/* ── Header bar ───────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#000000',
            padding: '14px 20px',
          }}
        >
          <div>
            {/* Use width/height as inline attrs AND style so html2canvas sees them */}
            <img
              src="/MotionBoosterWhiteLogoFooter.svg"
              alt="Motion Booster"
              width={230}
              height={62}
              style={{ height: '36px', width: 'auto', display: 'block', objectFit: 'contain' }}
            />
            <p style={{ marginTop: '6px', fontSize: '9px', letterSpacing: '1.4px', color: '#ffffff', fontWeight: 'normal' }}>
              GROW | BUSINESS | IDENTITY
            </p>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', color: '#ffffff', margin: 0, lineHeight: 1 }}>
            {title}
          </h1>
        </div>

        {/* ── Body ─────────────────────────────────────────── */}
        <div style={{ padding: '12px 6px 0' }}>

          {/* Client info row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>

            {/* Left: name + assign */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                <span style={{ display: 'inline-block', background: '#f4e3c5', borderRadius: '3px', padding: '4px 8px', color: '#000', fontWeight: 'normal', whiteSpace: 'nowrap' }}>
                  Name on Facebook:
                </span>
                <span style={{ display: 'inline-block', background: '#f4e3c5', borderRadius: '3px', padding: '4px 8px', color: '#000', flex: 1, minWidth: 0 }}>
                  {clientName}
                </span>
              </div>
              <div style={{ display: 'inline-block', background: '#f4e3c5', borderRadius: '3px', padding: '4px 8px', fontSize: '11px', color: '#000', fontWeight: 'normal' }}>
                Assign by : {assignBy}
              </div>
            </div>

            {/* Right: invoice no + date */}
            <div style={{ minWidth: '170px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'inline-block', background: '#dddddd', borderRadius: '3px', padding: '4px 8px', fontSize: '11px', color: '#000', fontWeight: 'normal' }}>
                Invoice No. : {invoiceNo}
              </div>
              <div style={{ display: 'inline-block', background: '#dddddd', borderRadius: '3px', padding: '4px 8px', fontSize: '11px', color: '#000', fontWeight: 'normal' }}>
                {dateLabel}: {billDate}
              </div>
            </div>
          </div>

          {/* Subtitle banner */}
          <div style={{ marginTop: '10px', background: '#ef0914', borderRadius: '2px', padding: '4px', textAlign: 'center', fontSize: '26px', fontWeight: '900', letterSpacing: '1px', color: '#ffffff', lineHeight: 1.1 }}>
            {subtitle}
          </div>

          {/* Slot for table and totals */}
          <div style={{ marginTop: '6px' }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { CampaignReportInvoice } from '@/components/invoice';

const SAMPLE_ROWS = [
  {
    date: 'Mar 31, 2026',
    adCreateDate: 'Mar 28, 2026',
    adEndDate: 'Apr 04, 2026',
    campaignName: 'Post: কার্ড কাট এবং ড্রপ সোল্ডার পেয়ে নেট',
    spendUsd: 11.50,
    spendTk: 1667.50,
    goal: 'CONVERSATIONS',
    goalResult: 323,
    costPerGoalResult: 0.04,
    reach: 28294,
    impressions: 32593,
  },
  {
    date: 'Mar 31, 2026',
    adCreateDate: 'Mar 29, 2026',
    adEndDate: 'Apr 07, 2026',
    campaignName: 'Iqra Language Institute',
    spendUsd: 10.12,
    spendTk: 1467.40,
    goal: 'CONVERSATIONS',
    goalResult: 54,
    costPerGoalResult: 0.19,
    reach: 11506,
    impressions: 18789,
  },
];

export default function DebugInvoicePage() {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const captureCanvas = async () => {
    if (!invoiceRef.current) return;
    setStatus('Capturing...');

    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default;

    // Wait for fonts
    await document.fonts.ready;
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      imageTimeout: 0,
      backgroundColor: '#d9d9d9',
      logging: true,
    });

    setCanvasDataUrl(canvas.toDataURL('image/png'));
    setStatus(`Done! Canvas: ${canvas.width}x${canvas.height}`);
  };

  return (
    <div style={{ padding: 20, background: '#fff' }}>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Invoice Debug Page</h1>
      <p style={{ marginBottom: 10, color: '#666' }}>
        Compare the live browser rendering (top) with html2canvas output (bottom).
        If text alignment differs, the problem is html2canvas. If both look the same, the problem is CSS.
      </p>

      <button
        onClick={captureCanvas}
        style={{
          padding: '10px 24px',
          background: '#ef1f22',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 20,
        }}
      >
        Capture with html2canvas
      </button>
      {status && <p style={{ marginBottom: 10, fontWeight: 'bold' }}>{status}</p>}

      <h2 style={{ fontSize: 18, margin: '20px 0 10px', borderBottom: '2px solid #000', paddingBottom: 4 }}>
        ▼ LIVE BROWSER RENDERING (how it should look)
      </h2>
      <div ref={invoiceRef} style={{ width: 794 }}>
        <CampaignReportInvoice
          invoiceNo="RPT-DEBUG"
          billDate="Mar 31, 2026"
          clientName="Test 1 Client"
          assignBy="Test 1 Client"
          rows={SAMPLE_ROWS}
        />
      </div>

      {canvasDataUrl && (
        <>
          <h2 style={{ fontSize: 18, margin: '30px 0 10px', borderBottom: '2px solid #ef1f22', paddingBottom: 4 }}>
            ▼ HTML2CANVAS OUTPUT (what goes into the PDF)
          </h2>
          <img
            src={canvasDataUrl}
            alt="html2canvas output"
            style={{ width: 794, border: '2px solid #ef1f22' }}
          />
        </>
      )}
    </div>
  );
}

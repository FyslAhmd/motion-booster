'use client';

import { useState, useRef } from 'react';
import { CampaignReportInvoice } from '@/components/invoice';

const SAMPLE_ROWS = [
  {
    adCreateDate: 'Mar 28, 2026',
    adEndDate: 'Apr 04, 2026',
    campaignName: 'Post: কার্ড কাট এবং ড্রপ সোল্ডার পেয়ে নেট',
    pageName: 'Motion Booster',
    spendUsd: 11.50,
    spendTk: 1667.50,
    goal: 'CONVERSATIONS',
    goalResult: 323,
    costPerGoalResult: 0.04,
    reach: 28294,
    impressions: 32593,
    total: 1667.50,
  },
  {
    adCreateDate: 'Mar 29, 2026',
    adEndDate: 'Apr 07, 2026',
    campaignName: 'Iqra Language Institute',
    pageName: 'Iqra Language Institute',
    spendUsd: 10.12,
    spendTk: 1467.40,
    goal: 'CONVERSATIONS',
    goalResult: 54,
    costPerGoalResult: 0.19,
    reach: 11506,
    impressions: 18789,
    total: 1467.40,
  },
];

export default function DebugInvoicePage() {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [html2canvasResult, setHtml2canvasResult] = useState<string | null>(null);
  const [htmlToImageResult, setHtmlToImageResult] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const captureWithHtml2canvas = async () => {
    if (!invoiceRef.current) return;
    setStatus('Capturing with html2canvas...');
    const h2c = (await import('html2canvas')).default;
    await document.fonts.ready;
    const canvas = await h2c(invoiceRef.current, {
      scale: 2, useCORS: true, backgroundColor: '#d9d9d9', logging: false,
    });
    setHtml2canvasResult(canvas.toDataURL('image/png'));
    setStatus('html2canvas done');
  };

  const captureWithHtmlToImage = async () => {
    if (!invoiceRef.current) return;
    setStatus('Capturing with html-to-image...');
    const { toPng } = await import('html-to-image');
    await document.fonts.ready;

    // html-to-image uses SVG foreignObject — browser's OWN rendering engine
    const dataUrl = await toPng(invoiceRef.current, {
      pixelRatio: 2,
      backgroundColor: '#d9d9d9',
    });
    setHtmlToImageResult(dataUrl);
    setStatus('html-to-image done');
  };

  return (
    <div style={{ padding: 20, background: '#fff', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Invoice Debug — html2canvas vs html-to-image</h1>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button onClick={captureWithHtml2canvas} style={{ padding: '10px 20px', background: '#ef1f22', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
          Capture: html2canvas
        </button>
        <button onClick={captureWithHtmlToImage} style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
          Capture: html-to-image
        </button>
      </div>
      {status && <p style={{ fontWeight: 'bold', marginBottom: 10 }}>{status}</p>}

      <h2 style={{ borderBottom: '2px solid #000', paddingBottom: 4, marginBottom: 10 }}>
        ▼ LIVE BROWSER (how it should look)
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

      <div style={{ display: 'flex', gap: 20, marginTop: 30 }}>
        {html2canvasResult && (
          <div style={{ flex: 1 }}>
            <h2 style={{ borderBottom: '2px solid #ef1f22', paddingBottom: 4, marginBottom: 10 }}>
              ▼ html2canvas (BROKEN)
            </h2>
            <img src={html2canvasResult} alt="html2canvas" style={{ width: '100%', border: '2px solid #ef1f22' }} />
          </div>
        )}
        {htmlToImageResult && (
          <div style={{ flex: 1 }}>
            <h2 style={{ borderBottom: '2px solid #2563eb', paddingBottom: 4, marginBottom: 10 }}>
              ▼ html-to-image (NEW)
            </h2>
            <img src={htmlToImageResult} alt="html-to-image" style={{ width: '100%', border: '2px solid #2563eb' }} />
          </div>
        )}
      </div>
    </div>
  );
}

export async function fetchNextInvoiceNumber() {
  const res = await fetch('/api/v1/invoices/next-number', {
    method: 'POST',
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok || !json?.success || !json?.invoiceNo) {
    throw new Error(json?.error || 'Failed to allocate invoice number');
  }

  return String(json.invoiceNo);
}

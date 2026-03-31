import { InvoiceShell } from '@/components/invoice';

const invoiceData = {
  invoiceNo: '#0154',
  billDate: '27 February 2025',
  clientName: 'Bijoy KOREAN Language',
  assignBy: 'Mr. Shohel',
  services: [
    {
      id: '01',
      name: 'Facebook Post Boost',
      amount: '25$',
      perDollar: '145Tk',
      subTotal: '3,625.00/-',
    },
  ],
  subTotalAmount: '3,625.00/-',
  previousDue: '2,250.00/-',
  dueAmount: '5,875.00/-',
  payableTotal: '5,875.00/-',
  gatewayNote: 'Per thousand 1.5% charge is applicable for using online gateway',
};

export default function InvoicePage() {
  return (
    <InvoiceShell
      invoiceNo={invoiceData.invoiceNo}
      billDate={invoiceData.billDate}
      clientName={invoiceData.clientName}
      assignBy={invoiceData.assignBy}
    >
            <table className="w-full border-separate border-spacing-0.5">
              <thead>
                <tr>
                  <th className="w-[50%] rounded-sm bg-black px-2 py-1.5 text-center text-[10px] font-normal text-white sm:text-[16px]">Name of Service</th>
                  <th className="w-[17%] rounded-sm bg-black px-2 py-1.5 text-center text-[10px] font-normal text-white sm:text-[16px]">
                    Amount
                    <div className="text-[7px] font-normal sm:text-[10px]">(Dollar)</div>
                  </th>
                  <th className="w-[17%] rounded-sm bg-black px-2 py-1.5 text-center text-[10px] font-normal text-white sm:text-[16px]">
                    Per Dollar
                    <div className="text-[7px] font-normal sm:text-[10px]">(Rate)</div>
                  </th>
                  <th className="w-[16%] rounded-sm bg-black px-2 py-1.5 text-center text-[10px] font-normal text-white sm:text-[16px]">Sub Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.services.map((service) => (
                  <tr key={service.id}>
                    <td className="h-16 rounded-sm bg-[#d8d8d8] px-2 py-2 align-top text-[11px] font-normal text-black sm:h-20 sm:px-3 sm:py-2.5 sm:text-[18px]">
                      {service.id}. {service.name}
                    </td>
                    <td className="h-16 rounded-sm bg-[#d8d8d8] px-1 py-2 text-center text-[11px] font-normal text-black sm:h-20 sm:text-[18px]">{service.amount}</td>
                    <td className="h-16 rounded-sm bg-[#d8d8d8] px-1 py-2 text-center text-[11px] font-normal text-black sm:h-20 sm:text-[18px]">{service.perDollar}</td>
                    <td className="h-16 rounded-sm bg-[#d8d8d8] px-1 py-2 text-center text-[11px] font-normal text-black sm:h-20 sm:text-[18px]">{service.subTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          <div className="mt-2 rounded-sm bg-[#ef1f22] px-2 py-1 text-right text-[14px] font-normal text-white sm:text-[20px] sm:leading-[1.1]">
            Sub Total amount= {invoiceData.subTotalAmount}
          </div>

          <div className="mt-2 overflow-hidden rounded-md border border-[#cfcfcf] bg-[#d8d8d8]">
            <div className="border-b border-[#c6c6c6] py-1 text-center text-[17px] font-black tracking-[1px] text-black sm:text-[30px] sm:leading-[1.1]">
              IMPORTANT NOTE
            </div>
            <div className="px-3 py-2 sm:px-3.5 sm:py-2.5">
              <div className="flex items-center justify-between text-[11px] font-normal text-black sm:text-[14px]">
                <span>01. Sub Total Amount</span>
                <span>= {invoiceData.subTotalAmount}</span>
              </div>
              <div className="mt-0.5 flex items-center justify-between text-[11px] font-normal text-black sm:text-[14px]">
                <span>02. Previous Due</span>
                <span>= {invoiceData.previousDue}</span>
              </div>
              <div className="my-1.5 border-t-2 border-dashed border-[#b0b0b0]" />
              <div className="text-right text-[12px] font-normal text-black sm:text-[15px]">Due Amount = {invoiceData.dueAmount}</div>
            </div>
          </div>

          <div className="mt-2 flex items-end justify-between gap-2.5">
            <div className="max-w-[62%] text-[8px] italic text-[#c10c0f] sm:text-[10px]">
              <span className="font-normal">*</span>{' '}
              <span className="underline">{invoiceData.gatewayNote}</span>
            </div>
            <div className="rounded-sm bg-[#ef1f22] px-2 py-1 text-[14px] font-normal text-white sm:text-[20px] sm:leading-[1.1]">
              Payable intotal amount= {invoiceData.payableTotal}
            </div>
          </div>
    </InvoiceShell>
  );
}

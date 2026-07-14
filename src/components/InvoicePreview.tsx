import React, { useEffect, useState } from 'react';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { getPaymentSettings } from '@/lib/settingsStorage';
import { formatInvoiceNo } from '@/lib/utils';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const [qrImage, setQrImage] = useState('');
  const [qrNote, setQrNote] = useState('');

  useEffect(() => {
    let active = true;
    getPaymentSettings()
      .then((settings) => {
        if (!active) return;
        setQrImage(settings.qrImage);
        setQrNote(settings.note);
      })
      .catch(() => {
        // Non-fatal: invoice still renders without the payment QR
      });
    return () => {
      active = false;
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.querySelector('.invoice-content') as HTMLElement;
      if (!element) {
        console.error('Invoice content element not found');
        return;
      }

      const options = {
        margin: 0.3,
        filename: `Invoice-${formatInvoiceNo(invoice.invoiceNo)}.pdf`,
        image: {
          type: 'jpeg',
          quality: 0.95
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      await html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      <div className="mb-4 print:hidden flex gap-2">
        <Button onClick={handlePrint} className="bg-invoice-blue hover:bg-invoice-blue/90">
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </Button>
        <Button onClick={handleDownloadPDF} variant="outline" className="border-invoice-blue text-invoice-blue hover:bg-invoice-blue hover:text-white">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <div className="invoice-content border border-invoice-border" style={{ padding: '20px' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <img
              src="/lovable-uploads/starlink-logo.png"
              alt="Starlink Jewels"
              className="h-16 w-auto"
            />
          </div>
          <div className="text-right">
            <div className="text-xs text-invoice-text leading-relaxed">
              <p>55 JOHN ST</p>
              <p>EAST RUTHERFORD</p>
              <p>NEW JERSEY 07073</p>
              {/* <p>Surat Gujarat India.</p> */}
              <p className="mt-1">Tel No: +91 83472 78188</p>
              <p>Primary: +1 201 554 4824</p>
              <p>Email: Starlinkjewels@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-invoice-border mb-4"></div>

        {/* Invoice Title */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-invoice-text">INVOICE</h2>
        </div>

        {/* Invoice Details */}
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-invoice-text mb-1">TO: {invoice.customerName}</h3>
            <div className="text-xs text-invoice-text leading-relaxed">
              <p>{invoice.customerAddress}</p>
              <p>{invoice.customerCity}</p>
              {invoice.customerPhone && <p>Tel: {invoice.customerPhone}</p>}
            </div>
          </div>
          <div className="border border-invoice-border p-2 min-w-[180px]">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="font-semibold">Invoice No:</span>
                <span>{formatInvoiceNo(invoice.invoiceNo)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Date:</span>
                <span>{formatDate(invoice.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Terms:</span>
                <span>{invoice.terms}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse border border-invoice-border text-sm">
            <thead>
              <tr className="bg-invoice-blue-light">
                <th className="border border-invoice-border p-1.5 text-left font-semibold text-xs">SR NO</th>
                <th className="border border-invoice-border p-1.5 text-left font-semibold text-xs">STOCK ID</th>
                <th className="border border-invoice-border p-1.5 text-left font-semibold text-xs">DESCRIPTION</th>
                <th className="border border-invoice-border p-1.5 text-center font-semibold text-xs">PCS</th>
                <th className="border border-invoice-border p-1.5 text-center font-semibold text-xs">WEIGHT</th>
                <th className="border border-invoice-border p-1.5 text-center font-semibold text-xs">PRICE<br /><span className="text-xs">USD / HKD</span></th>
                <th className="border border-invoice-border p-1.5 text-center font-semibold text-xs">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={item.id} className="border-b border-invoice-border">
                  <td className="border border-invoice-border p-1.5 text-center text-xs">{index + 1}</td>
                  <td className="border border-invoice-border p-1.5 text-xs">{item.stockId}</td>
                  <td className="border border-invoice-border p-1.5 text-xs">{item.description}</td>
                  <td className="border border-invoice-border p-1.5 text-center text-xs">{item.pieces}</td>
                  <td className="border border-invoice-border p-1.5 text-center text-xs">{item.weight}CT</td>
                  <td className="border border-invoice-border p-1.5 text-center text-xs">{item.pricePerUnit}$</td>
                  <td className="border border-invoice-border p-1.5 text-center text-xs">{item.total}$</td>
                </tr>
              ))}
              {/* Empty rows to match original format */}
              {Array.from({ length: Math.max(0, 6 - invoice.items.length) }).map((_, index) => (
                <tr key={`empty-${index}`} className="border-b border-invoice-border">
                  <td className="border border-invoice-border p-1.5 text-xs">&nbsp;</td>
                  <td className="border border-invoice-border p-1.5 text-xs">&nbsp;</td>
                  <td className="border border-invoice-border p-1.5 text-xs">&nbsp;</td>
                  <td className="border border-invoice-border p-1.5 text-xs">&nbsp;</td>
                  <td className="border border-invoice-border p-1.5 text-xs">&nbsp;</td>
                  <td className="border border-invoice-border p-1.5 text-xs">&nbsp;</td>
                  <td className="border border-invoice-border p-1.5 text-xs">&nbsp;</td>
                </tr>
              ))}
              {/* Totals */}
              {invoice.shippingCharges > 0 && (
                <tr className="border-b border-invoice-border">
                  <td className="border border-invoice-border p-1.5 text-xs" colSpan={6}>
                    <div className="text-right font-semibold">Shipping Charges</div>
                  </td>
                  <td className="border border-invoice-border p-1.5 text-center font-semibold text-xs">{invoice.shippingCharges}$</td>
                </tr>
              )}
              {invoice.otherCharges > 0 && (
                <tr className="border-b border-invoice-border">
                  <td className="border border-invoice-border p-1.5 text-xs" colSpan={6}>
                    <div className="text-right font-semibold">Sales Tax</div>
                  </td>
                  <td className="border border-invoice-border p-1.5 text-center font-semibold text-xs">{invoice.otherCharges}$</td>
                </tr>
              )}
              <tr className="border-b border-invoice-border">
                <td className="border border-invoice-border p-1.5 text-xs" colSpan={6}>
                  <div className="text-right font-bold">Total Amount</div>
                </td>
                <td className="border border-invoice-border p-1.5 text-center font-bold text-xs">{invoice.totalAmount}$</td>
              </tr>
              {invoice.advancePayment > 0 && (
                <>
                  <tr className="border-b border-invoice-border">
                    <td className="border border-invoice-border p-1.5 text-xs" colSpan={6}>
                      <div className="text-right font-semibold">Advance Payment</div>
                    </td>
                    <td className="border border-invoice-border p-1.5 text-center font-semibold text-xs">{invoice.advancePayment}$</td>
                  </tr>
                  <tr className="border-b border-invoice-border">
                    <td className="border border-invoice-border p-1.5 text-xs" colSpan={6}>
                      <div className="text-right font-bold">Balance Due</div>
                    </td>
                    <td className="border border-invoice-border p-1.5 text-center font-bold text-xs">{invoice.balanceDue}$</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end mt-6 gap-4">
          <div>
            <p className="text-xs text-invoice-text mb-1">Buyers Confirmation.</p>
            <div className="border-t border-invoice-border w-32 mt-4">
              <p className="text-xs text-invoice-text mt-1">Chop or signature.</p>
            </div>
          </div>
          {qrImage && (
            <div className="text-center">
              <div className="border border-invoice-border p-2 inline-block">
                <p className="text-xs font-semibold text-invoice-text mb-1">SCAN TO PAY</p>
                <img
                  src={qrImage}
                  alt="Payment QR"
                  className="h-24 w-24 mx-auto object-contain"
                />
              </div>
              {qrNote && (
                <p className="text-[10px] text-invoice-text mt-1 max-w-[130px] mx-auto whitespace-pre-line">
                  {qrNote}
                </p>
              )}
            </div>
          )}
          <div className="text-center">
            <p className="text-xs text-invoice-text mb-1">For STARLINK JEWELS INC</p>
            <img
              src="/lovable-uploads/f0614b5e-b964-42cf-bde0-69b22be4545e.png"
              alt="Starlink Jewels Stamp"
              className="h-16 w-16 mx-auto mb-1"
            />
            <div className="border-t border-invoice-border w-32 mx-auto">
              <p className="text-xs text-invoice-text mt-1">Chop & Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Legal Text */}
        <div className="mt-4 text-xs text-invoice-text space-y-1 leading-tight">
          <p>This Items Here in Invoiced Has Been Purchased from Legal Sources, Not Involved in Funding Conflict and In Compliance with United Nations Resolutions.</p>
          <p>The Seller Here by Guaranteed This Item Are Conflict Free and Not Involved in Any Money Laundering, Based On Personal Knowledge and Written Guarantied Provided by The Supplier of This Item.</p>
        </div>

        {/* Thank You */}
        <div className="text-center mt-3">
          <p className="text-sm font-semibold text-invoice-text">THANK YOU FOR YOUR BUSINESS</p>
        </div>
      </div>

      <style>{`
        @media print {
          .invoice-content {
            border: none !important;
            padding: 20px !important;
            margin: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          .invoice-content, .invoice-content * {
            visibility: visible;
          }
          .invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 0;
            size: A4;
            padding: 20px;
          }
          /* Remove all browser headers, footers, URLs, and page numbers */
          html {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0 !important;
            padding: 20px !important;
          }
          /* Hide browser chrome elements */
          * {
            -webkit-box-shadow: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <script dangerouslySetInnerHTML={{
        __html: `
          window.addEventListener('beforeprint', function() {
            document.title = '';
            // Try to remove browser headers/footers
            if (window.chrome) {
              document.head.insertAdjacentHTML('beforeend', 
                '<style>@page { margin: 0; padding: 20px; } @media print { body { margin: 0; padding: 20px; } .invoice-content { padding: 20px !important; } }</style>'
              );
            }
          });
        `
      }} />
    </div>
  );
};

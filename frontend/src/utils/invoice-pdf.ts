import html2pdf from 'html2pdf.js';
import { Invoice } from '@/types';

export const downloadInvoicePDF = (invoice: Invoice) => {
  const element = document.createElement('div');

  // Calculate totals
  const subtotal = invoice.amount;
  const tax = (subtotal * (invoice.taxPercentage || 0)) / 100;
  const total = subtotal + tax;

  // Create a clean, professional looking invoice template
  element.innerHTML = `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 40px; color: #1a202c; max-width: 800px; margin: auto;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px;">
        <div>
          <h1 style="color: #4f46e5; font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">GIGFLOW</h1>
          <p style="color: #718096; margin-top: 4px; font-weight: 500;">Freelancer Client Management</p>
        </div>
        <div style="text-align: right;">
          <h2 style="font-size: 24px; font-weight: 700; margin: 0; color: #2d3748;">INVOICE</h2>
          <p style="color: #718096; margin-top: 4px;">#${invoice.invoiceNumber || invoice.id.split('-').pop()?.toUpperCase()}</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 60px;">
        <div>
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #a0aec0; margin-bottom: 12px; font-weight: 700;">Bill To</h3>
          <p style="font-size: 18px; font-weight: 700; margin: 0;">${invoice.clientName}</p>
          ${invoice.paypalEmail ? `<p style="color: #4a5568; margin-top: 4px;">${invoice.paypalEmail}</p>` : ''}
        </div>
        <div style="text-align: right;">
          <div style="margin-bottom: 16px;">
            <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #a0aec0; margin: 0 0 4px 0; font-weight: 700;">Date Issued</p>
            <p style="font-weight: 600; margin: 0;">${new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          <div>
            <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #a0aec0; margin: 0 0 4px 0; font-weight: 700;">Due Date</p>
            <p style="font-weight: 600; margin: 0; color: #e53e3e;">${new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
        <thead>
          <tr style="border-bottom: 2px solid #edf2f7;">
            <th style="text-align: left; padding: 12px 0; font-size: 14px; text-transform: uppercase; color: #718096;">Description</th>
            <th style="text-align: right; padding: 12px 0; font-size: 14px; text-transform: uppercase; color: #718096;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #edf2f7;">
            <td style="padding: 24px 0; vertical-align: top;">
              <p style="font-weight: 600; margin: 0;">Services Rendered</p>
              <p style="color: #718096; margin-top: 8px; font-size: 14px; line-height: 1.5;">${invoice.description || 'Professional consulting and development services'}</p>
            </td>
            <td style="text-align: right; padding: 24px 0; font-weight: 600; vertical-align: top;">$${subtotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end;">
        <div style="width: 250px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="color: #718096;">Subtotal</span>
            <span style="font-weight: 600;">$${subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="color: #718096;">Tax (${invoice.taxPercentage || 0}%)</span>
            <span style="font-weight: 600;">$${tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 16px 0; border-top: 2px solid #edf2f7; margin-top: 8px;">
            <span style="font-weight: 700; font-size: 18px;">Total Due</span>
            <span style="font-weight: 800; font-size: 18px; color: #4f46e5;">$${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style="margin-top: 100px; padding-top: 40px; border-top: 1px solid #edf2f7; color: #a0aec0; font-size: 12px; text-align: center;">
        <p style="margin-bottom: 8px;">Thank you for your business!</p>
        <p>GigFlow • Managed via GigFlow Freelancer Platform</p>
      </div>
    </div>
  `;

  const opt = {
    margin: 0,
    filename: `invoice-${invoice.invoiceNumber || invoice.id.split('-').pop()?.toUpperCase()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(element).set(opt).save();
};

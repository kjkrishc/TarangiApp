// Component: Boutique Tax Invoice Printable Receipt Modal with Multi-Store & Barcode
import { Icons } from '../icons.js';
import { generateBarcodeSvg } from './barcodeGenerator.js';

export function openReceiptModal(bill) {
  const existing = document.getElementById('modal-receipt');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-receipt';

  const barcodePayload = bill.barcodePayload || `TARANGI-${bill.storeCode || 'STORE'}-${bill.billNumber}`;
  const billBarcodeSvg = generateBarcodeSvg(barcodePayload, 220, 42);
  const isReturn = bill.billType === 'return-exchange';
  const returnDetails = bill.returnDetails;
  const money = value => `${Number(value) < 0 ? '-₹' : '₹'}${Math.abs(Number(value) || 0).toLocaleString('en-IN')}`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const displayItems = Array.isArray(bill.items) ? bill.items : [];

  modal.innerHTML = `
    <div class="modal-sheet" style="max-height:92vh;">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <h3 class="modal-title">${isReturn ? 'Return / Exchange Bill' : 'Tax Invoice Generated'}</h3>
        <button class="icon-btn-ghost modal-close-btn" style="width:32px; height:32px;">${Icons.x(16)}</button>
      </div>

      <!-- Printable Artisanal Invoice Card -->
      <div class="tax-invoice-sheet" id="invoice-sheet-printable">
        <div class="invoice-header">
          <h3>TARANGI</h3>
          <div style="font-size:11px; font-weight:600; color:var(--color-secondary); letter-spacing:0.06em; text-transform:uppercase;">
            KURTIS • ETHNIC WEAR • ARTISANAL HANDLOOMS
          </div>
          <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">
            ${bill.storeName || 'Flagship Store'}<br/>
            ${bill.storeAddress || 'Hyderabad, Telangana'}<br/>
            GSTIN: ${bill.storeGstin || '36AAACT9108K1Z5'} • State Code: 36
          </div>
        </div>

        <div class="invoice-meta-row">
          <span><strong>Invoice No:</strong> ${escapeHtml(bill.billNumber)}</span>
          <span><strong>Date:</strong> ${escapeHtml(bill.date)} ${escapeHtml(bill.time)}</span>
        </div>
        ${isReturn ? `<div class="invoice-meta-row"><span><strong>Original invoice:</strong> ${escapeHtml(bill.originalBillNumber)}</span><span><strong>Return ID:</strong> ${escapeHtml(bill.returnId)}</span></div>` : ''}

        <div class="invoice-meta-row">
          <span><strong>Customer:</strong> ${escapeHtml(bill.customer)}</span>
          <span><strong>Mobile:</strong> ${escapeHtml(bill.customerMobile)}</span>
        </div>

        <div class="invoice-meta-row" style="margin-bottom:8px;">
          <span><strong>Payment:</strong> ${escapeHtml(bill.paymentMode)}</span>
          <span><strong>Cashier:</strong> ${escapeHtml(bill.salesmanName || 'Staff')}</span>
        </div>

        <div style="font-size:9px; color:var(--text-muted); margin-bottom:6px;">Item prices include GST; tax amounts are shown separately below.</div>
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Product / SKU</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Rate (₹)</th>
              <th style="text-align:right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${displayItems.map((it) => `
              <tr>
                <td>
                  <strong>${it.returnLine ? 'RETURN — ' : isReturn ? 'EXCHANGE — ' : ''}${escapeHtml(it.product.name)}</strong><br/>
                  <span style="font-size:9px; color:#78716c;">SKU: ${escapeHtml(it.product.sku)} [${escapeHtml(it.size)}] • HSN: 6204</span>
                </td>
                <td style="text-align:center;">${it.quantity}</td>
                <td style="text-align:right;">${money(it.product.price)}</td>
                <td style="text-align:right;">${money(Math.round(it.product.price * it.quantity * (1 - (it.discountPercent || 0) / 100)))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display:flex; flex-direction:column; gap:4px; font-size:11px; border-top:1px dashed var(--surface-border); padding-top:8px;">
          ${isReturn && returnDetails ? `
            <div style="display:flex; justify-content:space-between;">
              <span>Returned item credit:</span>
              <span style="font-family:var(--font-mono);">-${money(returnDetails.returnCreditAmount)}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span>Exchange item subtotal:</span>
              <span style="font-family:var(--font-mono);">${money(returnDetails.exchangeSubtotal)}</span>
            </div>
            ${returnDetails.exchangeDiscountAmount ? `
              <div style="display:flex; justify-content:space-between; color:var(--color-tertiary-dark); font-weight:600;">
                <span>Exchange item discount:</span>
                <span style="font-family:var(--font-mono);">-${money(returnDetails.exchangeDiscountAmount)}</span>
              </div>
            ` : ''}
            <div style="display:flex; justify-content:space-between;">
              <span>Exchange GST included:</span>
              <span style="font-family:var(--font-mono);">${money(Number(returnDetails.cgst || 0) + Number(returnDetails.sgst || 0))}</span>
            </div>
            <div style="display:flex; justify-content:space-between; color:var(--text-muted);">
              <span>GST reversal on returned items:</span>
              <span style="font-family:var(--font-mono);">-${money(returnDetails.returnGst)}</span>
            </div>
          ` : ''}
          ${!isReturn ? `
          <div style="display:flex; justify-content:space-between;">
            <span>Subtotal:</span>
            <span style="font-family:var(--font-mono);">${money(bill.subtotal)}</span>
          </div>

          ${bill.discountAmount > 0 ? `
            <div style="display:flex; justify-content:space-between; color:var(--color-tertiary-dark); font-weight:600;">
              <span>Item discounts:</span>
              <span style="font-family:var(--font-mono);">-${money(bill.discountAmount)}</span>
            </div>
          ` : ''}

          <div style="display:flex; justify-content:space-between;">
            <span>Taxable Value:</span>
            <span style="font-family:var(--font-mono);">${money(bill.taxable)}</span>
          </div>

          <div style="display:flex; justify-content:space-between; color:var(--text-muted);">
            <span>CGST included (2.5%):</span>
            <span style="font-family:var(--font-mono);">${money(bill.cgst)}</span>
          </div>

          <div style="display:flex; justify-content:space-between; color:var(--text-muted);">
            <span>SGST included (2.5%):</span>
            <span style="font-family:var(--font-mono);">${money(bill.sgst)}</span>
          </div>
          ` : ''}

          <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:700; color:var(--color-primary); border-top:1px solid var(--surface-border); padding-top:6px; margin-top:2px;">
            <span>${isReturn ? Number(bill.grandTotal) < 0 ? 'Net refund due:' : Number(bill.grandTotal) > 0 ? 'Balance due:' : 'Net exchange total:' : 'Net Grand Total:'}</span>
            <span style="font-family:var(--font-mono); font-size:16px;">${money(bill.grandTotal)}</span>
          </div>
        </div>

        <div style="display:flex; justify-content:center; margin:12px 0 6px 0;">
          ${billBarcodeSvg}
        </div>

        <div style="text-align:center; font-size:9px; color:var(--text-muted); border-top:1px dashed var(--surface-border); padding-top:6px;">
            ${isReturn ? `Return / exchange processed against ${escapeHtml(bill.originalBillNumber)}. Reference: ${escapeHtml(bill.returnId)}.` : 'For returns or exchanges, please bring this invoice and the original barcode tag.'}<br/>
          Thank you for shopping at Tarangi!
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex; gap:8px;">
        <button id="btn-print-bill" class="btn-primary" style="flex:1; height:44px;">
          ${Icons.printer(16)} Print Tax Invoice
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('.modal-close-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  modal.querySelector('#btn-print-bill')?.addEventListener('click', () => {
    window.print();
  });

}

// Component: Boutique Tax Invoice Printable Receipt Modal with Multi-Store & Barcode
import { Icons } from '../icons.js';
import { generateBarcodeSvg } from './barcodeGenerator.js';

export function openReceiptModal(bill) {
  const existing = document.getElementById('modal-receipt');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-receipt';

  const billBarcodeSvg = generateBarcodeSvg(bill.billNumber, 180, 36);

  modal.innerHTML = `
    <div class="modal-sheet" style="max-height:92vh;">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <h3 class="modal-title">Tax Invoice Generated</h3>
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
          <span><strong>Invoice No:</strong> ${bill.billNumber}</span>
          <span><strong>Date:</strong> ${bill.date} ${bill.time}</span>
        </div>

        <div class="invoice-meta-row">
          <span><strong>Customer:</strong> ${bill.customer}</span>
          <span><strong>Mobile:</strong> ${bill.customerMobile}</span>
        </div>

        <div class="invoice-meta-row" style="margin-bottom:8px;">
          <span><strong>Payment:</strong> ${bill.paymentMode}</span>
          <span><strong>Cashier:</strong> ${bill.salesmanName || 'Staff'}</span>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>Garment Style / SKU</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Rate (₹)</th>
              <th style="text-align:right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items.map((it) => `
              <tr>
                <td>
                  <strong>${it.product.name}</strong><br/>
                  <span style="font-size:9px; color:#78716c;">SKU: ${it.product.sku} [${it.size}] • HSN: 6204</span>
                </td>
                <td style="text-align:center;">${it.quantity}</td>
                <td style="text-align:right;">${it.product.price.toLocaleString('en-IN')}</td>
                <td style="text-align:right;">${(it.product.price * it.quantity).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display:flex; flex-direction:column; gap:4px; font-size:11px; border-top:1px dashed var(--surface-border); padding-top:8px;">
          <div style="display:flex; justify-content:space-between;">
            <span>Subtotal:</span>
            <span style="font-family:var(--font-mono);">₹${bill.subtotal.toLocaleString('en-IN')}</span>
          </div>

          ${bill.discountAmount > 0 ? `
            <div style="display:flex; justify-content:space-between; color:var(--color-tertiary-dark); font-weight:600;">
              <span>Discount (${bill.discountCode}):</span>
              <span style="font-family:var(--font-mono);">-₹${bill.discountAmount.toLocaleString('en-IN')}</span>
            </div>
          ` : ''}

          <div style="display:flex; justify-content:space-between;">
            <span>Taxable Value:</span>
            <span style="font-family:var(--font-mono);">₹${bill.taxable.toLocaleString('en-IN')}</span>
          </div>

          <div style="display:flex; justify-content:space-between; color:var(--text-muted);">
            <span>Garment CGST (2.5%):</span>
            <span style="font-family:var(--font-mono);">+₹${bill.cgst.toLocaleString('en-IN')}</span>
          </div>

          <div style="display:flex; justify-content:space-between; color:var(--text-muted);">
            <span>Garment SGST (2.5%):</span>
            <span style="font-family:var(--font-mono);">+₹${bill.sgst.toLocaleString('en-IN')}</span>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:700; color:var(--color-primary); border-top:1px solid var(--surface-border); padding-top:6px; margin-top:2px;">
            <span>Net Grand Total:</span>
            <span style="font-family:var(--font-mono); font-size:16px;">₹${bill.grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style="display:flex; justify-content:center; margin:12px 0 6px 0;">
          ${billBarcodeSvg}
        </div>

        <div style="text-align:center; font-size:9px; color:var(--text-muted); border-top:1px dashed var(--surface-border); padding-top:6px;">
          Garments exchangeable within 7 days with original barcode tag intact.<br/>
          Thank you for shopping at Tarangi!
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex; gap:8px;">
        <button id="btn-print-bill" class="btn-primary" style="flex:1; height:44px;">
          ${Icons.printer(16)} Print Tax Invoice
        </button>
        <button id="btn-share-whatsapp" class="btn-zari" style="flex:1; height:44px; background:#15803d;">
          WhatsApp Bill
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

  modal.querySelector('#btn-share-whatsapp')?.addEventListener('click', () => {
    closeModal();
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `Digital bill link sent to ${bill.customerMobile}!`, type: 'success' }
    }));
  });
}

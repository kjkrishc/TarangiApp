// Barcode Generator Utility & Retail Label Modal (Code 128 Standard)
import { Icons } from '../icons.js';
import JsBarcode from 'jsbarcode';

export function generateBarcodeSvg(code, width = 220, height = 55) {
  const value = String(code);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const moduleWidth = Math.max(0.7, Math.min(1.2, width / (value.length * 11 + 24)));
  JsBarcode(svg, value, {
    format: 'CODE128',
    width: moduleWidth,
    height,
    displayValue: true,
    font: 'monospace',
    fontSize: 11,
    textMargin: 2,
    margin: 0,
    lineColor: '#1e1b19',
    background: '#ffffff'
  });
  return svg.outerHTML;
}

export function openBarcodeModal(product) {
  const existing = document.getElementById('modal-barcode-tag');
  if (existing) existing.remove();

  const sizes = product.availableSizes || product.sizes || [product.size].filter(Boolean);
  const selectedSizes = new Set(sizes);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-barcode-tag';

  modal.innerHTML = `
    <div class="modal-sheet" style="max-height:92vh; text-align:center;">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <h3 class="modal-title">Retail Garment Barcode Tag</h3>
        <button class="icon-btn-ghost modal-close-btn" style="width:32px; height:32px;">${Icons.x(16)}</button>
      </div>

      <div style="font-size:12px; color:var(--text-muted); margin-bottom:14px;">
        Standard Retail Tag format (50mm x 35mm) ready for thermal sticker printer.
      </div>

      <!-- Printable Barcode Sticker Preview -->
      <div class="artisanal-card" style="padding:10px; text-align:left; margin-bottom:12px;">
        <div class="form-group">
          <label class="form-label">Select sizes to print</label>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${sizes.map(size => `
              <label class="filter-pill" style="display:flex; align-items:center; gap:4px;">
                <input type="checkbox" class="barcode-size-option" value="${size}" checked />
                ${size}
              </label>
            `).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="barcode-count">Tags per selected size</label>
          <input id="barcode-count" class="form-control" type="number" min="1" max="100" value="1" />
        </div>
      </div>
      <div id="barcode-sticker-printable" style="display:flex; flex-wrap:wrap; justify-content:center; gap:8px;"></div>

      <!-- Actions -->
      <div style="display:flex; gap:8px; margin-top:16px;">
        <button id="btn-print-barcode" class="btn-primary" style="flex:1; height:42px;">
          ${Icons.printer(16)} Print Sticker
        </button>
        <button id="btn-download-barcode" class="btn-secondary" style="flex:1; height:42px;">
          ${Icons.download(16)} Download Label
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

  const stickerPreview = modal.querySelector('#barcode-sticker-printable');
  const renderLabels = () => {
    const count = Number(modal.querySelector('#barcode-count').value);
    const chosen = Array.from(modal.querySelectorAll('.barcode-size-option:checked')).map(input => input.value);
    if (!Number.isInteger(count) || count < 1 || count > 100 || !chosen.length) {
      stickerPreview.innerHTML = '<p style="font-size:12px; color:var(--status-outstock);">Select at least one size and a tag count from 1 to 100.</p>';
      return false;
    }
    stickerPreview.innerHTML = chosen.flatMap(size => Array.from({ length: count }, (_, index) => {
      const barcodeValue = `${product.sku}-${size.replace(/[^a-z0-9]/gi, '')}`;
      return `
        <div class="barcode-sticker-card">
          <div class="tag-header">
            <span class="tag-brand">TARANGI</span>
            <span class="tag-craft-badge">${product.category || 'Garment'}</span>
          </div>
          <div class="tag-product-name" title="${product.name}">${product.name}</div>
          <div class="tag-meta-row">
            <span><strong>Size:</strong> ${size}</span>
            <span><strong>Color:</strong> ${product.colorName || ''}</span>
          </div>
          <div class="tag-svg-wrap">${generateBarcodeSvg(barcodeValue, 210, 50)}</div>
          <div class="tag-footer">
            <span class="tag-mrp">MRP: ₹${Number(product.price).toLocaleString('en-IN')}</span>
            <span class="tag-tax-inc">(Incl. of all taxes)</span>
          </div>
          <span style="font-size:8px;">Tag ${index + 1} of ${count}</span>
        </div>
      `;
    })).join('');
    return true;
  };
  modal.querySelectorAll('.barcode-size-option').forEach(input => input.addEventListener('change', renderLabels));
  modal.querySelector('#barcode-count').addEventListener('input', renderLabels);
  renderLabels();

  modal.querySelector('#btn-print-barcode')?.addEventListener('click', () => {
    if (renderLabels()) window.print();
  });

  modal.querySelector('#btn-download-barcode')?.addEventListener('click', () => {
    if (!renderLabels()) return;
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `${stickerPreview.querySelectorAll('.barcode-sticker-card').length} barcode tags for ${product.sku} prepared.`, type: 'success' }
    }));
  });
}

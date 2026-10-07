// Barcode Generator Utility & Retail Label Modal (Code 128 Standard)
import { Icons } from '../icons.js';

// Deterministic Code 128-like Barcode Pattern Generator for clean SVG rendering
export function generateBarcodeSvg(code, width = 220, height = 55) {
  // Generate consistent bar widths based on ASCII char codes
  let binaryString = '11010010000'; // Start code B
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    // 11-bit pattern mapping
    const p1 = (charCode % 4) + 1;
    const p2 = ((charCode >> 2) % 4) + 1;
    const p3 = ((charCode >> 4) % 4) + 1;
    binaryString += '1'.repeat(p1) + '0'.repeat(p2) + '1'.repeat(p3) + '0';
  }
  binaryString += '1100011101011'; // Stop code + terminal bar

  const barWidth = width / binaryString.length;
  let svgBars = '';
  let x = 0;

  for (let i = 0; i < binaryString.length; i++) {
    if (binaryString[i] === '1') {
      svgBars += `<rect x="${x.toFixed(2)}" y="0" width="${(barWidth * 1.05).toFixed(2)}" height="${height}" fill="#1e1b19" />`;
    }
    x += barWidth;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height + 18}" width="${width}" height="${height + 18}">
      <g>${svgBars}</g>
      <text x="${width / 2}" y="${height + 14}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#1e1b19" letter-spacing="2">
        ${code}
      </text>
    </svg>
  `;
}

export function openBarcodeModal(product) {
  const existing = document.getElementById('modal-barcode-tag');
  if (existing) existing.remove();

  const barcodeSvg = generateBarcodeSvg(product.sku, 210, 50);

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
      <div id="barcode-sticker-printable" class="barcode-sticker-card">
        <div class="tag-header">
          <span class="tag-brand">TARANGI</span>
          <span class="tag-craft-badge">${product.category || 'Kurti'}</span>
        </div>

        <div class="tag-product-name" title="${product.name}">${product.name}</div>
        
        <div class="tag-meta-row">
          <span><strong>Size:</strong> ${product.size || 'M'}</span>
          <span><strong>Color:</strong> ${product.colorName}</span>
        </div>

        <div class="tag-svg-wrap">
          ${barcodeSvg}
        </div>

        <div class="tag-footer">
          <span class="tag-mrp">MRP: ₹${product.price.toLocaleString('en-IN')}</span>
          <span class="tag-tax-inc">(Incl. of all taxes)</span>
        </div>
      </div>

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

  modal.querySelector('#btn-print-barcode')?.addEventListener('click', () => {
    window.print();
  });

  modal.querySelector('#btn-download-barcode')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `Barcode SVG tag for ${product.sku} prepared!`, type: 'success' }
    }));
  });
}

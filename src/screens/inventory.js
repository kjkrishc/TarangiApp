// Screen: Inventory Management & Barcode Generation
import { State } from '../state.js';
import { Icons } from '../icons.js';
import { openBarcodeModal } from '../components/barcodeGenerator.js';

let activeCategory = 'All';
let activeStatusFilter = 'All';
let searchQuery = '';

export function renderInventory(container) {
  const currentStore = State.getCurrentStore();
  const isAdmin = State.isAdmin();

  // Filter products
  const filtered = State.products.filter(item => {
    const matchCategory = activeCategory === 'All' || item.category === activeCategory;
    const storeStock = State.getProductStock(item.id, currentStore.id);
    
    let matchStatus = true;
    if (activeStatusFilter === 'In Stock') matchStatus = storeStock > item.threshold;
    else if (activeStatusFilter === 'Low Stock') matchStatus = storeStock > 0 && storeStock <= item.threshold;
    else if (activeStatusFilter === 'Out of Stock') matchStatus = storeStock === 0;

    const matchQuery = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.craft.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.fabric && item.fabric.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.colorName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchStatus && matchQuery;
  });

  const categories = ['All', ...State.masterData.categories];

  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
          <span class="status-pill instock" style="font-size:10px;">
            ${currentStore.name}
          </span>
          <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">
            ${filtered.length} Kurti Styles
          </span>
        </div>
        <h1 class="screen-title">Garment & Kurti Inventory</h1>
        <p class="screen-subtitle">SKU Matrix, Floor Stock & Barcode Printing</p>
      </div>

      ${isAdmin ? `
        <button id="btn-add-sku" class="btn-primary" style="height:38px; padding:0 12px; font-size:12px;">
          ${Icons.plus(16)} Add Kurti SKU
        </button>
      ` : ''}
    </div>

    <!-- Search & Scanner Box -->
    <div class="search-filter-box">
      <div class="search-input-wrap">
        <span class="search-icon">${Icons.search(16)}</span>
        <input 
          id="inv-search-input" 
          type="text" 
          class="search-input" 
          placeholder="Search by SKU, kurti craft, fabric (Mulmul, Chanderi)..."
          value="${searchQuery}"
        />
      </div>
      <button id="btn-inv-scan" class="icon-btn-ghost" title="Live Camera Scanner">
        ${Icons.camera(18)}
      </button>
    </div>

    <!-- Filter Strip: Garment Categories from Master Data -->
    <div class="filter-chips-row">
      ${categories.map(cat => `
        <button class="filter-pill ${activeCategory === cat ? 'active' : ''}" data-cat="${cat}">
          ${cat}
        </button>
      `).join('')}
    </div>

    <!-- Stock Status Filter Chips -->
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
      <div style="display:flex; gap:6px;">
        ${['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(st => `
          <button class="size-chip ${activeStatusFilter === st ? 'active' : ''}" data-status="${st}" style="padding:0 10px; font-size:10px;">
            ${st}
          </button>
        `).join('')}
      </div>
      <span style="font-size:11px; font-family:var(--font-mono); color:var(--text-muted);">
        Store: ${currentStore.code}
      </span>
    </div>

    <!-- High-Density SKU Catalog Feed -->
    <div id="sku-feed-list">
      ${filtered.length === 0 ? `
        <div style="text-align:center; padding:40px 20px; color:var(--text-muted); background:var(--surface-cream); border:1px dashed var(--surface-border); border-radius:12px;">
          <p style="font-family:var(--font-serif); font-size:16px; margin-bottom:4px;">No garments matched criteria</p>
          <p style="font-size:12px;">Try selecting another category or clearing search query.</p>
        </div>
      ` : filtered.map(item => {
        const storeStock = State.getProductStock(item.id, currentStore.id);
        const totalBrandStock = Object.values(item.stockPerStore || {}).reduce((a, b) => a + b, 0);

        let statusClass = 'instock';
        let statusLabel = `${storeStock} in stock`;
        if (storeStock === 0) {
          statusClass = 'outstock';
          statusLabel = 'Out of Stock';
        } else if (storeStock <= item.threshold) {
          statusClass = 'lowstock';
          statusLabel = `${storeStock} Low Stock`;
        }

        return `
          <div class="sku-feed-card">
            <!-- Swatch Visual Preview -->
            <div class="sku-thumbnail" style="background:${item.imageGradient};">
              <span class="sku-silk-badge">${item.fabric ? item.fabric.split(' ')[0] : 'KURTI'}</span>
              <div style="background:rgba(0,0,0,0.65); width:100%; text-align:center; padding:2px; font-size:8px; color:#fff; font-family:var(--font-mono);">
                ${item.sku}
              </div>
            </div>

            <!-- SKU Details & Barcode Generation -->
            <div class="sku-details">
              <div>
                <div class="sku-top-row">
                  <div style="min-width:0; flex:1;">
                    <div class="sku-name" title="${item.name}">${item.name}</div>
                    <div class="sku-code">${item.sku} • ${item.category}</div>
                  </div>
                  <span class="status-pill ${statusClass}">${statusLabel}</span>
                </div>

                <div class="sku-fabric-meta">
                  <span class="color-dot" style="background:${item.colorHex};"></span>
                  <span>${item.colorName}</span>
                  <span style="color:var(--text-muted);">• ${item.craft.split('•')[0]}</span>
                </div>

                <!-- Multi-store stock pills for Admin -->
                ${isAdmin ? `
                  <div style="display:flex; gap:4px; margin-top:4px; font-size:10px; font-family:var(--font-mono);">
                    <span style="background:var(--surface-cream); padding:1px 6px; border-radius:4px; border:1px solid var(--surface-border);">
                      JBL: ${item.stockPerStore?.['ST-01'] ?? 0}
                    </span>
                    <span style="background:var(--surface-cream); padding:1px 6px; border-radius:4px; border:1px solid var(--surface-border);">
                      BNJ: ${item.stockPerStore?.['ST-02'] ?? 0}
                    </span>
                    <span style="background:var(--surface-cream); padding:1px 6px; border-radius:4px; border:1px solid var(--surface-border);">
                      INB: ${item.stockPerStore?.['ST-03'] ?? 0}
                    </span>
                    <span style="color:var(--color-primary); font-weight:700;">
                      (Tot: ${totalBrandStock})
                    </span>
                  </div>
                ` : ''}
              </div>

              <!-- Price & Actions Row -->
              <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px;">
                <div>
                  <span class="sku-price">₹${item.price.toLocaleString('en-IN')}</span>
                  <span style="font-size:10px; color:var(--text-muted); margin-left:4px;">Size: ${item.size}</span>
                </div>

                <div style="display:flex; align-items:center; gap:6px;">
                  <!-- Barcode Label Generator Button -->
                  <button class="icon-btn-ghost btn-view-barcode" data-id="${item.id}" title="Generate & Print Barcode Label" style="width:32px; height:32px; color:var(--color-secondary);">
                    ${Icons.barcode(16)}
                  </button>

                  <!-- Steppers (Admin or Salesman) -->
                  <div class="tactile-stepper">
                    <button class="stepper-btn btn-stock-dec" data-id="${item.id}" title="Decrease Stock">
                      ${Icons.minus(12)}
                    </button>
                    <span class="stepper-value">${storeStock}</span>
                    <button class="stepper-btn btn-stock-inc" data-id="${item.id}" title="Increase Stock">
                      ${Icons.plus(12)}
                    </button>
                  </div>

                  <!-- Quick Add To POS Cart -->
                  <button class="icon-btn-ghost btn-add-pos" data-id="${item.id}" title="Add to POS Cart" style="width:32px; height:32px;">
                    ${Icons.shoppingBag(16)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Bind Events
  const searchInput = container.querySelector('#inv-search-input');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderInventory(container);
  });

  container.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeCategory = e.currentTarget.dataset.cat;
      renderInventory(container);
    });
  });

  container.querySelectorAll('[data-status]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeStatusFilter = e.currentTarget.dataset.status;
      renderInventory(container);
    });
  });

  container.querySelector('#btn-inv-scan')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-barcode-scanner'));
  });

  // Barcode View Trigger
  container.querySelectorAll('.btn-view-barcode').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const prod = State.products.find(p => p.id === id);
      if (prod) openBarcodeModal(prod);
    });
  });

  // Steppers
  container.querySelectorAll('.btn-stock-dec').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      State.adjustStock(id, -1, currentStore.id);
      renderInventory(container);
    });
  });

  container.querySelectorAll('.btn-stock-inc').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      State.adjustStock(id, 1, currentStore.id);
      renderInventory(container);
    });
  });

  // Add to POS Cart
  container.querySelectorAll('.btn-add-pos').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const prod = State.products.find(p => p.id === id);
      if (prod) {
        const storeStock = State.getProductStock(prod.id, currentStore.id);
        if (storeStock <= 0) {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Cannot add ${prod.sku} - Out of stock at ${currentStore.code}!`, type: 'alert' }
          }));
          return;
        }
        State.addToCart(prod);
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Added ${prod.name} to POS Cart!`, type: 'success' }
        }));
      }
    });
  });

  // Open Add SKU Modal for Admin
  container.querySelector('#btn-add-sku')?.addEventListener('click', () => {
    openAddKurtiModal();
  });
}

function openAddKurtiModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-add-kurti';
  modal.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <h3 class="modal-title">Register New Kurti / Garment SKU</h3>
        <button class="icon-btn-ghost modal-close-btn" style="width:32px; height:32px;">${Icons.x(16)}</button>
      </div>

      <form id="form-new-kurti">
        <div class="form-group">
          <label class="form-label">Garment Style Name</label>
          <input type="text" id="new-krt-name" class="form-control" placeholder="e.g. Pure Muslin Alia Cut Anarkali Kurti" required />
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="new-krt-cat" class="form-control">
              ${State.masterData.categories.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Fabric</label>
            <select id="new-krt-fabric" class="form-control">
              ${State.masterData.fabrics.map(f => `<option value="${f}">${f}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div class="form-group">
            <label class="form-label">Standard Size</label>
            <select id="new-krt-size" class="form-control">
              ${State.masterData.sizes.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Color / Shade</label>
            <input type="text" id="new-krt-color" class="form-control" placeholder="e.g. Dusty Rose" required />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div class="form-group">
            <label class="form-label">Retail MRP (₹)</label>
            <input type="number" id="new-krt-price" class="form-control" placeholder="3499" required />
          </div>

          <div class="form-group">
            <label class="form-label">Initial Stock Units</label>
            <input type="number" id="new-krt-stock" class="form-control" value="6" min="1" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Weave / Craft Details</label>
          <select id="new-krt-craft" class="form-control">
            ${State.masterData.crafts.map(cr => `<option value="${cr}">${cr}</option>`).join('')}
          </select>
        </div>

        <button type="submit" class="btn-primary btn-full" style="margin-top:10px;">
          ${Icons.barcode(16)} Save SKU & Generate Barcode Tag
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close-btn')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  modal.querySelector('#form-new-kurti')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = modal.querySelector('#new-krt-name').value;
    const cat = modal.querySelector('#new-krt-cat').value;
    const fabric = modal.querySelector('#new-krt-fabric').value;
    const size = modal.querySelector('#new-krt-size').value;
    const color = modal.querySelector('#new-krt-color').value;
    const price = parseInt(modal.querySelector('#new-krt-price').value, 10);
    const stock = parseInt(modal.querySelector('#new-krt-stock').value, 10);
    const craft = modal.querySelector('#new-krt-craft').value;

    const skuPrefix = cat.includes('Kurti') ? 'KRT' : (cat.includes('Set') ? 'SET' : 'GAR');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const skuCode = `TRG-${skuPrefix}-${randNum}`;

    const created = State.addNewProduct({
      id: skuCode,
      sku: skuCode,
      name,
      category: cat,
      fabric,
      craft,
      colorName: color,
      colorHex: '#881337',
      price: price || 2999,
      costPrice: Math.round(price * 0.55),
      size,
      sizes: [size, 'M (38)', 'L (40)', 'XL (42)'],
      initialStock: stock || 4,
      threshold: 2,
      imageGradient: 'linear-gradient(135deg, #881337 0%, #b45309 100%)'
    });

    modal.remove();
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `Registered SKU ${skuCode}! Opening barcode tag...`, type: 'success' }
    }));

    // Instantly preview generated barcode label for printing!
    setTimeout(() => openBarcodeModal(created), 300);
  });
}

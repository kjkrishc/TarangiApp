// Screen: Inventory Management & Barcode Generation
import { State } from '../state.js';
import { Icons } from '../icons.js';
import { openBarcodeModal } from '../components/barcodeGenerator.js';
import { openSizePicker } from './pos.js';

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
      (item.craft || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.colorName || '').toLowerCase().includes(searchQuery.toLowerCase());

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
            ${filtered.length} Products
          </span>
        </div>
        <h1 class="screen-title">Product Inventory</h1>
        <p class="screen-subtitle">SKU matrix, available sizes, stock & barcode printing</p>
      </div>

      ${isAdmin ? `
        <button id="btn-add-sku" class="btn-primary" style="height:38px; padding:0 12px; font-size:12px;">
          ${Icons.plus(16)} Add Product
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
          placeholder="Search by SKU, product name, craft or color..."
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
            <div class="sku-thumbnail" style="background:${item.imageGradient}; ${item.imageDataUrl ? `background-image:url('${item.imageDataUrl}'); background-size:cover; background-position:center;` : ''}">
              <span class="sku-silk-badge">${item.category === 'Innerwear (Bras/Panties/Strips)' ? 'INNERWEAR' : 'GARMENT'}</span>
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

                <div class="sku-product-meta">
                  <span class="color-dot" style="background:${item.colorHex};"></span>
                  <span>${item.colorName}</span>
                  <span style="color:var(--text-muted);">• ${(item.craft || item.subType || '').split('•')[0]}</span>
                </div>

                <!-- Multi-store stock pills for Admin -->
                ${isAdmin ? `
                  <div style="display:flex; gap:4px; margin-top:4px; font-size:10px; font-family:var(--font-mono);">
                    ${State.stores.map(store => `
                      <span style="background:var(--surface-cream); padding:1px 6px; border-radius:4px; border:1px solid var(--surface-border);">
                        ${store.code}: ${item.stockPerStore?.[store.id] ?? 0}
                      </span>
                    `).join('')}
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
                  <span style="font-size:10px; color:var(--text-muted); margin-left:4px;">Sizes: ${(item.availableSizes || item.sizes || [item.size]).join(', ')}</span>
                </div>

                <div style="display:flex; align-items:center; gap:6px;">
                  <!-- Barcode Label Generator Button -->
                  <button class="icon-btn-ghost btn-view-barcode" data-id="${item.id}" title="Generate & Print Barcode Label" style="width:32px; height:32px; color:var(--color-secondary);">
                    ${Icons.barcode(16)}
                  </button>
                  ${isAdmin ? `<button class="icon-btn-ghost btn-edit-product" data-id="${item.id}" title="Edit product" aria-label="Edit product">${Icons.edit(15)}</button>
                    <button class="icon-btn-ghost btn-delete-product" data-id="${item.id}" title="Delete product" style="color:var(--status-outstock);">${Icons.x(14)}</button>` : ''}

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
    const cursor = e.target.selectionStart;
    renderInventory(container);
    const updatedInput = container.querySelector('#inv-search-input');
    updatedInput?.focus();
    updatedInput?.setSelectionRange(cursor, cursor);
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
  container.querySelectorAll('.btn-edit-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = State.products.find(item => item.id === btn.dataset.id);
      if (product) openAddKurtiModal(product);
    });
  });
  container.querySelectorAll('.btn-delete-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = State.products.find(item => item.id === btn.dataset.id);
      if (!product || !window.confirm(`Delete ${product.name} (${product.sku})? Historical bills remain unchanged.`)) return;
      try {
        State.deleteProduct(product.id);
        renderInventory(container);
      } catch (error) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: error.message, type: 'alert' } }));
      }
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
        State.setActiveTab('pos');
        openSizePicker(prod, size => {
          try {
            State.addToActiveBill(prod, size);
          } catch (error) {
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: error.message, type: 'alert' } }));
            return;
          }
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Added ${prod.name} (${size}) to the active bill.`, type: 'success' }
          }));
        });
      }
    });
  });

  // Open Add SKU Modal for Admin
  container.querySelector('#btn-add-sku')?.addEventListener('click', () => {
    openAddKurtiModal();
  });
}

function openAddKurtiModal(product = null) {
  const editing = Boolean(product);
  const availableSizes = product?.availableSizes || product?.sizes || [product?.size].filter(Boolean);
  const currentStore = State.getCurrentStore();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-add-kurti';
  modal.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <h3 class="modal-title">${editing ? 'Edit Product' : 'Register New Product'}</h3>
        <button class="icon-btn-ghost modal-close-btn" style="width:32px; height:32px;">${Icons.x(16)}</button>
      </div>

      <form id="form-new-kurti">
        <div class="form-group">
          <label class="form-label">Product Name</label>
          <input type="text" id="new-krt-name" class="form-control" placeholder="Product name" value="${escapeHtml(product?.name || '')}" required />
        </div>

        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="new-krt-cat" class="form-control">
            ${State.masterData.categories.map(c => `<option value="${escapeHtml(c)}" ${product?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div class="form-group">
            <label class="form-label">Innerwear Type (if applicable)</label>
            <select id="new-krt-subtype" class="form-control">
              <option value="">Not innerwear</option>
              ${State.masterData.innerwearTypes.map(type => `<option value="${type}" ${product?.subType === type ? 'selected' : ''}>${type}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Color / Shade</label>
            <input type="text" id="new-krt-color" class="form-control" placeholder="e.g. Dusty Rose" value="${escapeHtml(product?.colorName || '')}" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Available Sizes (select all that apply)</label>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${State.masterData.sizes.map(size => `
              <label class="filter-pill" style="display:flex; align-items:center; gap:4px;">
                <input type="checkbox" name="new-krt-sizes" value="${escapeHtml(size)}" ${availableSizes.includes(size) ? 'checked' : ''} />
                ${size}
              </label>
            `).join('')}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div class="form-group">
            <label class="form-label">Retail MRP (₹)</label>
            <input type="number" id="new-krt-price" class="form-control" placeholder="3499" value="${product?.price ?? ''}" min="0.01" step="0.01" required />
          </div>

          <div class="form-group">
            <label class="form-label">Initial Stock Units</label>
            <input type="number" id="new-krt-stock" class="form-control" value="${editing ? State.getProductStock(product.id, currentStore.id) : 6}" min="0" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Product Type / Craft</label>
          <input type="text" id="new-krt-craft" class="form-control" placeholder="Optional" value="${escapeHtml(product?.craft || '')}" />
        </div>
        <div class="form-group">
          <label class="form-label">Product image (optional, maximum 1 MB)</label>
          <input type="file" id="new-krt-image" class="form-control" accept="image/*" />
          <small id="product-image-status" style="color:var(--text-muted);">${product?.imageDataUrl ? 'Image saved; select a file to replace it.' : 'No image selected.'}</small>
        </div>

        <div class="form-group">
          <label class="form-label">Maximum allowed discount (%)</label>
          <input type="number" id="new-krt-max-discount" class="form-control" min="0" max="100"
            value="${product?.maxDiscountPercent ?? State.masterData.maxDiscountRules[product?.category || State.masterData.categories[0]] ?? 15}" required />
          <small style="color:var(--text-muted);">The category discount limit is the maximum allowed for this product.</small>
        </div>

        <button type="submit" class="btn-primary btn-full" style="margin-top:10px;">
          ${Icons.barcode(16)} ${editing ? 'Save Product Changes' : 'Save SKU & Generate Barcode Tags'}
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close-btn')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  const categorySelect = modal.querySelector('#new-krt-cat');
  const maxDiscountInput = modal.querySelector('#new-krt-max-discount');
  const imageInput = modal.querySelector('#new-krt-image');
  imageInput.addEventListener('change', () => {
    const file = imageInput.files?.[0];
    const status = modal.querySelector('#product-image-status');
    if (file && file.size > 1024 * 1024) {
      imageInput.value = '';
      status.textContent = 'Image exceeds 1 MB. Choose a smaller image.';
      return;
    }
    status.textContent = file ? `${file.name} selected.` : (product?.imageDataUrl ? 'Image saved; select a file to replace it.' : 'No image selected.');
  });
  categorySelect.addEventListener('change', () => {
    const limit = State.masterData.maxDiscountRules[categorySelect.value] ?? 15;
    maxDiscountInput.max = String(limit);
    maxDiscountInput.value = String(Math.min(Number(maxDiscountInput.value), limit));
  });
  maxDiscountInput.max = String(State.masterData.maxDiscountRules[categorySelect.value] ?? 15);

  modal.querySelector('#form-new-kurti')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = modal.querySelector('#new-krt-name').value;
    const cat = modal.querySelector('#new-krt-cat').value;
    const sizes = Array.from(modal.querySelectorAll('input[name="new-krt-sizes"]:checked')).map(input => input.value);
    if (!sizes.length) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Select at least one available size.', type: 'alert' } }));
      return;
    }
    const size = sizes[0];
    const color = modal.querySelector('#new-krt-color').value;
    const price = Number(modal.querySelector('#new-krt-price').value);
    const stock = parseInt(modal.querySelector('#new-krt-stock').value, 10);
    const craft = modal.querySelector('#new-krt-craft').value;
    const subType = modal.querySelector('#new-krt-subtype').value;
    const categoryMax = State.masterData.maxDiscountRules[cat] ?? 15;
    const maxDiscountPercent = Number(maxDiscountInput.value);
    if (!Number.isFinite(maxDiscountPercent) || maxDiscountPercent < 0 || maxDiscountPercent > categoryMax) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Maximum product discount must be between 0% and ${categoryMax}%.`, type: 'alert' } }));
      return;
    }
    if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Enter a valid price and non-negative whole-number stock.', type: 'alert' } }));
      return;
    }

    const skuCode = product?.sku || `TRG-${cat.includes('Kurti') ? 'KRT' : (cat.includes('Set') ? 'SET' : 'GAR')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const imageFile = imageInput.files?.[0];
    let imageDataUrl = product?.imageDataUrl || '';
    if (imageFile) {
      if (imageFile.size > 1024 * 1024) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Product image must be 1 MB or smaller.', type: 'alert' } }));
        return;
      }
      try {
        imageDataUrl = await readFileAsDataUrl(imageFile);
      } catch (error) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Could not read product image: ${error.message}`, type: 'alert' } }));
        return;
      }
    }

    const productData = {
      name,
      category: cat,
      craft,
      subType: cat === 'Innerwear (Bras/Panties/Strips)' ? subType : craft,
      colorName: color,
      colorHex: '#881337',
      price,
      costPrice: Math.round(price * 0.55),
      size,
      availableSizes: sizes,
      maxDiscountPercent,
      initialStock: stock,
      threshold: 2,
      imageGradient: product?.imageGradient || 'linear-gradient(135deg, #881337 0%, #b45309 100%)',
      ...(imageDataUrl ? { imageDataUrl } : {})
    };
    let created;
    try {
      if (editing) {
        State.updateProduct(product.id, productData);
        State.setStock(product.id, stock, currentStore.id);
        created = State.products.find(item => item.id === product.id);
      } else {
        created = State.addNewProduct({ ...productData, id: skuCode, sku: skuCode });
      }
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: error.message, type: 'alert' } }));
      return;
    }

    modal.remove();
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: editing ? `Updated ${skuCode}.` : `Registered SKU ${skuCode}! Opening barcode tags...`, type: 'success' }
    }));

    renderInventory(document.querySelector('#screen-content') || document.querySelector('main'));
    if (!editing) setTimeout(() => openBarcodeModal(created), 300);
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Unexpected image data.'));
    reader.onerror = () => reject(reader.error || new Error('File reading failed.'));
    reader.readAsDataURL(file);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

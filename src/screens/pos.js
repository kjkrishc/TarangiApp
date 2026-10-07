// Screen: POS billing, concurrent customer bills, returns and exchanges
import { State } from '../state.js';
import { Icons } from '../icons.js';

let selectedPaymentMode = 'UPI';

export function renderPos(container) {
  const currentStore = State.getCurrentStore();
  const bill = State.getActiveBill();
  const items = bill.items;
  const totals = State.calculateBillTotals(bill);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
          <span class="status-pill instock" style="font-size:10px; padding:2px 6px;">${currentStore.name}</span>
          <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">Cashier: ${State.currentUser?.name || 'Staff'}</span>
        </div>
        <h1 class="screen-title">Express POS Register</h1>
        <p class="screen-subtitle">Garment billing • Digital receipt</p>
      </div>
    </div>

    <div class="artisanal-card" style="padding:10px 12px; margin-bottom:12px;">
      <div class="section-label" style="margin-bottom:7px;">Open customer bills</div>
      <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:4px;">
        ${State.openBills.map(openBill => `
          <div style="display:flex; align-items:center; flex-shrink:0; border:1px solid var(--surface-border); border-radius:8px; overflow:hidden;">
            <button class="view-mode-btn bill-tab ${openBill.id === bill.id ? 'active' : ''}" data-bill-id="${openBill.id}">
              ${openBill.title}${openBill.items.length ? ` (${openBill.items.reduce((sum, item) => sum + item.quantity, 0)})` : ''}
            </button>
            <button class="icon-btn-ghost btn-discard-bill" data-bill-id="${openBill.id}" title="Discard this open bill" aria-label="Discard ${openBill.title}" style="height:30px; color:var(--status-outstock);">${Icons.x(13)}</button>
          </div>
        `).join('')}
        <button id="btn-new-bill" class="btn-secondary" style="height:32px; padding:0 10px; flex-shrink:0;">${Icons.plus(14)} New bill</button>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
        <span style="font-size:11px; color:var(--text-muted);">Currently completing: <strong>${bill.title}</strong></span>
        <button id="btn-return-exchange" class="btn-secondary" style="height:32px; padding:0 9px; font-size:11px;">Return / Exchange</button>
      </div>
    </div>

    <div class="artisanal-card accent-rose" style="padding:12px 14px; margin-bottom:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <span style="font-weight:700; font-size:12px; color:var(--color-primary);">${Icons.user(14)} Customer Details</span>
        <span style="font-size:10px; color:var(--text-muted);">Search or enter a new customer</span>
      </div>
      <div style="position:relative; margin-bottom:8px;">
        <div class="search-input-wrap">
          <span class="search-icon">${Icons.phone(14)}</span>
          <input type="text" id="cust-search-input" class="search-input" placeholder="Type customer name or mobile..."
            value="${bill.customer.name || ''}" autocomplete="off" style="height:38px; font-size:12px;" />
        </div>
        <div id="customer-suggestions"></div>
      </div>
      <div style="font-size:10px; color:var(--text-muted); margin:-3px 0 7px;">
        Existing name matches are suggestions only. Enter the new customer’s mobile below to keep same-name customers separate.
      </div>
      <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px;">
        <input type="text" id="cust-new-name" class="form-control" placeholder="Customer name"
          value="${bill.customer.name || ''}" style="height:34px; font-size:11px;" />
        <input type="tel" id="cust-new-phone" class="form-control" placeholder="Mobile (10 digits)" maxlength="10"
          value="${bill.customer.mobile || ''}" style="height:34px; font-size:11px; font-family:var(--font-mono);" />
      </div>
    </div>

    <div class="search-filter-box" style="margin-bottom:12px; position:relative;">
      <div class="search-input-wrap">
        <span class="search-icon">${Icons.search(16)}</span>
        <input id="pos-quick-add-input" type="text" class="search-input" placeholder="Scan or enter product SKU / name..." />
      </div>
      <button id="btn-pos-scanner" class="icon-btn-ghost" title="Scan Barcode" aria-label="Scan barcode">${Icons.camera(18)}</button>
      <div id="pos-product-suggestions" class="pos-product-suggestions"></div>
    </div>

    <div class="section-label">
      <span>Bill items (${itemCount})</span>
      ${items.length ? '<button id="btn-clear-cart" style="background:none; border:none; color:var(--color-primary); font-size:11px; cursor:pointer;">Clear items</button>' : ''}
    </div>
    <div class="pos-cart-list">
      ${items.length ? items.map((item, index) => {
        const categoryLimit = State.masterData.maxDiscountRules[item.product.category] ?? 15;
        const maxDiscount = Math.min(item.product.maxDiscountPercent ?? categoryLimit, categoryLimit);
        return `
          <div class="pos-cart-item" style="align-items:flex-start;">
            <div class="pos-item-info" style="flex:1; min-width:0; padding-right:8px;">
              <div class="pos-item-title">${item.product.name}</div>
              <div class="pos-item-sub">${item.product.sku} • ₹${item.product.price.toLocaleString('en-IN')}</div>
              <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">Size: ${item.size} • ${item.product.category}</div>
              <label style="display:flex; align-items:center; gap:6px; font-size:10px; margin-top:6px;">
                Discount %
                <input class="item-discount-input form-control" type="number" min="0" max="${maxDiscount}" step="0.5"
                  value="${item.discountPercent || 0}" data-index="${index}" style="width:66px; height:28px; padding:2px 5px;" />
                <span>Max ${maxDiscount}%</span>
              </label>
            </div>
            <div class="pos-item-actions">
              <div class="tactile-stepper" style="height:30px;">
                <button class="stepper-btn cart-dec-btn" data-index="${index}" style="width:28px; height:28px;">${Icons.minus(12)}</button>
                <span class="stepper-value" style="font-size:12px; min-width:24px;">${item.quantity}</span>
                <button class="stepper-btn cart-inc-btn" data-index="${index}" style="width:28px; height:28px;">${Icons.plus(12)}</button>
              </div>
              <button class="icon-btn-ghost cart-del-btn" data-index="${index}" style="width:30px; height:30px; color:var(--status-outstock);" title="Remove">${Icons.trash(14)}</button>
            </div>
          </div>
        `;
      }).join('') : `
        <div style="text-align:center; padding:28px 16px; background:var(--surface-cream); border:1px dashed var(--surface-border); border-radius:12px; color:var(--text-muted);">
          <div style="margin-bottom:8px; color:var(--color-secondary);">${Icons.shoppingBag(32)}</div>
          <p style="font-family:var(--font-serif); font-size:15px; color:var(--text-main); margin-bottom:4px;">This bill is empty</p>
          <p style="font-size:12px; margin-bottom:12px;">Find a product by SKU or browse inventory.</p>
          <button id="btn-empty-browse-inv" class="btn-secondary" style="font-size:12px;">Browse inventory →</button>
        </div>
      `}
    </div>

    ${items.length ? `
      <div class="pos-summary-card">
        <div class="summary-row"><span>Subtotal (${itemCount} pieces)</span><span>₹${totals.subtotalMrp.toLocaleString('en-IN')}</span></div>
        ${totals.totalDiscountAmount ? `<div class="summary-row" style="color:var(--color-tertiary-dark);"><span>Item discounts</span><span>-₹${totals.totalDiscountAmount.toLocaleString('en-IN')}</span></div>` : ''}
        <div class="summary-row"><span>Taxable value (GST included in MRP)</span><span>₹${totals.taxableValue.toLocaleString('en-IN')}</span></div>
        <div class="summary-row" style="font-size:11px; color:var(--text-muted);"><span>CGST included (2.5%)</span><span>₹${totals.cgst.toLocaleString('en-IN')}</span></div>
        <div class="summary-row" style="font-size:11px; color:var(--text-muted);"><span>SGST included (2.5%)</span><span>₹${totals.sgst.toLocaleString('en-IN')}</span></div>
        <div class="summary-row total-row"><span>Total payable</span><span style="font-size:19px;">₹${totals.netFinalPayable.toLocaleString('en-IN')}</span></div>
      </div>

      <div style="margin-bottom:14px;">
        <div class="section-label" style="font-size:13px; margin-bottom:6px;">Select payment mode</div>
        <div class="payment-modes-grid">
          <div class="payment-mode-card ${selectedPaymentMode === 'UPI' ? 'active' : ''}" data-mode="UPI"><span>📲</span><span>UPI / QR</span></div>
          <div class="payment-mode-card ${selectedPaymentMode === 'Card' ? 'active' : ''}" data-mode="Card"><span>💳</span><span>Card POS</span></div>
          <div class="payment-mode-card ${selectedPaymentMode === 'Cash' ? 'active' : ''}" data-mode="Cash"><span>💵</span><span>Cash</span></div>
        </div>
      </div>
      <button id="btn-complete-sale" class="btn-primary btn-full" style="height:48px; font-size:15px;">
        ${Icons.check(18)} Complete ${bill.title} • ₹${totals.netFinalPayable.toLocaleString('en-IN')}
      </button>
    ` : ''}
  `;

  const refreshCustomerSuggestions = query => {
    const suggestions = container.querySelector('#customer-suggestions');
    const normalizedQuery = query.trim().toLowerCase();
    const matches = normalizedQuery.length >= 2 ? State.searchCustomers(query).slice(0, 8) : [];
    if (!suggestions) return;
    suggestions.innerHTML = matches.length ? `
      <div class="customer-autocomplete-popover">
        ${matches.map(customer => `
          <button type="button" class="cust-suggest-item interactive-tap" data-id="${customer.id}" style="width:100%; border:0; text-align:left; background:transparent;">
            <span><strong>${customer.name}</strong><br/><small>${customer.mobile}</small></span>
            <span style="font-size:10px;">${customer.visits || 0} visits</span>
          </button>
        `).join('')}
      </div>
    ` : '';
    suggestions.querySelectorAll('.cust-suggest-item').forEach(button => {
      button.addEventListener('click', () => {
        const customer = State.customers.find(entry => entry.id === button.dataset.id);
        if (!customer) return;
        State.setCustomerForActiveBill(customer.name, customer.mobile);
        renderPos(container);
      });
    });
  };

  const searchInput = container.querySelector('#cust-search-input');
  searchInput?.addEventListener('input', event => refreshCustomerSuggestions(event.currentTarget.value));
  refreshCustomerSuggestions(searchInput?.value || '');

  const saveBillCustomer = (shouldNotify = true) => {
    State.setCustomerForActiveBill(
      container.querySelector('#cust-new-name')?.value || '',
      container.querySelector('#cust-new-phone')?.value || '',
      shouldNotify
    );
  };
  container.querySelector('#cust-new-name')?.addEventListener('change', () => saveBillCustomer(false));
  container.querySelector('#cust-new-phone')?.addEventListener('change', () => saveBillCustomer(false));

  container.querySelector('#btn-pos-scanner')?.addEventListener('click', () => window.dispatchEvent(new CustomEvent('open-barcode-scanner')));
  container.querySelector('#btn-empty-browse-inv')?.addEventListener('click', () => State.setActiveTab('inventory'));
  container.querySelector('#btn-new-bill')?.addEventListener('click', () => State.createNewBillTab());
  container.querySelectorAll('.bill-tab').forEach(button => {
    button.addEventListener('click', () => State.switchBillTab(button.dataset.billId));
  });
  container.querySelectorAll('.btn-discard-bill').forEach(button => {
    button.addEventListener('click', () => {
      const target = State.openBills.find(entry => entry.id === button.dataset.billId);
      if (!target || !window.confirm(`Discard ${target.title} and all its unsaved items? This cannot be undone.`)) return;
      State.discardBillTab(target.id);
    });
  });
  container.querySelector('#btn-return-exchange')?.addEventListener('click', openReturnsModal);
  container.querySelector('#btn-pos-scanner')?.addEventListener('click', () => window.dispatchEvent(new CustomEvent('open-barcode-scanner')));

  const addProductToBill = product => {
    const stock = State.getProductStock(product.id, currentStore.id);
    if (stock <= 0) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${product.sku} is out of stock at ${currentStore.code}.`, type: 'alert' } }));
      return;
    }
    openSizePicker(product, size => {
      try {
        State.addToActiveBill(product, size);
      } catch (error) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: error.message, type: 'alert' } }));
      }
    });
  };

  const quickInput = container.querySelector('#pos-quick-add-input');
  const suggestionContainer = container.querySelector('#pos-product-suggestions');
  const renderSuggestions = () => {
    const query = quickInput?.value.trim().toLowerCase() || '';
    const matches = query.length < 2 ? [] : State.products.filter(item =>
      item.sku.toLowerCase().includes(query) || item.name.toLowerCase().includes(query)
    ).slice(0, 8);
    suggestionContainer.innerHTML = matches.map(item => `
      <button type="button" class="pos-product-suggestion" data-product-id="${item.id}" style="display:flex; width:100%; justify-content:space-between; padding:8px 10px; border:1px solid var(--surface-border); background:var(--surface-card); color:var(--text-main);">
        <span>${item.name} <small>${item.sku}</small></span><strong>₹${Number(item.price).toLocaleString('en-IN')}</strong>
      </button>
    `).join('');
    suggestionContainer.querySelectorAll('.pos-product-suggestion').forEach(button => {
      button.addEventListener('click', () => {
        const product = State.products.find(item => item.id === button.dataset.productId);
        if (product) addProductToBill(product);
        quickInput.value = '';
        suggestionContainer.innerHTML = '';
      });
    });
  };
  const addFromSearch = () => {
    const query = quickInput?.value.trim().toLowerCase();
    if (!query) return;
    const product = State.products.find(entry => entry.sku.toLowerCase().includes(query) || entry.name.toLowerCase().includes(query));
    if (!product) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `No product found matching '${query}'.`, type: 'alert' } }));
      return;
    }
    if (quickInput) quickInput.value = '';
    if (suggestionContainer) suggestionContainer.innerHTML = '';
    addProductToBill(product);
  };
  quickInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') addFromSearch();
  });
  quickInput?.addEventListener('input', renderSuggestions);

  container.querySelectorAll('.cart-dec-btn, .cart-inc-btn').forEach(button => {
    button.addEventListener('click', () => State.updateItemQuantity(Number(button.dataset.index), button.classList.contains('cart-inc-btn') ? 1 : -1));
  });
  container.querySelectorAll('.cart-del-btn').forEach(button => {
    button.addEventListener('click', () => State.removeItemFromActiveBill(Number(button.dataset.index)));
  });
  container.querySelectorAll('.item-discount-input').forEach(input => {
    input.addEventListener('change', () => {
      const actual = State.updateItemDiscount(Number(input.dataset.index), input.value);
      if (actual !== Number(input.value)) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Discount capped at ${input.max}%.`, type: 'alert' } }));
      }
    });
  });
  container.querySelector('#btn-clear-cart')?.addEventListener('click', () => {
    items.splice(0, items.length);
    State.notify();
  });
  container.querySelectorAll('.payment-mode-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedPaymentMode = card.dataset.mode;
      renderPos(container);
    });
  });

  container.querySelector('#btn-complete-sale')?.addEventListener('click', () => {
    const name = container.querySelector('#cust-new-name')?.value.trim() || '';
    const mobile = (container.querySelector('#cust-new-phone')?.value || '').replace(/\D/g, '');
    if (!name) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Enter the customer name before completing this bill.', type: 'alert' } }));
      container.querySelector('#cust-new-name')?.focus();
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Enter a valid 10-digit mobile number before completing this bill.', type: 'alert' } }));
      container.querySelector('#cust-new-phone')?.focus();
      return;
    }
    saveBillCustomer();
    const completeCheckout = () => {
      try {
        const completedBill = State.completeActiveBill(selectedPaymentMode);
        if (completedBill) window.dispatchEvent(new CustomEvent('show-receipt-modal', { detail: { bill: completedBill } }));
      } catch (error) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: error.message, type: 'alert' } }));
      }
    };
    if (selectedPaymentMode === 'UPI') {
      openUpiSimulationModal(totals.netFinalPayable, currentStore.name, completeCheckout);
    } else {
      completeCheckout();
    }
  });
}

export function openSizePicker(product, onSelect) {
  const sizes = product.availableSizes || product.sizes || [product.size].filter(Boolean);
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <h3 class="modal-title">Choose size</h3>
        <button class="icon-btn-ghost modal-close-btn" style="width:32px; height:32px;">${Icons.x(16)}</button>
      </div>
      <p style="font-size:12px; margin-bottom:12px;">${product.name}</p>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        ${sizes.map(size => `<button class="btn-secondary size-choice" data-size="${size}" style="min-width:70px;">${size}</button>`).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('.modal-close-btn')?.addEventListener('click', close);
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  modal.querySelectorAll('.size-choice').forEach(button => {
    button.addEventListener('click', () => {
      onSelect(button.dataset.size);
      close();
    });
  });
}

function openReturnsModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-return-exchange';
  modal.innerHTML = `
    <div class="modal-sheet" style="max-height:90vh;">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <h3 class="modal-title">Return / Exchange</h3>
        <button class="icon-btn-ghost modal-close-btn" style="width:32px; height:32px;">${Icons.x(16)}</button>
      </div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">Search by customer name or phone to find the original invoice.</p>
      <input id="return-customer-search" class="form-control" placeholder="Customer name or mobile" autocomplete="off" />
      <div id="return-bill-results" style="margin-top:8px;"></div>
      <div id="return-bill-details" style="margin-top:10px;"></div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('.modal-close-btn')?.addEventListener('click', close);
  modal.addEventListener('click', event => { if (event.target === modal) close(); });

  const searchInput = modal.querySelector('#return-customer-search');
  const results = modal.querySelector('#return-bill-results');
  const details = modal.querySelector('#return-bill-details');
  let selectedBill = null;
  const renderBillResults = query => {
    const normalized = query.trim().toLowerCase();
    const normalizedPhone = normalized.replace(/\D/g, '');
    const matchingBills = normalized.length < 2 ? [] : State.recentBills.filter(bill => bill.billType !== 'return-exchange' && (
      (bill.customerName || bill.customer || '').toLowerCase().includes(normalized) ||
      (normalizedPhone.length >= 2 && (bill.customerMobile || '').replace(/\D/g, '').includes(normalizedPhone))
    ));
    results.innerHTML = matchingBills.length ? matchingBills.map(bill => `
      <button class="return-bill-choice btn-secondary" data-bill-id="${bill.id}" style="display:flex; justify-content:space-between; width:100%; height:auto; padding:8px; margin-bottom:5px; text-align:left;">
        <span>${bill.customerName || bill.customer} • ${bill.customerMobile || 'No phone'}<br/><small>${bill.billNumber || bill.id} • ${bill.date || ''}</small></span>
        <strong>₹${Number(bill.total || 0).toLocaleString('en-IN')}</strong>
      </button>
    `).join('') : normalized.length >= 2 ? '<p style="font-size:12px; color:var(--text-muted);">No matching invoices found.</p>' : '';
    results.querySelectorAll('.return-bill-choice').forEach(button => {
      button.addEventListener('click', () => {
        selectedBill = State.recentBills.find(bill => bill.id === button.dataset.billId);
        renderSelectedBill();
      });
    });
  };
  searchInput.addEventListener('input', () => {
    selectedBill = null;
    details.innerHTML = '';
    renderBillResults(searchInput.value);
  });

  const renderSelectedBill = () => {
    if (!selectedBill) return;
    const returnedAlready = State.returns
      .filter(record => record.originalBillNumber === (selectedBill.billNumber || selectedBill.id))
      .flatMap(record => record.returnedItems)
      .reduce((quantities, item) => {
        const key = `${item.product.id}:${item.size}`;
        quantities[key] = (quantities[key] || 0) + item.quantity;
        return quantities;
      }, {});
    const originalProductIds = new Set(selectedBill.items.map(item => item.product.id));
    details.innerHTML = `
      <div class="section-label">Items on ${selectedBill.billNumber || selectedBill.id}</div>
      ${selectedBill.items.map((item, index) => {
        const returnable = Math.max(0, item.quantity - (returnedAlready[`${item.product.id}:${item.size}`] || 0));
        return `
          <label style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 0; border-bottom:1px dashed var(--surface-border); font-size:11px;">
            <span>${item.product.name} (${item.size})<br/>Purchased: ${item.quantity} • Returnable: ${returnable}</span>
            <input class="return-quantity" data-index="${index}" type="number" min="0" max="${returnable}" value="0" style="width:64px;" />
          </label>
        `;
      }).join('')}
      <div class="form-group" style="margin-top:10px;">
        <label class="form-label">Exchange for (optional)</label>
        <select id="exchange-product" class="form-control">
          <option value="">Refund only — no exchange item</option>
          ${State.products.filter(product =>
            State.getProductStock(product.id, selectedBill.storeId || State.getCurrentStore().id) > 0 ||
            originalProductIds.has(product.id)
          ).map(product => `<option value="${product.id}">${product.name} — ₹${product.price}</option>`).join('')}
        </select>
      </div>
      <div id="exchange-size-wrap" style="display:none; margin-bottom:10px;">
        <label class="form-label">Exchange size</label>
        <select id="exchange-size" class="form-control"></select>
      </div>
      <div class="form-group">
        <label class="form-label">Exchange item discount % (within product/category limit)</label>
        <input id="exchange-discount" class="form-control" type="number" min="0" max="0" step="0.5" value="0" disabled />
      </div>
      <button id="btn-submit-return" class="btn-primary btn-full">Process return / exchange</button>
    `;
    const exchangeSelect = details.querySelector('#exchange-product');
    exchangeSelect.addEventListener('change', () => {
      const product = State.products.find(entry => entry.id === exchangeSelect.value);
      const wrap = details.querySelector('#exchange-size-wrap');
      const sizeSelect = details.querySelector('#exchange-size');
      if (!product) {
        wrap.style.display = 'none';
        details.querySelector('#exchange-discount').value = '0';
        details.querySelector('#exchange-discount').max = '0';
        details.querySelector('#exchange-discount').disabled = true;
        return;
      }
      const categoryLimit = State.masterData.maxDiscountRules[product.category] ?? 15;
      const discountLimit = Math.min(product.maxDiscountPercent ?? categoryLimit, categoryLimit);
      const discountInput = details.querySelector('#exchange-discount');
      discountInput.disabled = false;
      discountInput.max = String(discountLimit);
      discountInput.value = '0';
      const availableSizes = product.availableSizes || product.sizes || [product.size].filter(Boolean);
      sizeSelect.innerHTML = availableSizes.map(size => `<option value="${size}">${size}</option>`).join('');
      wrap.style.display = '';
    });
    details.querySelector('#btn-submit-return').addEventListener('click', () => {
      const returnedItems = Array.from(details.querySelectorAll('.return-quantity'))
        .map(input => ({ ...selectedBill.items[Number(input.dataset.index)], quantity: Number(input.value) || 0 }))
        .filter(item => item.quantity > 0);
      if (!returnedItems.length) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Enter a return quantity for at least one item.', type: 'alert' } }));
        return;
      }
      const exchangedProduct = State.products.find(product => product.id === exchangeSelect.value);
      const exchangeSize = details.querySelector('#exchange-size')?.value;
      const discountInput = details.querySelector('#exchange-discount');
      const exchangeDiscountPercent = Number(discountInput.value) || 0;
      if (exchangedProduct && (exchangeDiscountPercent < 0 || exchangeDiscountPercent > Number(discountInput.max))) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Exchange discount cannot exceed ${discountInput.max}%.`, type: 'alert' } }));
        return;
      }
      const newItems = exchangedProduct ? [{
        product: exchangedProduct,
        size: exchangeSize,
        quantity: 1,
        discountPercent: exchangeDiscountPercent
      }] : [];
      const returnCreditAmount = returnedItems.reduce((sum, item) => {
        return sum + Math.round(item.product.price * item.quantity * (1 - (item.discountPercent || 0) / 100));
      }, 0);
      const exchangeSubtotal = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const exchangeAmount = newItems.reduce((sum, item) => sum + Math.round(item.product.price * item.quantity * (1 - item.discountPercent / 100)), 0);
      let record;
      try {
        record = State.processReturnOrExchange({
          originalBill: selectedBill,
          returnedItems,
          newItems,
          customerName: selectedBill.customerName || selectedBill.customer,
          customerMobile: selectedBill.customerMobile,
          returnCreditAmount,
          exchangeSubtotal,
          exchangeDiscountAmount: exchangeSubtotal - exchangeAmount,
          exchangeAmount,
          netPayableOrRefund: exchangeAmount - returnCreditAmount
        });
      } catch (error) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: error.message, type: 'alert' } }));
        return;
      }
      close();
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${record.id} processed. ${exchangeAmount > returnCreditAmount ? 'Collect' : 'Refund'} ₹${Math.abs(exchangeAmount - returnCreditAmount).toLocaleString('en-IN')}.`, type: 'success' } }));
      window.dispatchEvent(new CustomEvent('show-receipt-modal', { detail: { bill: record.returnBill } }));
    });
  };
}

function openUpiSimulationModal(amount, storeName, onPaid) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-sheet" style="text-align:center;">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <h3 class="modal-title" style="margin:0 auto;">UPI Payment</h3>
        <button class="icon-btn-ghost modal-close-btn" style="width:32px; height:32px;">${Icons.x(16)}</button>
      </div>
      <div style="margin:16px 0;">
        <div style="font-family:var(--font-serif); font-size:15px; color:var(--color-primary); font-weight:600;">TARANGI • ${storeName.toUpperCase()}</div>
        <div style="font-family:var(--font-mono); font-size:24px; font-weight:700; margin:4px 0;">₹${amount.toLocaleString('en-IN')}</div>
        <div style="font-size:11px; color:var(--text-muted);">Scan via GPay, PhonePe, Paytm or BHIM UPI</div>
      </div>
      <button id="btn-simulate-upi-success" class="btn-primary btn-full" style="height:44px;">${Icons.check(16)} Simulate payment received</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.modal-close-btn')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', event => { if (event.target === modal) modal.remove(); });
  modal.querySelector('#btn-simulate-upi-success')?.addEventListener('click', () => {
    modal.remove();
    onPaid();
  });
}

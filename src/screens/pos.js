// Screen: POS & Billing with Dynamic Customer Capture & Autocomplete
import { State } from '../state.js';
import { Icons } from '../icons.js';

let selectedPaymentMode = 'UPI';
let customerSearchQuery = '';
let selectedCustomerObj = null;

export function renderPos(container) {
  const currentStore = State.getCurrentStore();
  const subtotal = State.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = Math.round(subtotal * (State.discountPercent / 100));
  const taxable = subtotal - discountAmount;
  const cgst = Math.round(taxable * 0.025);
  const sgst = Math.round(taxable * 0.025);
  const grandTotal = taxable + cgst + sgst;

  // Matching customers for autocomplete
  const matchedCustomers = customerSearchQuery.trim().length >= 2 ? State.searchCustomers(customerSearchQuery) : [];

  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
          <span class="status-pill instock" style="font-size:10px; padding:2px 6px;">
            ${currentStore.name}
          </span>
          <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">
            Cashier: ${State.currentUser.name}
          </span>
        </div>
        <h1 class="screen-title">Express POS Register</h1>
        <p class="screen-subtitle">Instant Kurti & Garment Billing • Digital Receipt</p>
      </div>
      <button id="btn-pos-scanner" class="icon-btn-ghost" title="Scan Barcode">
        ${Icons.camera(18)}
      </button>
    </div>

    <!-- Customer Information Capture & Dynamic Search Card -->
    <div class="artisanal-card accent-rose" style="padding:12px 14px; margin-bottom:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <span style="font-weight:700; font-size:12px; color:var(--color-primary); display:flex; align-items:center; gap:5px;">
          ${Icons.user(14)} Customer Details
        </span>
        ${selectedCustomerObj ? `
          <button id="btn-clear-customer" style="background:none; border:none; color:var(--text-muted); font-size:11px; cursor:pointer;">
            Clear / New
          </button>
        ` : `
          <span style="font-size:10px; color:var(--text-muted);">Search by Name / Mobile</span>
        `}
      </div>

      <!-- Live Search / Phone Autocomplete Input -->
      <div style="position:relative; margin-bottom:8px;">
        <div class="search-input-wrap">
          <span class="search-icon">${Icons.phone(14)}</span>
          <input 
            type="text" 
            id="cust-search-input" 
            class="search-input" 
            placeholder="Type 10-digit mobile or customer name..." 
            value="${selectedCustomerObj ? `${selectedCustomerObj.name} (${selectedCustomerObj.mobile})` : customerSearchQuery}"
            autocomplete="off"
            style="height:38px; font-size:12px;"
          />
        </div>

        <!-- Autocomplete Suggestions Dropdown -->
        ${matchedCustomers.length > 0 && !selectedCustomerObj ? `
          <div class="customer-autocomplete-popover">
            ${matchedCustomers.map(c => `
              <div class="cust-suggest-item interactive-tap" data-id="${c.id}">
                <div>
                  <div style="font-weight:700; font-size:12px; color:var(--text-main);">${c.name}</div>
                  <div style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">${c.mobile}</div>
                </div>
                <div style="text-align:right;">
                  <span class="status-pill instock" style="font-size:9px;">${c.visits} visits</span>
                  <div style="font-size:10px; color:var(--color-primary); font-family:var(--font-mono); font-weight:600;">
                    ₹${c.totalSpent.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Quick Fields if New Customer -->
      ${!selectedCustomerObj ? `
        <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px;">
          <input 
            type="text" 
            id="cust-new-name" 
            class="form-control" 
            placeholder="Customer Name (e.g. Radhika)" 
            style="height:34px; font-size:11px;"
          />
          <input 
            type="tel" 
            id="cust-new-phone" 
            class="form-control" 
            placeholder="Mobile (10 Digits)" 
            maxlength="10"
            style="height:34px; font-size:11px; font-family:var(--font-mono);"
          />
        </div>
      ` : `
        <div style="background:var(--surface-cream); border-radius:6px; padding:6px 10px; font-size:11px; display:flex; justify-content:space-between; align-items:center;">
          <span>✅ Returning Client: <strong>${selectedCustomerObj.name}</strong></span>
          <span style="font-family:var(--font-mono); color:var(--color-secondary);">Total Spend: ₹${selectedCustomerObj.totalSpent.toLocaleString('en-IN')}</span>
        </div>
      `}
    </div>

    <!-- Quick SKU / Kurti Search Bar -->
    <div class="search-filter-box" style="margin-bottom:12px;">
      <div class="search-input-wrap">
        <span class="search-icon">${Icons.search(16)}</span>
        <input 
          id="pos-quick-add-input" 
          type="text" 
          class="search-input" 
          placeholder="Scan or enter Kurti SKU (e.g. TRG-KRT-1011)..." 
        />
      </div>
      <button id="btn-pos-add-manual" class="btn-secondary" style="height:42px;">
        ${Icons.plus(16)} Add
      </button>
    </div>

    <!-- Active Cart Items -->
    <div class="section-label">
      <span>Cart Line Items (${State.cart.reduce((s, i) => s + i.quantity, 0)})</span>
      ${State.cart.length > 0 ? `
        <button id="btn-clear-cart" style="background:none; border:none; color:var(--color-primary); font-size:11px; cursor:pointer;">
          Clear All
        </button>
      ` : ''}
    </div>

    <div class="pos-cart-list">
      ${State.cart.length === 0 ? `
        <div style="text-align:center; padding:32px 16px; background:var(--surface-cream); border:1px dashed var(--surface-border); border-radius:12px; color:var(--text-muted);">
          <div style="margin-bottom:8px; color:var(--color-secondary);">${Icons.shoppingBag(32)}</div>
          <p style="font-family:var(--font-serif); font-size:15px; color:var(--text-main); margin-bottom:4px;">Billing Cart is Empty</p>
          <p style="font-size:12px; margin-bottom:12px;">Scan garment barcode tag or search SKU to add items.</p>
          <button id="btn-empty-browse-inv" class="btn-secondary" style="font-size:12px;">
            Browse Kurti Stock →
          </button>
        </div>
      ` : State.cart.map((item, idx) => `
        <div class="pos-cart-item">
          <div class="pos-item-info" style="flex:1; min-width:0; padding-right:8px;">
            <div class="pos-item-title" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${item.product.name}
            </div>
            <div class="pos-item-sub">
              ${item.product.sku} • <span style="color:var(--color-primary); font-weight:600;">₹${item.product.price.toLocaleString('en-IN')}</span>
            </div>
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">
              Size: ${item.size} • ${item.product.fabric || 'Cotton'}
            </div>
          </div>

          <div class="pos-item-actions">
            <!-- Stepper -->
            <div class="tactile-stepper" style="height:30px;">
              <button class="stepper-btn cart-dec-btn" data-index="${idx}" style="width:28px; height:28px;">
                ${Icons.minus(12)}
              </button>
              <span class="stepper-value" style="font-size:12px; min-width:24px;">${item.quantity}</span>
              <button class="stepper-btn cart-inc-btn" data-index="${idx}" style="width:28px; height:28px;">
                ${Icons.plus(12)}
              </button>
            </div>

            <!-- Remove -->
            <button class="icon-btn-ghost cart-del-btn" data-index="${idx}" style="width:30px; height:30px; color:var(--status-outstock);" title="Remove">
              ${Icons.trash(14)}
            </button>
          </div>
        </div>
      `).join('')}
    </div>

    ${State.cart.length > 0 ? `
      <!-- Coupon Strip -->
      <div class="artisanal-card" style="padding:10px 14px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="color:var(--color-tertiary);">${Icons.tag(16)}</span>
          <input 
            type="text" 
            id="coupon-input" 
            placeholder="Coupon (TARANGI10, KURTI15)" 
            value="${State.discountCode}"
            style="flex:1; height:34px; border:1px solid var(--surface-border); border-radius:6px; padding:0 8px; font-family:var(--font-mono); font-size:12px; text-transform:uppercase;"
          />
          ${State.discountCode ? `
            <button id="btn-remove-discount" class="btn-secondary" style="height:34px; padding:0 10px; font-size:11px; color:var(--status-outstock);">
              Remove
            </button>
          ` : `
            <button id="btn-apply-discount" class="btn-zari" style="height:34px; padding:0 12px; font-size:11px;">
              Apply
            </button>
          `}
        </div>

        ${State.discountCode ? `
          <div style="margin-top:6px; font-size:11px; color:var(--color-tertiary-dark); font-weight:600;">
            ✓ ${State.discountCode} applied: -${State.discountPercent}% off subtotal
          </div>
        ` : ''}
      </div>

      <!-- Financial Summary & Tax Breakdown -->
      <div class="pos-summary-card">
        <div class="summary-row">
          <span>Subtotal (${State.cart.reduce((s, i) => s + i.quantity, 0)} pieces)</span>
          <span style="font-family:var(--font-mono); font-weight:600;">₹${subtotal.toLocaleString('en-IN')}</span>
        </div>

        ${discountAmount > 0 ? `
          <div class="summary-row" style="color:var(--color-tertiary-dark); font-weight:600;">
            <span>Discount (${State.discountPercent}%)</span>
            <span style="font-family:var(--font-mono);">-₹${discountAmount.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}

        <div class="summary-row">
          <span>Taxable Value</span>
          <span style="font-family:var(--font-mono);">₹${taxable.toLocaleString('en-IN')}</span>
        </div>

        <div class="summary-row" style="font-size:11px; color:var(--text-muted);">
          <span>Garment CGST (2.5%)</span>
          <span style="font-family:var(--font-mono);">+₹${cgst.toLocaleString('en-IN')}</span>
        </div>

        <div class="summary-row" style="font-size:11px; color:var(--text-muted);">
          <span>Garment SGST (2.5%)</span>
          <span style="font-family:var(--font-mono);">+₹${sgst.toLocaleString('en-IN')}</span>
        </div>

        <div class="summary-row total-row">
          <span>Net Bill Payable</span>
          <span style="font-size:19px; font-family:var(--font-mono);">₹${grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- Payment Mode Selection -->
      <div style="margin-bottom:14px;">
        <div class="section-label" style="font-size:13px; margin-bottom:6px;">Select Payment Mode</div>
        <div class="payment-modes-grid">
          <div class="payment-mode-card ${selectedPaymentMode === 'UPI' ? 'active' : ''}" data-mode="UPI">
            <span style="font-size:16px;">📲</span>
            <span>UPI / QR</span>
          </div>

          <div class="payment-mode-card ${selectedPaymentMode === 'Card' ? 'active' : ''}" data-mode="Card">
            <span style="font-size:16px;">💳</span>
            <span>Card POS</span>
          </div>

          <div class="payment-mode-card ${selectedPaymentMode === 'Cash' ? 'active' : ''}" data-mode="Cash">
            <span style="font-size:16px;">💵</span>
            <span>Cash</span>
          </div>
        </div>
      </div>

      <!-- Action: Complete Sale Button -->
      <button id="btn-complete-sale" class="btn-primary btn-full" style="height:48px; font-size:15px; letter-spacing:0.02em;">
        ${Icons.check(18)} Complete Bill • ₹${grandTotal.toLocaleString('en-IN')}
      </button>
    ` : ''}
  `;

  // Bind Events
  container.querySelector('#btn-pos-scanner')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-barcode-scanner'));
  });

  container.querySelector('#btn-empty-browse-inv')?.addEventListener('click', () => {
    State.setActiveTab('inventory');
  });

  // Customer Autocomplete input
  const custInput = container.querySelector('#cust-search-input');
  custInput?.addEventListener('input', (e) => {
    customerSearchQuery = e.target.value;
    selectedCustomerObj = null;
    renderPos(container);
  });

  // Autocomplete selection
  container.querySelectorAll('.cust-suggest-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const found = State.customers.find(c => c.id === id);
      if (found) {
        selectedCustomerObj = found;
        customerSearchQuery = '';
        renderPos(container);
      }
    });
  });

  container.querySelector('#btn-clear-customer')?.addEventListener('click', () => {
    selectedCustomerObj = null;
    customerSearchQuery = '';
    renderPos(container);
  });

  // Manual Quick Add SKU
  const quickInput = container.querySelector('#pos-quick-add-input');
  container.querySelector('#btn-pos-add-manual')?.addEventListener('click', () => {
    const val = quickInput.value.trim().toLowerCase();
    if (!val) return;
    const prod = State.products.find(p => p.sku.toLowerCase().includes(val) || p.name.toLowerCase().includes(val));
    if (prod) {
      State.addToCart(prod);
      quickInput.value = '';
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Added ${prod.name} to cart!`, type: 'success' }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `No kurti found matching '${val}'`, type: 'alert' }
      }));
    }
  });

  // Cart actions
  container.querySelectorAll('.cart-dec-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      State.updateCartQuantity(idx, -1);
      renderPos(container);
    });
  });

  container.querySelectorAll('.cart-inc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      State.updateCartQuantity(idx, 1);
      renderPos(container);
    });
  });

  container.querySelectorAll('.cart-del-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      State.removeFromCart(idx);
      renderPos(container);
    });
  });

  container.querySelector('#btn-clear-cart')?.addEventListener('click', () => {
    State.clearCart();
    renderPos(container);
  });

  // Discounts
  container.querySelector('#btn-apply-discount')?.addEventListener('click', () => {
    const code = container.querySelector('#coupon-input')?.value || '';
    const res = State.applyDiscount(code);
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: res.message, type: res.success ? 'success' : 'alert' }
    }));
    renderPos(container);
  });

  container.querySelector('#btn-remove-discount')?.addEventListener('click', () => {
    State.removeDiscount();
    renderPos(container);
  });

  // Payment Mode
  container.querySelectorAll('.payment-mode-card').forEach(card => {
    card.addEventListener('click', (e) => {
      selectedPaymentMode = e.currentTarget.dataset.mode;
      renderPos(container);
    });
  });

  // Complete Sale
  container.querySelector('#btn-complete-sale')?.addEventListener('click', () => {
    // Gather customer info
    let custName = 'Walk-in Client';
    let custMobile = '9800000000';

    if (selectedCustomerObj) {
      custName = selectedCustomerObj.name;
      custMobile = selectedCustomerObj.mobile;
    } else {
      const nameInput = container.querySelector('#cust-new-name')?.value.trim();
      const phoneInput = container.querySelector('#cust-new-phone')?.value.trim();
      if (nameInput) custName = nameInput;
      if (phoneInput) custMobile = phoneInput;
    }

    const customerPayload = { name: custName, mobile: custMobile };

    const completeCheckout = () => {
      const completedBill = State.completeBill(customerPayload, selectedPaymentMode);
      if (completedBill) {
        selectedCustomerObj = null;
        customerSearchQuery = '';
        window.dispatchEvent(new CustomEvent('show-receipt-modal', { detail: { bill: completedBill } }));
      }
    };

    if (selectedPaymentMode === 'UPI') {
      openUpiSimulationModal(grandTotal, currentStore.name, completeCheckout);
    } else {
      completeCheckout();
    }
  });
}

function openUpiSimulationModal(amount, storeName, onPaid) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-sheet" style="text-align:center;">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <h3 class="modal-title" style="margin:0 auto;">UPI Dynamic QR Payment</h3>
        <button class="icon-btn-ghost modal-close-btn" style="width:32px; height:32px;">${Icons.x(16)}</button>
      </div>

      <div style="margin:16px 0;">
        <div style="font-family:var(--font-serif); font-size:15px; color:var(--color-primary); font-weight:600;">
          TARANGI • ${storeName.toUpperCase()}
        </div>
        <div style="font-family:var(--font-mono); font-size:24px; font-weight:700; color:var(--text-main); margin:4px 0;">
          ₹${amount.toLocaleString('en-IN')}
        </div>
        <div style="font-size:11px; color:var(--text-muted);">Scan via GPay, PhonePe, Paytm or BHIM UPI</div>
      </div>

      <div style="width:190px; height:190px; margin:0 auto 16px auto; background:#fff; border:2px solid var(--color-primary); border-radius:12px; padding:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:var(--shadow-md);">
        <svg width="150" height="150" viewBox="0 0 100 100" fill="#1e1b19">
          <rect x="5" y="5" width="25" height="25" fill="#881337"/>
          <rect x="9" y="9" width="17" height="17" fill="#fff"/>
          <rect x="13" y="13" width="9" height="9" fill="#881337"/>
          <rect x="70" y="5" width="25" height="25" fill="#881337"/>
          <rect x="74" y="9" width="17" height="17" fill="#fff"/>
          <rect x="78" y="13" width="9" height="9" fill="#881337"/>
          <rect x="5" y="70" width="25" height="25" fill="#881337"/>
          <rect x="9" y="74" width="17" height="17" fill="#fff"/>
          <rect x="13" y="78" width="9" height="9" fill="#881337"/>
          <rect x="36" y="10" width="8" height="8"/>
          <rect x="50" y="8" width="12" height="10"/>
          <rect x="38" y="38" width="24" height="24" fill="#b45309"/>
          <circle cx="50" cy="50" r="6" fill="#fff"/>
          <rect x="10" y="40" width="10" height="20"/>
          <rect x="72" y="42" width="18" height="12"/>
          <rect x="40" y="72" width="12" height="18"/>
          <rect x="65" y="75" width="25" height="15"/>
        </svg>
      </div>

      <div style="font-size:11px; color:var(--status-instock); font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:16px;">
        <span class="pulse-dot"></span> Waiting for soundbox payment notification...
      </div>

      <button id="btn-simulate-upi-success" class="btn-primary btn-full" style="height:44px;">
        ${Icons.check(16)} Simulate Customer Scanned & Paid
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close-btn')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  modal.querySelector('#btn-simulate-upi-success')?.addEventListener('click', () => {
    modal.remove();
    onPaid();
  });
}

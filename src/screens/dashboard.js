// Screen: Dashboard & Executive Store Pulse (Kurti Boutique Suite)
import { State } from '../state.js';
import { Icons } from '../icons.js';

export function renderDashboard(container) {
  const currentStore = State.getCurrentStore();
  const isAdmin = State.isAdmin();

  // Stock calculations for current store
  const lowStockItems = State.products.filter(p => {
    const stock = State.getProductStock(p.id, currentStore.id);
    return stock <= p.threshold;
  });

  const totalUnitsAtStore = State.products.reduce((acc, p) => {
    return acc + State.getProductStock(p.id, currentStore.id);
  }, 0);

  // Sales for current store
  const storeBills = State.recentBills.filter(b => currentStore.id === 'ALL' || b.storeId === currentStore.id);
  const todayRevenue = storeBills.reduce((acc, b) => acc + (b.total || 0), 0) + 48900;
  const billCount = storeBills.length + 14;

  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
          <span style="font-size:11px; font-weight:700; color:var(--color-secondary); letter-spacing:0.04em; text-transform:uppercase;">
            ${currentStore.name.toUpperCase()}
          </span>
          <span class="status-pill instock" style="font-size:9px; padding:1px 5px;">
            ${currentStore.code}
          </span>
        </div>
        <h1 class="screen-title">Boutique Executive Pulse</h1>
        <p class="screen-subtitle">Daily Kurti Sales, Stock Thresholds & Operations</p>
      </div>
      <button id="btn-quick-scan" class="icon-btn-ghost" title="Live Camera Scanner">
        ${Icons.camera(18)}
      </button>
    </div>

    <!-- 4-Column Fluid Mobile Metrics Grid -->
    <div class="metrics-grid-2col">
      <div class="metric-widget highlight">
        <div class="metric-header">
          <span class="metric-label">Today's Sales</span>
          <span style="color:var(--color-primary);">${Icons.shoppingBag(16)}</span>
        </div>
        <div class="metric-value">₹${todayRevenue.toLocaleString('en-IN')}</div>
        <div class="metric-trend up">
          ${Icons.trendingUp(12)} +18.4% vs yesterday
        </div>
      </div>

      <div class="metric-widget">
        <div class="metric-header">
          <span class="metric-label">Completed Bills</span>
          <span style="color:var(--text-muted);">${Icons.pos(16)}</span>
        </div>
        <div class="metric-value">${billCount}</div>
        <div class="metric-trend up" style="color:var(--text-secondary);">
          Avg: ₹${Math.round(todayRevenue / billCount).toLocaleString('en-IN')}
        </div>
      </div>

      <div class="metric-widget">
        <div class="metric-header">
          <span class="metric-label">Floor Stock</span>
          <span style="color:var(--text-muted);">${Icons.inventory(16)}</span>
        </div>
        <div class="metric-value">${totalUnitsAtStore} <span style="font-size:12px; font-weight:500; color:var(--text-muted);">Pcs</span></div>
        <div class="metric-trend" style="color:var(--text-secondary); font-size:10px;">
          Across ${State.products.length} Kurti Styles
        </div>
      </div>

      <div class="metric-widget" style="border-left: 3px solid ${lowStockItems.length > 0 ? 'var(--status-lowstock)' : 'var(--status-instock)'};">
        <div class="metric-header">
          <span class="metric-label">Restock Alerts</span>
          <span style="color:${lowStockItems.length > 0 ? 'var(--status-lowstock)' : 'var(--status-instock)'};">
            ${Icons.alert(16)}
          </span>
        </div>
        <div class="metric-value" style="color:${lowStockItems.length > 0 ? 'var(--color-tertiary-dark)' : 'var(--status-instock)'};">
          ${lowStockItems.length}
        </div>
        <div class="metric-trend ${lowStockItems.length > 0 ? 'alert' : 'up'}">
          ${lowStockItems.length > 0 ? 'Low sizes on rack' : 'Rack fully stocked'}
        </div>
      </div>
    </div>

    <!-- Quick Floor Shortcuts -->
    <div style="display:flex; gap:8px; margin-bottom:16px; overflow-x:auto; padding-bottom:2px;">
      <button id="quick-act-pos" class="btn-primary" style="flex:1; height:40px; font-size:12px; white-space:nowrap;">
        ${Icons.plus(14)} New Bill
      </button>
      <button id="quick-act-inventory" class="btn-secondary" style="flex:1; height:40px; font-size:12px; white-space:nowrap;">
        ${Icons.inventory(14)} Stock Lookup
      </button>
      <button id="quick-act-attendance" class="btn-secondary" style="flex:1; height:40px; font-size:12px; white-space:nowrap;">
        ${Icons.attendance(14)} Attendance
      </button>
      ${isAdmin ? `
        <button id="quick-act-reports" class="btn-secondary" style="flex:1; height:40px; font-size:12px; white-space:nowrap;">
          ${Icons.reports(14)} Reports
        </button>
      ` : ''}
    </div>

    <!-- Urgent Floor Restock Alerts -->
    <div class="artisanal-card accent-zari">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="color:var(--color-tertiary);">${Icons.alert(16)}</span>
          <span style="font-weight:700; font-size:13px; color:var(--text-main);">Rack Restock Alerts (${currentStore.code})</span>
        </div>
        <span class="status-pill lowstock">${lowStockItems.length} Low</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px;">
        ${lowStockItems.slice(0, 3).map(item => {
          const storeStock = State.getProductStock(item.id, currentStore.id);
          return `
            <div style="display:flex; align-items:center; justify-content:space-between; background:var(--surface-cream); border:1px solid var(--surface-border); border-radius:6px; padding:8px 10px;">
              <div style="min-width:0; flex:1;">
                <div style="font-weight:600; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${item.name}
                </div>
                <div style="font-family:var(--font-mono); font-size:10px; color:var(--text-muted);">
                  SKU: ${item.sku} • Size: ${item.size}
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:8px; margin-left:8px;">
                <span class="status-pill ${storeStock === 0 ? 'outstock' : 'lowstock'}" style="font-size:10px;">
                  ${storeStock === 0 ? 'Out of Stock' : `${storeStock} left`}
                </span>
                <button class="btn-secondary restock-btn" data-id="${item.id}" style="height:28px; padding:0 8px; font-size:11px;">
                  + Add Stock
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Kurti & Ethnic Category Performance -->
    <div class="artisanal-card">
      <div class="section-label" style="margin-bottom:12px;">
        <span>Sales by Category</span>
        <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-sans);">Volume Share</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px;">
        <div>
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
            <span style="font-weight:600;">Kurti Pant Dupatta Sets</span>
            <span style="font-family:var(--font-mono); font-weight:700;">42% (₹48,200)</span>
          </div>
          <div style="width:100%; height:6px; background:var(--surface-cream); border-radius:3px; overflow:hidden;">
            <div style="width:42%; height:100%; background:var(--color-primary);"></div>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
            <span style="font-weight:600;">Anarkali Festive Sets</span>
            <span style="font-family:var(--font-mono); font-weight:700;">30% (₹34,500)</span>
          </div>
          <div style="width:100%; height:6px; background:var(--surface-cream); border-radius:3px; overflow:hidden;">
            <div style="width:30%; height:100%; background:var(--color-secondary);"></div>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
            <span style="font-weight:600;">Daily Mulmul & Cotton Kurtis</span>
            <span style="font-family:var(--font-mono); font-weight:700;">20% (₹22,800)</span>
          </div>
          <div style="width:100%; height:6px; background:var(--surface-cream); border-radius:3px; overflow:hidden;">
            <div style="width:20%; height:100%; background:var(--color-tertiary);"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Boutique Bills -->
    <div class="artisanal-card">
      <div class="section-label" style="margin-bottom:10px;">
        <span>Recent Kurti Invoices</span>
        <span class="view-all-link" id="link-goto-pos">Open Register →</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px;">
        ${storeBills.slice(0, 3).map(b => `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px dashed var(--surface-border);">
            <div>
              <div style="font-weight:600; font-size:13px; color:var(--text-main);">${b.customerName || 'Walk-in'}</div>
              <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">
                ${b.id} • ${b.time} • ${b.paymentMode}
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-family:var(--font-mono); font-weight:700; font-size:14px; color:var(--color-primary);">
                ₹${b.total.toLocaleString('en-IN')}
              </div>
              <span class="status-pill instock" style="font-size:9px; padding:1px 6px;">Paid</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Bind Events
  container.querySelector('#quick-act-pos')?.addEventListener('click', () => State.setActiveTab('pos'));
  container.querySelector('#quick-act-inventory')?.addEventListener('click', () => State.setActiveTab('inventory'));
  container.querySelector('#quick-act-attendance')?.addEventListener('click', () => State.setActiveTab('attendance'));
  container.querySelector('#quick-act-reports')?.addEventListener('click', () => State.setActiveTab('reports'));
  container.querySelector('#link-goto-pos')?.addEventListener('click', () => State.setActiveTab('pos'));
  container.querySelector('#btn-quick-scan')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-barcode-scanner'));
  });

  // Restock quick buttons
  container.querySelectorAll('.restock-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      State.adjustStock(id, 2, currentStore.id);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Stock increased by +2 for ${id} at ${currentStore.code}`, type: 'success' }
      }));
    });
  });
}

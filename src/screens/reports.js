// Screen: Daily Stock, Sales & Expense Reports
import { State } from '../state.js';
import { Icons } from '../icons.js';

let activeReportTab = 'sales'; // 'sales' | 'stock' | 'expenses'
let reportStoreFilter = 'ALL';

export function renderReports(container) {
  const targetStoreId = reportStoreFilter;
  
  // Filter bills
  const filteredBills = State.recentBills.filter(b => targetStoreId === 'ALL' || b.storeId === targetStoreId);
  const totalSalesAmount = filteredBills.reduce((s, b) => s + b.total, 0);
  const totalBillsCount = filteredBills.length;
  const avgBillValue = totalBillsCount > 0 ? Math.round(totalSalesAmount / totalBillsCount) : 0;

  // Filter expenses
  const filteredExpenses = State.expenses.filter(e => targetStoreId === 'ALL' || e.storeId === targetStoreId);
  const totalExpensesAmount = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  // Stock calculations
  let totalStockUnits = 0;
  let totalMrpValue = 0;
  let totalCostValue = 0;
  let lowStockList = [];

  State.products.forEach(p => {
    let units = 0;
    if (targetStoreId === 'ALL') {
      units = Object.values(p.stockPerStore || {}).reduce((a, b) => a + b, 0);
    } else {
      units = p.stockPerStore?.[targetStoreId] || 0;
    }
    totalStockUnits += units;
    totalMrpValue += (units * p.price);
    totalCostValue += (units * p.costPrice);

    if (units <= p.threshold) {
      lowStockList.push({ ...p, currentUnits: units });
    }
  });

  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <h1 class="screen-title">Executive Reports & Audits</h1>
        <p class="screen-subtitle">Daily Sales, Stock Valuations & Floor Outlays</p>
      </div>
      <button id="btn-print-active-report" class="btn-secondary" style="height:36px; padding:0 10px; font-size:11px;">
        ${Icons.printer(14)} Print Report
      </button>
    </div>

    <!-- Multi-Store Filter Strip -->
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
      <span style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Store:</span>
      <select id="report-store-select" class="form-control" style="height:34px; font-size:12px; flex:1;">
        <option value="ALL" ${reportStoreFilter === 'ALL' ? 'selected' : ''}>All Stores (Consolidated)</option>
        ${State.stores.map(s => `
          <option value="${s.id}" ${reportStoreFilter === s.id ? 'selected' : ''}>${s.name} (${s.code})</option>
        `).join('')}
      </select>
    </div>

    <!-- Report Type Tabs -->
    <div style="display:flex; gap:6px; margin-bottom:14px; background:var(--surface-cream); padding:4px; border-radius:var(--radius-md); border:1px solid var(--surface-border);">
      <button class="view-mode-btn rep-tab-btn ${activeReportTab === 'sales' ? 'active' : ''}" data-tab="sales" style="flex:1; justify-content:center;">
        Daily Sales
      </button>
      <button class="view-mode-btn rep-tab-btn ${activeReportTab === 'stock' ? 'active' : ''}" data-tab="stock" style="flex:1; justify-content:center;">
        Stock Audit
      </button>
      <button class="view-mode-btn rep-tab-btn ${activeReportTab === 'expenses' ? 'active' : ''}" data-tab="expenses" style="flex:1; justify-content:center;">
        Expenses
      </button>
    </div>

    ${activeReportTab === 'sales' ? `
      <!-- Sales Report Section -->
      <div class="metrics-grid-2col">
        <div class="metric-widget highlight">
          <div class="metric-header">
            <span class="metric-label">Sales Revenue</span>
            <span style="color:var(--color-primary);">${Icons.shoppingBag(16)}</span>
          </div>
          <div class="metric-value">₹${totalSalesAmount.toLocaleString('en-IN')}</div>
          <div class="metric-trend up">${totalBillsCount} Invoices Processed</div>
        </div>

        <div class="metric-widget">
          <div class="metric-header">
            <span class="metric-label">Avg Ticket Size</span>
            <span style="color:var(--text-muted);">${Icons.pos(16)}</span>
          </div>
          <div class="metric-value">₹${avgBillValue.toLocaleString('en-IN')}</div>
          <div class="metric-trend" style="color:var(--text-secondary);">Per customer basket</div>
        </div>
      </div>

      <!-- Payment Breakdown -->
      <div class="artisanal-card">
        <div class="section-label" style="margin-bottom:8px;">Tender Distribution</div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; text-align:center;">
          <div style="background:var(--surface-cream); padding:8px; border-radius:6px;">
            <div style="font-size:10px; color:var(--text-muted);">UPI / QR</div>
            <div style="font-family:var(--font-mono); font-weight:700; color:var(--color-primary); font-size:13px;">
              ₹${filteredBills.filter(b => b.paymentMode === 'UPI').reduce((s, b) => s + b.total, 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div style="background:var(--surface-cream); padding:8px; border-radius:6px;">
            <div style="font-size:10px; color:var(--text-muted);">Card POS</div>
            <div style="font-family:var(--font-mono); font-weight:700; color:var(--color-secondary); font-size:13px;">
              ₹${filteredBills.filter(b => b.paymentMode === 'Card' || b.paymentMode === 'Credit Card').reduce((s, b) => s + b.total, 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div style="background:var(--surface-cream); padding:8px; border-radius:6px;">
            <div style="font-size:10px; color:var(--text-muted);">Cash</div>
            <div style="font-family:var(--font-mono); font-weight:700; color:var(--text-main); font-size:13px;">
              ₹${filteredBills.filter(b => b.paymentMode === 'Cash').reduce((s, b) => s + b.total, 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      <!-- Itemized Invoices Table -->
      <div class="artisanal-card">
        <div class="section-label" style="margin-bottom:10px;">
          <span>Daily Invoices Log (${filteredBills.length})</span>
          <span style="font-size:11px; color:var(--text-muted);">Today</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${filteredBills.map(b => {
            const stName = State.stores.find(s => s.id === b.storeId)?.code || 'JBL';
            return `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px dashed var(--surface-border);">
                <div>
                  <div style="font-weight:700; font-size:12px;">${b.customerName || 'Walk-in'}</div>
                  <div style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">
                    ${b.id} • ${stName} • ${b.time} • ${b.paymentMode}
                  </div>
                </div>
                <div style="text-align:right;">
                  <div style="font-family:var(--font-mono); font-weight:700; font-size:14px; color:var(--color-primary);">
                    ₹${b.total.toLocaleString('en-IN')}
                  </div>
                  <span style="font-size:10px; color:var(--text-muted);">${b.itemsCount} pcs</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}

    ${activeReportTab === 'stock' ? `
      <!-- Stock Audit Section -->
      <div class="metrics-grid-2col">
        <div class="metric-widget highlight">
          <div class="metric-header">
            <span class="metric-label">Stock Valuation</span>
            <span style="color:var(--color-primary);">${Icons.inventory(16)}</span>
          </div>
          <div class="metric-value">₹${(totalMrpValue / 100000).toFixed(2)}L</div>
          <div class="metric-trend up">Cost: ₹${(totalCostValue / 100000).toFixed(2)}L</div>
        </div>

        <div class="metric-widget">
          <div class="metric-header">
            <span class="metric-label">Total Units</span>
            <span style="color:var(--text-muted);">${Icons.tag(16)}</span>
          </div>
          <div class="metric-value">${totalStockUnits}</div>
          <div class="metric-trend" style="color:var(--text-secondary);">${State.products.length} active SKUs</div>
        </div>
      </div>

      <!-- Critical Low Stock Thresholds -->
      <div class="artisanal-card accent-zari">
        <div class="section-label" style="margin-bottom:8px;">
          <span>Restock Threshold Alerts (${lowStockList.length})</span>
          <span class="status-pill lowstock" style="font-size:9px;">Urgent</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:6px;">
          ${lowStockList.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-cream); padding:6px 10px; border-radius:6px; font-size:11px;">
              <div>
                <strong>${item.name}</strong><br/>
                <span style="font-family:var(--font-mono); color:var(--text-muted); font-size:10px;">${item.sku} • ${item.size}</span>
              </div>
              <span class="status-pill ${item.currentUnits === 0 ? 'outstock' : 'lowstock'}" style="font-size:10px;">
                ${item.currentUnits === 0 ? '0 Out of Stock' : `${item.currentUnits} Left`}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Category Inventory Breakdown -->
      <div class="artisanal-card">
        <div class="section-label">Category Unit Allocations</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${State.masterData.categories.map(cat => {
            const catProds = State.products.filter(p => p.category === cat);
            const units = catProds.reduce((sum, p) => {
              if (targetStoreId === 'ALL') return sum + Object.values(p.stockPerStore || {}).reduce((a, b) => a + b, 0);
              return sum + (p.stockPerStore?.[targetStoreId] || 0);
            }, 0);
            if (units === 0 && catProds.length === 0) return '';
            return `
              <div style="display:flex; justify-content:space-between; font-size:12px; border-bottom:1px dashed var(--surface-border); padding-bottom:4px;">
                <span>${cat}</span>
                <span style="font-family:var(--font-mono); font-weight:700;">${units} pcs</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}

    ${activeReportTab === 'expenses' ? `
      <!-- Expenses Section -->
      <div class="artisanal-card accent-rose">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:11px; font-weight:700; color:var(--color-secondary); text-transform:uppercase;">
              TOTAL DISBURSED EXPENSES
            </div>
            <div style="font-family:var(--font-mono); font-size:22px; font-weight:700; color:var(--color-primary);">
              ₹${totalExpensesAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <span class="status-pill outstock">${filteredExpenses.length} Vouchers</span>
        </div>
      </div>

      <div class="artisanal-card">
        <div class="section-label">Expense Category Tally</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${filteredExpenses.map(exp => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px dashed var(--surface-border);">
              <div>
                <div style="font-weight:600; font-size:12px;">${exp.title}</div>
                <div style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">
                  ${exp.time} • ${exp.category} • Paid via ${exp.paidVia}
                </div>
              </div>
              <div style="font-family:var(--font-mono); font-weight:700; color:var(--status-outstock); font-size:13px;">
                -₹${exp.amount.toLocaleString('en-IN')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  // Bind Events
  container.querySelector('#report-store-select')?.addEventListener('change', (e) => {
    reportStoreFilter = e.target.value;
    renderReports(container);
  });

  container.querySelectorAll('.rep-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeReportTab = e.currentTarget.dataset.tab;
      renderReports(container);
    });
  });

  container.querySelector('#btn-print-active-report')?.addEventListener('click', () => {
    window.print();
  });
}
